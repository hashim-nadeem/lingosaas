"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { deleteWorkspaceAction } from "@/actions/workspace";
import type { ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/form-status";

const EMPTY: ActionState = {};

/**
 * Deleting a tenant is irreversible, so the confirmation is typing the slug —
 * not a button that a misclick can reach. The server re-checks the typed value.
 */
export function DeleteWorkspaceCard({ slug }: { slug: string }) {
  const t = useTranslations("settings.workspace");
  const [state, action] = useActionState(deleteWorkspaceAction, EMPTY);
  const [typed, setTyped] = useState("");

  return (
    <Card className="border-danger/25">
      <div className="flex flex-col gap-1 border-b border-danger/20 bg-danger-soft/50 p-5">
        <h2 className="text-base font-semibold tracking-tight text-foreground">{t("dangerZone")}</h2>
        <p className="text-sm text-foreground-muted">{t("deleteHint")}</p>
      </div>

      <form action={action} className="flex flex-col gap-4 p-5">
        <Field label={t("deleteConfirmLabel", { slug })} error={state.error ? " " : undefined}>
          {(props) => (
            <Input
              {...props}
              name="confirm"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              dir="ltr"
              autoComplete="off"
              placeholder={slug}
            />
          )}
        </Field>

        <div className="flex justify-end">
          {typed === slug ? (
            <SubmitButton variant="danger" size="sm">
              {t("deleteWorkspace")}
            </SubmitButton>
          ) : (
            <Button variant="danger" size="sm" disabled>
              {t("deleteWorkspace")}
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}
