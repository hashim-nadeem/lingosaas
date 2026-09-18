import { z } from "zod";
import { locales } from "@/lib/i18n/config";

const translationSchema = z.object({
  name: z.string().trim().min(1, { message: "validation.required" }).max(120, { message: "validation.maxLength" }),
  description: z
    .string()
    .trim()
    .max(600, { message: "validation.maxLength" })
    .optional()
    .transform((v) => (v ? v : undefined)),
});

export const projectStatusSchema = z.enum(["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"]);

/**
 * en-US is required and acts as the fallback for every other locale, so a
 * project can never render as "translation unavailable" in all three.
 */
export const projectSchema = z.object({
  status: projectStatusSchema,
  translations: z.object({
    "en-US": translationSchema,
    "es-MX": translationSchema.partial().optional(),
    "ar-AE": translationSchema.partial().optional(),
  }),
});

export type ProjectInput = z.infer<typeof projectSchema>;

/**
 * Parses the flat `translations.<locale>.<field>` FormData shape.
 *
 * The form keeps every locale's inputs mounted, so it always submits all three
 * — including empty strings for the tabs the user left alone. Those must become
 * `undefined`, or an untouched Spanish tab would fail `min(1)` and reject an
 * otherwise valid submission.
 */
export function projectFromFormData(formData: FormData) {
  const read = (key: string) => {
    const value = formData.get(key);
    if (typeof value !== "string") return undefined;
    const trimmed = value.trim();
    return trimmed === "" ? undefined : trimmed;
  };

  const translations: Record<string, { name?: string; description?: string } | undefined> = {};

  for (const locale of locales) {
    const name = read(`translations.${locale}.name`);
    const description = read(`translations.${locale}.description`);
    // An entirely blank locale is absent, not an empty row.
    translations[locale] = name === undefined && description === undefined ? undefined : { name, description };
  }

  return projectSchema.safeParse({
    status: formData.get("status"),
    translations,
  });
}
