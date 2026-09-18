"use client";

import { useActionState } from "react";
import { useTranslations, useFormatter } from "next-intl";
import { MailClock } from "lucide-react";
import type { Role } from "@prisma/client";
import { revokeInvitationAction } from "@/actions/workspace";
import type { ActionState } from "@/actions/auth";
import { RoleBadge } from "@/components/ui/badge";
import { SubmitButton } from "@/components/ui/form-status";

const EMPTY: ActionState = {};

export function InvitationRow({
  invitation,
}: {
  invitation: { id: string; email: string; role: Role; expiresAt: Date; createdAt: Date };
}) {
  const t = useTranslations("team");
  const format = useFormatter();
  const [, action] = useActionState(revokeInvitationAction, EMPTY);

  return (
    <li className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-0 sm:gap-4">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-warning-soft text-warning"
      >
        <MailClock className="size-4" />
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground" dir="ltr">
          {invitation.email}
        </span>
        <span className="text-xs text-foreground-subtle">
          {t("expires", { date: format.dateTime(invitation.expiresAt, "medium") })}
        </span>
      </span>

      <RoleBadge role={invitation.role} label={t(`roles.${invitation.role}`)} />

      <form action={action}>
        <input type="hidden" name="id" value={invitation.id} />
        <SubmitButton variant="ghost" size="sm">
          {t("revoke")}
        </SubmitButton>
      </form>
    </li>
  );
}
