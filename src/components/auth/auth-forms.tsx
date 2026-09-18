"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { loginAction, registerAction, type ActionState } from "@/actions/auth";
import { Field, Input } from "@/components/ui/field";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { useMessage } from "@/lib/i18n/use-message";

const EMPTY: ActionState = {};

export function LoginForm() {
  const t = useTranslations("auth");
  const m = useMessage();
  const locale = useLocale();
  const [state, action] = useActionState(loginAction, EMPTY);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {/* Validated server-side against the locale list; never trusted as-is. */}
      <input type="hidden" name="locale" value={locale} />

      <FormError messageKey={state.error} />

      <Field label={t("fields.email")} error={state.fieldErrors?.email && m(state.fieldErrors.email)} required>
        {(props) => (
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            required
          />
        )}
      </Field>

      <Field
        label={t("fields.password")}
        error={state.fieldErrors?.password && m(state.fieldErrors.password)}
        required
      >
        {(props) => <Input {...props} name="password" type="password" autoComplete="current-password" required />}
      </Field>

      <SubmitButton size="lg" className="mt-1 w-full">
        {t("login.submit")}
      </SubmitButton>
    </form>
  );
}

export function RegisterForm() {
  const t = useTranslations("auth");
  const m = useMessage();
  const locale = useLocale();
  const [state, action] = useActionState(registerAction, EMPTY);

  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      <input type="hidden" name="locale" value={locale} />

      <FormError messageKey={state.error} />

      <Field label={t("fields.name")} error={state.fieldErrors?.name && m(state.fieldErrors.name)} required>
        {(props) => <Input {...props} name="name" autoComplete="name" required />}
      </Field>

      <Field label={t("fields.email")} error={state.fieldErrors?.email && m(state.fieldErrors.email)} required>
        {(props) => (
          // Email is always LTR, even on an Arabic page — an RTL-rendered
          // address reads wrong and breaks the user's mental model of it.
          <Input
            {...props}
            name="email"
            type="email"
            autoComplete="email"
            dir="ltr"
            placeholder="you@example.com"
            required
          />
        )}
      </Field>

      <Field
        label={t("fields.password")}
        error={state.fieldErrors?.password && m(state.fieldErrors.password)}
        required
      >
        {(props) => <Input {...props} name="password" type="password" autoComplete="new-password" required />}
      </Field>

      <Field
        label={t("fields.confirmPassword")}
        error={state.fieldErrors?.confirmPassword && m(state.fieldErrors.confirmPassword)}
        required
      >
        {(props) => (
          <Input {...props} name="confirmPassword" type="password" autoComplete="new-password" required />
        )}
      </Field>

      <SubmitButton size="lg" className="mt-1 w-full">
        {t("register.submit")}
      </SubmitButton>
    </form>
  );
}
