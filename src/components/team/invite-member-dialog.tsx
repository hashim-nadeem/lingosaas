"use client";

import { useActionState, useId, useState } from "react";
import { useTranslations } from "next-intl";
import { UserPlus } from "lucide-react";
import type { Role } from "@prisma/client";
import { inviteMemberAction } from "@/actions/workspace";
import type { ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Field, Input, Select } from "@/components/ui/field";
import { FormError, SubmitButton } from "@/components/ui/form-status";
import { useMessage } from "@/lib/i18n/use-message";
import { canAssignRole } from "@/lib/permissions";

const EMPTY: ActionState = {};

export function InviteMemberDialog({ actorRole }: { actorRole: Role }) {
  const t = useTranslations("team");
  const m = useMessage();
  const [open, setOpen] = useState(false);
  const [state, action, isPending] = useActionState(inviteMemberAction, EMPTY);
  const formId = useId();

  // Only roles this actor may actually grant — an admin never sees "Owner".
  // The server re-checks the same rule; this just avoids offering a failure.
  const grantable = (["ADMIN", "MEMBER"] as const).filter((role) =>
    canAssignRole(actorRole, "MEMBER", role),
  );

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <UserPlus className="size-4" aria-hidden="true" />
        {t("invite")}
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("inviteTitle")}
        description={t("inviteSubtitle")}
        body={
          // The `form` attribute lets the submit button sit in the dialog
          // footer while the fields stay here — no nested-form hacks.
          <form id={formId} action={action} className="flex flex-col gap-4" noValidate>
            <FormError messageKey={state.error} />

            <Field
              label={t("fields.email")}
              error={state.fieldErrors?.email && m(state.fieldErrors.email)}
              required
            >
              {(props) => (
                <Input
                  {...props}
                  name="email"
                  type="email"
                  dir="ltr"
                  autoComplete="off"
                  placeholder="teammate@example.com"
                  required
                />
              )}
            </Field>

            <Field label={t("fields.role")} required>
              {(props) => (
                <Select {...props} name="role" defaultValue="MEMBER">
                  {grantable.map((role) => (
                    <option key={role} value={role}>
                      {t(`roles.${role}`)}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </form>
        }
        footer={
          <SubmitButton form={formId} size="sm" pending={isPending}>
            {t("invite")}
          </SubmitButton>
        }
      />
    </>
  );
}
