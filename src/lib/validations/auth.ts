import { z } from "zod";

// Messages are translation KEYS, not prose. The form layer resolves them
// through next-intl so validation errors are localized like everything else.
export const emailSchema = z.string().trim().toLowerCase().email({ message: "validation.email" });

export const passwordSchema = z
  .string()
  .min(8, { message: "validation.passwordWeak" })
  .regex(/[a-zA-Z]/, { message: "validation.passwordWeak" })
  .regex(/[0-9]/, { message: "validation.passwordWeak" });

export const loginSchema = z.object({
  email: emailSchema,
  // Login must not leak the password policy — any non-empty value is accepted
  // here and rejected by credential comparison.
  password: z.string().min(1, { message: "validation.required" }),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, { message: "validation.minLength" }).max(80, { message: "validation.maxLength" }),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "validation.passwordMismatch",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
