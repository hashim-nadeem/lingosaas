import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema } from "./auth";
import { projectFromFormData, projectSchema } from "./project";
import { slugify, uniqueSlug } from "@/lib/utils/slug";

describe("auth validation", () => {
  it("normalizes email case and whitespace", () => {
    const result = registerSchema.safeParse({
      name: "Amira Haddad",
      email: "  Amira@Example.COM ",
      password: "hunter2024",
      confirmPassword: "hunter2024",
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.email).toBe("amira@example.com");
  });

  it("rejects mismatched passwords on the confirm field", () => {
    const result = registerSchema.safeParse({
      name: "Amira",
      email: "a@b.com",
      password: "hunter2024",
      confirmPassword: "hunter2025",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === "confirmPassword");
      expect(issue?.message).toBe("validation.passwordMismatch");
    }
  });

  it("requires a letter and a digit, not just length", () => {
    for (const weak of ["short1", "alllettersonly", "12345678"]) {
      const result = registerSchema.safeParse({
        name: "Amira",
        email: "a@b.com",
        password: weak,
        confirmPassword: weak,
      });
      expect(result.success, weak).toBe(false);
    }
  });

  it("returns translation keys, never English prose", () => {
    const result = registerSchema.safeParse({
      name: "A",
      email: "nope",
      password: "x",
      confirmPassword: "y",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      for (const issue of result.error.issues) {
        expect(issue.message).toMatch(/^validation\./);
      }
    }
  });

  it("does not apply the password policy at login", () => {
    // Login must accept any non-empty password so the policy cannot be probed.
    expect(loginSchema.safeParse({ email: "a@b.com", password: "x" }).success).toBe(true);
    expect(loginSchema.safeParse({ email: "a@b.com", password: "" }).success).toBe(false);
  });
});

describe("project validation", () => {
  const base = {
    status: "PLANNING",
    translations: { "en-US": { name: "Website Redesign", description: "A description." } },
  };

  it("accepts an en-US-only project", () => {
    expect(projectSchema.safeParse(base).success).toBe(true);
  });

  it("requires en-US, because it is the fallback for every other locale", () => {
    const result = projectSchema.safeParse({
      status: "PLANNING",
      translations: { "ar-AE": { name: "إعادة تصميم الموقع" } },
    });
    expect(result.success).toBe(false);
  });

  it("rejects an unknown status rather than coercing it", () => {
    expect(projectSchema.safeParse({ ...base, status: "DELETED" }).success).toBe(false);
  });

  it("parses the flat FormData shape the form submits", () => {
    const form = new FormData();
    form.set("status", "IN_PROGRESS");
    form.set("translations.en-US.name", "Gulf Market Launch");
    form.set("translations.en-US.description", "Prepare pricing.");
    form.set("translations.ar-AE.name", "إطلاق سوق الخليج");
    form.set("translations.es-MX.name", "");

    const result = projectFromFormData(form);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe("IN_PROGRESS");
      expect(result.data.translations["en-US"].name).toBe("Gulf Market Launch");
      expect(result.data.translations["ar-AE"]?.name).toBe("إطلاق سوق الخليج");
      // A blank locale is absent entirely, not an empty row that would beat
      // the fallback chain.
      expect(result.data.translations["es-MX"]).toBeUndefined();
    }
  });
});

describe("slugify", () => {
  it("folds accents so Spanish names produce clean ASCII slugs", () => {
    expect(slugify("Rediseño del sitio")).toBe("rediseno-del-sitio");
    expect(slugify("Espacio de José")).toBe("espacio-de-jose");
  });

  it("collapses punctuation and trims separators", () => {
    expect(slugify("  Amira's   Workspace!! ")).toBe("amira-s-workspace");
  });

  it("yields an empty string for fully non-Latin input", () => {
    // Documented behaviour: Arabic has no ASCII fold, so callers must handle it.
    expect(slugify("مساحة العمل")).toBe("");
  });

  it("substitutes a stem when the name yields nothing", async () => {
    const slug = await uniqueSlug("مساحة العمل", async () => false);
    expect(slug).toBe("workspace");
  });

  it("suffixes until the slug is free", async () => {
    const taken = new Set(["northwind-global"]);
    const slug = await uniqueSlug("Northwind Global", async (s) => taken.has(s));
    expect(slug).not.toBe("northwind-global");
    expect(slug.startsWith("northwind-global-")).toBe(true);
  });

  it("caps length so a pasted paragraph cannot become the URL", () => {
    expect(slugify("a".repeat(200)).length).toBeLessThanOrEqual(48);
  });
});
