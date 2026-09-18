"use server";

import bcrypt from "bcryptjs";
import { unstable_rethrow } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/db/client";
import { defaultLocale, isLocale, localeConfigs } from "@/lib/i18n/config";
import { loginSchema, registerSchema } from "@/lib/validations/auth";
import { uniqueSlug } from "@/lib/utils/slug";

/**
 * Actions return translation KEYS, never prose — the client resolves them with
 * next-intl so an error message is localized like the rest of the page.
 */
export type ActionState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

const BCRYPT_ROUNDS = 12;

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const locale = localeFrom(formData);

  try {
    await signIn("credentials", {
      ...parsed.data,
      redirectTo: `/${locale}/dashboard`,
    });
  } catch (error) {
    // signIn throws a redirect on success; that must reach the framework.
    unstable_rethrow(error);
    if (error instanceof AuthError) return { error: "auth.login.invalidCredentials" };
    throw error;
  }

  return {};
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return { fieldErrors: fieldErrorsFrom(parsed.error) };
  }

  const { name, email, password } = parsed.data;
  const locale = localeFrom(formData);

  const existing = await prisma.user.findUnique({ where: { email }, select: { id: true } });
  if (existing) return { fieldErrors: { email: "auth.register.emailTaken" } };

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const workspaceName = defaultWorkspaceName(name, locale);
  const slug = await uniqueSlug(workspaceName, async (candidate) =>
    Boolean(await prisma.workspace.findUnique({ where: { slug: candidate }, select: { id: true } })),
  );

  // One transaction: a user without a workspace, or a workspace without an
  // owner membership, would both be broken states for the app shell.
  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash,
          preference: {
            create: { locale, timezone: localeConfigs[locale].timezone },
          },
        },
        select: { id: true },
      });

      const workspace = await tx.workspace.create({
        data: { name: workspaceName, slug, ownerId: user.id },
        select: { id: true },
      });

      await tx.workspaceMember.create({
        data: { workspaceId: workspace.id, userId: user.id, role: "OWNER" },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          workspaceId: workspace.id,
          type: "WELCOME",
          messageKey: "WELCOME",
          params: { name },
        },
      });
    });
  } catch {
    // Unique violation from a concurrent signup, or the database is unreachable.
    return { error: "errors.formFailed" };
  }

  try {
    await signIn("credentials", { email, password, redirectTo: `/${locale}/dashboard` });
  } catch (error) {
    unstable_rethrow(error);
    // The account exists; send them to sign in manually rather than 500.
    if (error instanceof AuthError) return { error: "auth.login.invalidCredentials" };
    throw error;
  }

  return {};
}

function fieldErrorsFrom(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** The locale is a hidden form field; never trust it without validating. */
function localeFrom(formData: FormData) {
  const value = formData.get("locale");
  return isLocale(value) ? value : defaultLocale;
}

function defaultWorkspaceName(name: string, locale: string) {
  const first = name.trim().split(/\s+/)[0];
  if (locale === "es-MX") return `Espacio de ${first}`;
  if (locale === "ar-AE") return `مساحة ${first}`;
  return `${first}'s Workspace`;
}
