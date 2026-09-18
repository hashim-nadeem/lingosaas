"use client";

import { useActionState, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { createProjectAction, updateProjectAction } from "@/actions/projects";
import type { ActionState } from "@/actions/auth";
import { Card } from "@/components/ui/card";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { Button } from "@/components/ui/button";
import { useMessage } from "@/lib/i18n/use-message";
import { localeList, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

type TranslationValue = { name: string; description: string };

const STATUSES = ["PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const;

const EMPTY: ActionState = {};

/**
 * One form, one tab per locale. Each locale's inputs stay mounted (hidden with
 * CSS, not unmounted) so every translation is submitted in a single request —
 * switching tabs must never silently drop what was typed.
 */
export function ProjectForm({
  projectId,
  initialStatus = "PLANNING",
  initialTranslations = {},
}: {
  projectId?: string;
  initialStatus?: (typeof STATUSES)[number];
  initialTranslations?: Partial<Record<Locale, TranslationValue>>;
}) {
  const t = useTranslations("projects");
  const tCommon = useTranslations("common");
  const m = useMessage();
  const router = useRouter();
  const locale = useLocale();
  const [active, setActive] = useState<Locale>("en-US");

  const [state, action] = useActionState(
    projectId ? updateProjectAction : createProjectAction,
    EMPTY,
  );

  return (
    <form action={action} className="flex flex-col gap-5" noValidate>
      {projectId && <input type="hidden" name="id" value={projectId} />}
      {/* Where to redirect after success; re-validated server-side. */}
      <input type="hidden" name="locale" value={locale} />

      <FormError messageKey={state.error} />

      <Card className="p-5">
        <Field label={t("fields.status")} required>
          {(props) => (
            <Select {...props} name="status" defaultValue={initialStatus}>
              {STATUSES.map((status) => (
                <option key={status} value={status}>
                  {t(`status.${status}`)}
                </option>
              ))}
            </Select>
          )}
        </Field>
      </Card>

      <Card>
        <div className="flex flex-col gap-1 border-b border-border p-5 pb-4">
          <h2 className="text-base font-semibold tracking-tight text-foreground">
            {t("fields.translations")}
          </h2>
          <p className="text-sm text-foreground-muted">{t("translationHint")}</p>
        </div>

        <div
          role="tablist"
          aria-label={t("fields.translations")}
          className="flex gap-1 border-b border-border p-2"
        >
          {localeList.map((option) => {
            const selected = option.code === active;
            const hasError = Object.keys(state.fieldErrors ?? {}).some((key) =>
              key.startsWith(`translations.${option.code}`),
            );
            return (
              <button
                key={option.code}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(option.code)}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium",
                  "transition-colors duration-(--duration-fast)",
                  selected
                    ? "bg-accent-soft text-accent"
                    : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
                  hasError && "text-danger",
                )}
              >
                <span aria-hidden="true">{option.flag}</span>
                <span lang={option.code}>{option.nativeName}</span>
                {option.code === "en-US" && (
                  <span className="text-danger" aria-hidden="true">
                    *
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {localeList.map((option) => (
          <div
            key={option.code}
            role="tabpanel"
            // Hidden, not unmounted: an unmounted input submits nothing.
            hidden={option.code !== active}
            className="flex flex-col gap-4 p-5"
          >
            <Field
              label={t("fields.name")}
              error={
                state.fieldErrors?.[`translations.${option.code}.name`] &&
                m(state.fieldErrors[`translations.${option.code}.name`])
              }
              required={option.code === "en-US"}
            >
              {(props) => (
                <Input
                  {...props}
                  name={`translations.${option.code}.name`}
                  defaultValue={initialTranslations[option.code]?.name ?? ""}
                  // Each field renders in its OWN locale's direction, so an
                  // Arabic name reads correctly while editing from English.
                  dir={option.direction}
                  lang={option.code}
                />
              )}
            </Field>

            <Field
              label={t("fields.description")}
              error={
                state.fieldErrors?.[`translations.${option.code}.description`] &&
                m(state.fieldErrors[`translations.${option.code}.description`])
              }
            >
              {(props) => (
                <Textarea
                  {...props}
                  name={`translations.${option.code}.description`}
                  defaultValue={initialTranslations[option.code]?.description ?? ""}
                  dir={option.direction}
                  lang={option.code}
                  rows={4}
                />
              )}
            </Field>
          </div>
        ))}
      </Card>

      <div className="flex items-center justify-end gap-2">
        <Button type="button" variant="secondary" onClick={() => router.back()}>
          {tCommon("cancel")}
        </Button>
        <SubmitButton>{projectId ? tCommon("save") : tCommon("create")}</SubmitButton>
      </div>
    </form>
  );
}
