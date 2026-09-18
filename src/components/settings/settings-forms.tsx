"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { updatePreferencesAction, updateProfileAction } from "@/actions/settings";
import { updateWorkspaceAction } from "@/actions/workspace";
import type { ActionState } from "@/actions/auth";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { useMessage } from "@/lib/i18n/use-message";
import { localeList } from "@/lib/i18n/config";

const EMPTY: ActionState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const t = useTranslations("settings.profile");
  const tAuth = useTranslations("auth.fields");
  const m = useMessage();
  const [state, action] = useActionState(updateProfileAction, EMPTY);

  return (
    <SettingsCard title={t("title")} description={t("subtitle")} action={action} state={state}>
      <Field label={tAuth("name")} error={state.fieldErrors?.name && m(state.fieldErrors.name)} required>
        {(props) => <Input {...props} name="name" defaultValue={name} autoComplete="name" required />}
      </Field>

      <Field label={tAuth("email")}>
        {(props) => (
          // Read-only: changing an identity needs verification the MVP cannot do.
          <Input {...props} value={email} dir="ltr" disabled readOnly />
        )}
      </Field>
    </SettingsCard>
  );
}

const THEMES = ["LIGHT", "DARK", "SYSTEM"] as const;

export function PreferencesForm({
  locale,
  timezone,
  theme,
  notifyInApp,
  notifyEmail,
  timezones,
}: {
  locale: string;
  timezone: string;
  theme: (typeof THEMES)[number];
  notifyInApp: boolean;
  notifyEmail: boolean;
  timezones: string[];
}) {
  const t = useTranslations("settings.preferences");
  const m = useMessage();
  const [state, action] = useActionState(updatePreferencesAction, EMPTY);

  return (
    <SettingsCard title={t("title")} description={t("subtitle")} action={action} state={state}>
      <Field label={t("language")} hint={t("languageHint")}>
        {(props) => (
          <Select {...props} name="locale" defaultValue={locale}>
            {localeList.map((option) => (
              <option key={option.code} value={option.code}>
                {option.nativeName} · {option.region}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field
        label={t("timezone")}
        hint={t("timezoneHint")}
        error={state.fieldErrors?.timezone && m(state.fieldErrors.timezone)}
      >
        {(props) => (
          <Select {...props} name="timezone" defaultValue={timezone} dir="ltr">
            {timezones.map((zone) => (
              <option key={zone} value={zone}>
                {zone.replace(/_/g, " ")}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <Field label={t("theme")}>
        {(props) => (
          <Select {...props} name="theme" defaultValue={theme}>
            {THEMES.map((option) => (
              <option key={option} value={option}>
                {t(`themes.${option}`)}
              </option>
            ))}
          </Select>
        )}
      </Field>

      <fieldset className="flex flex-col gap-2.5">
        <legend className="mb-1 text-sm font-medium text-foreground">{t("notifications")}</legend>
        <Checkbox name="notifyInApp" label={t("notifyInApp")} defaultChecked={notifyInApp} />
        <Checkbox name="notifyEmail" label={t("notifyEmail")} defaultChecked={notifyEmail} />
      </fieldset>
    </SettingsCard>
  );
}

export function WorkspaceForm({
  name,
  slug,
  description,
}: {
  name: string;
  slug: string;
  description: string;
}) {
  const t = useTranslations("settings.workspace");
  const m = useMessage();
  const [state, action] = useActionState(updateWorkspaceAction, EMPTY);

  return (
    <SettingsCard title={t("title")} description={t("subtitle")} action={action} state={state}>
      <Field label={t("name")} error={state.fieldErrors?.name && m(state.fieldErrors.name)} required>
        {(props) => <Input {...props} name="name" defaultValue={name} required />}
      </Field>

      <Field label={t("slug")}>
        {(props) => <Input {...props} value={slug} dir="ltr" disabled readOnly />}
      </Field>

      <Field label={t("description")}>
        {(props) => <Textarea {...props} name="description" defaultValue={description} rows={3} />}
      </Field>
    </SettingsCard>
  );
}

function SettingsCard({
  title,
  description,
  action,
  state,
  children,
}: {
  title: string;
  description: string;
  action: (formData: FormData) => void;
  state: ActionState;
  children: React.ReactNode;
}) {
  const tCommon = useTranslations("common");

  return (
    <form action={action} noValidate>
      <Card>
        <div className="flex flex-col gap-1 border-b border-border p-5">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          <p className="text-sm text-foreground-muted">{description}</p>
        </div>

        <div className="flex flex-col gap-4 p-5">
          <FormError messageKey={state.error} />
          {children}
        </div>

        <div className="flex justify-end border-t border-border px-5 py-3">
          <SubmitButton size="sm">{tCommon("save")}</SubmitButton>
        </div>
      </Card>
    </form>
  );
}

function Checkbox({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex items-center gap-2.5 text-sm text-foreground">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="size-4 rounded border-border text-accent accent-[var(--color-accent)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      />
      {label}
    </label>
  );
}
