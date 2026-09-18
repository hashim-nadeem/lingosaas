import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { getDirection, getLocaleConfig, isLocale, locales, localeConfigs } from "./config";
import { isFallback, pickTranslation } from "./translations";
import {
  formatCurrency,
  formatDate,
  formatNumber,
  formatRelativeTime,
} from "@/lib/formatters";

describe("locale config", () => {
  it("has one config per locale, keyed consistently", () => {
    for (const locale of locales) {
      expect(localeConfigs[locale].code).toBe(locale);
    }
  });

  it("marks only Arabic as RTL", () => {
    expect(getDirection("ar-AE")).toBe("rtl");
    expect(getDirection("en-US")).toBe("ltr");
    expect(getDirection("es-MX")).toBe("ltr");
  });

  it("falls back to the default locale for unknown input", () => {
    // A hand-typed URL or a stale cookie must never crash a render.
    expect(getLocaleConfig("fr-FR").code).toBe("en-US");
    expect(getLocaleConfig("").code).toBe("en-US");
    expect(getDirection("../../etc/passwd")).toBe("ltr");
  });

  it("narrows unknown values with isLocale", () => {
    expect(isLocale("ar-AE")).toBe(true);
    expect(isLocale("ar")).toBe(false);
    expect(isLocale(null)).toBe(false);
    expect(isLocale(123)).toBe(false);
  });

  it("uses a timezone the runtime actually knows", () => {
    for (const locale of locales) {
      const { timezone } = localeConfigs[locale];
      expect(() => new Intl.DateTimeFormat("en-US", { timeZone: timezone })).not.toThrow();
    }
  });
});

describe("translation fallback (PRD §16)", () => {
  const rows = [
    { locale: "en-US", name: "Website Redesign" },
    { locale: "es-MX", name: "Rediseño del sitio web" },
  ];

  it("prefers the requested locale", () => {
    expect(pickTranslation(rows, "es-MX")?.name).toBe("Rediseño del sitio web");
  });

  it("falls back to en-US when the requested locale is missing", () => {
    expect(pickTranslation(rows, "ar-AE")?.name).toBe("Website Redesign");
  });

  it("falls back to whatever exists when en-US is missing too", () => {
    const arabicOnly = [{ locale: "ar-AE", name: "إعادة تصميم الموقع" }];
    expect(pickTranslation(arabicOnly, "es-MX")?.locale).toBe("ar-AE");
  });

  it("returns null rather than an empty string when nothing exists", () => {
    // Callers must render a designed "unavailable" state, not a blank line.
    expect(pickTranslation([], "en-US")).toBeNull();
  });

  it("reports when the rendered row is not the requested one", () => {
    expect(isFallback(pickTranslation(rows, "ar-AE"), "ar-AE")).toBe(true);
    expect(isFallback(pickTranslation(rows, "es-MX"), "es-MX")).toBe(false);
    expect(isFallback(null, "en-US")).toBe(false);
  });
});

describe("regional formatting (PRD §20)", () => {
  it("uses each market's own currency by default", () => {
    expect(formatCurrency(1250.5, "en-US")).toContain("1,250.50");
    expect(formatCurrency(1250.5, "en-US")).toContain("$");
    // AED renders with the Arabic dirham symbol, not a dollar sign.
    expect(formatCurrency(1250.5, "ar-AE")).toContain("د.إ");
    expect(formatCurrency(1250.5, "es-MX")).toContain("1,250.50");
  });

  it("honours an explicit currency override", () => {
    expect(formatCurrency(10, "en-US", "EUR")).toContain("€");
  });

  it("formats dates in each locale's own order and language", () => {
    const date = new Date("2026-03-14T09:30:00Z");
    expect(formatDate(date, "en-US", "long")).toBe("March 14, 2026");
    expect(formatDate(date, "es-MX", "long")).toContain("marzo");
    expect(formatDate(date, "ar-AE", "long")).toContain("مارس"); // مارس
  });

  it("is stable across calls (the formatter cache must not corrupt output)", () => {
    const first = formatNumber(1234567.89, "en-US");
    formatNumber(1234567.89, "ar-AE");
    formatNumber(99, "es-MX");
    expect(formatNumber(1234567.89, "en-US")).toBe(first);
  });

  it("does not let an options object collide in the cache", () => {
    const plain = formatNumber(0.5, "en-US");
    const percent = formatNumber(0.5, "en-US", { style: "percent" });
    expect(plain).not.toBe(percent);
    expect(percent).toContain("50");
  });

  it("produces relative time in the right language and direction of time", () => {
    const now = new Date("2026-03-14T00:00:00Z");
    const threeDaysAgo = new Date("2026-03-11T00:00:00Z");
    const inTwoHours = new Date("2026-03-14T02:00:00Z");

    expect(formatRelativeTime(threeDaysAgo, "en-US", now)).toBe("3 days ago");
    expect(formatRelativeTime(inTwoHours, "en-US", now)).toContain("2 hours");
    expect(formatRelativeTime(threeDaysAgo, "es-MX", now)).toContain("días");
    expect(formatRelativeTime(threeDaysAgo, "ar-AE", now)).toContain("أيام");
  });
});

describe("message catalogues", () => {
  const load = (locale: string) =>
    JSON.parse(readFileSync(new URL(`../../../messages/${locale}.json`, import.meta.url), "utf8"));

  const flatten = (obj: Record<string, unknown>, prefix = ""): string[] =>
    Object.entries(obj).flatMap(([key, value]) =>
      value !== null && typeof value === "object"
        ? flatten(value as Record<string, unknown>, `${prefix}${key}.`)
        : [`${prefix}${key}`],
    );

  const base = flatten(load("en-US")).sort();

  it.each(locales)("%s has exactly the same keys as en-US", (locale) => {
    // A missing key is a runtime crash in next-intl, not a silent blank.
    expect(flatten(load(locale)).sort()).toEqual(base);
  });

  it.each(locales)("%s uses the same ICU placeholders as en-US", (locale) => {
    const en = load("en-US");
    const other = load(locale);
    const get = (obj: Record<string, unknown>, path: string) =>
      path.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown>)?.[k], obj);

    for (const key of base) {
      const enValue = String(get(en, key));
      const otherValue = String(get(other, key));
      // Compare the simple {name} placeholders; plural blocks legitimately
      // differ in structure between English and Arabic.
      const placeholders = (v: string) =>
        [...v.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort();
      expect(placeholders(otherValue), `${locale}: ${key}`).toEqual(placeholders(enValue));
    }
  });
});
