"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/client";
import { requireSession } from "@/lib/db/context";
import { locales } from "@/lib/i18n/config";
import type { ActionState } from "./auth";

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { message: "validation.minLength" })
    .max(80, { message: "validation.maxLength" }),
});

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSession();
  const parsed = profileSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { fieldErrors: { name: parsed.error.issues[0].message } };

  // Email is deliberately not editable here — changing it is an identity change
  // that needs verification, which the MVP has no mail provider for.
  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });

  revalidatePath("/", "layout");
  return {};
}

const preferencesSchema = z.object({
  locale: z.enum(locales),
  // Validated against the runtime's own zone database rather than a hardcoded list.
  timezone: z.string().refine(isValidTimezone, { message: "validation.invalidTimezone" }),
  theme: z.enum(["LIGHT", "DARK", "SYSTEM"]),
  notifyInApp: z.coerce.boolean(),
  notifyEmail: z.coerce.boolean(),
});

export async function updatePreferencesAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSession();

  const parsed = preferencesSchema.safeParse({
    locale: formData.get("locale"),
    timezone: formData.get("timezone"),
    theme: formData.get("theme"),
    notifyInApp: formData.get("notifyInApp") === "on",
    notifyEmail: formData.get("notifyEmail") === "on",
  });

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { fieldErrors: { [String(issue.path[0])]: issue.message } };
  }

  await prisma.userPreference.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...parsed.data },
    update: parsed.data,
  });

  revalidatePath("/", "layout");
  return {};
}

function isValidTimezone(value: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: value });
    return true;
  } catch {
    return false;
  }
}
