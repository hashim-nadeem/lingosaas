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

/** Parses the flat `translations.<locale>.<field>` FormData shape. */
export function projectFromFormData(formData: FormData) {
  const translations: Record<string, { name?: string; description?: string }> = {};

  for (const locale of locales) {
    const name = formData.get(`translations.${locale}.name`);
    const description = formData.get(`translations.${locale}.description`);
    translations[locale] = {
      name: typeof name === "string" ? name : undefined,
      description: typeof description === "string" ? description : undefined,
    };
  }

  return projectSchema.safeParse({
    status: formData.get("status"),
    translations,
  });
}
