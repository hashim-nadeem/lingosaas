"use client";

import { useFormStatus } from "react-dom";
import { useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import { useMessage } from "@/lib/i18n/use-message";
import { Button, type ButtonProps } from "./button";

/**
 * Submit button wired to the parent form's pending state. Disabled while
 * submitting, so a double-click cannot create two accounts.
 */
export function SubmitButton({
  children,
  pendingLabel,
  pending: pendingOverride,
  ...props
}: ButtonProps & { pendingLabel?: string; pending?: boolean }) {
  // useFormStatus only sees a form it is rendered inside. When the button is
  // detached via the `form` attribute (dialog footers), the caller passes
  // `pending` from useActionState instead.
  const status = useFormStatus();
  const pending = pendingOverride ?? status.pending;
  const t = useTranslations("common");

  return (
    <Button type="submit" disabled={pending} aria-busy={pending} {...props}>
      {pending && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
      {pending ? (pendingLabel ?? t("saving")) : children}
    </Button>
  );
}

/**
 * Server actions hand back translation keys; this resolves them.
 * `role="alert"` so screen readers announce the failure without a focus move.
 */
export function FormError({ messageKey }: { messageKey?: string }) {
  const m = useMessage();
  if (!messageKey) return null;

  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2.5 text-sm text-foreground"
    >
      <AlertCircle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
      <span>{m(messageKey)}</span>
    </div>
  );
}
