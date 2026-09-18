"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { MoreHorizontal } from "lucide-react";
import type { Role } from "@prisma/client";
import { changeMemberRoleAction, removeMemberAction } from "@/actions/workspace";
import type { ActionState } from "@/actions/auth";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubmitButton } from "@/components/ui/form-status";
import { canAssignRole } from "@/lib/permissions";
import { cn } from "@/lib/utils/cn";

const EMPTY: ActionState = {};
const ASSIGNABLE = ["ADMIN", "MEMBER"] as const;

export function MemberActions({
  memberId,
  memberName,
  currentRole,
  actorRole,
  canRemove,
}: {
  memberId: string;
  memberName: string;
  currentRole: Role;
  actorRole: Role;
  canRemove: boolean;
}) {
  const t = useTranslations("team");
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [, removeAction] = useActionState(removeMemberAction, EMPTY);
  const [, roleAction] = useActionState(changeMemberRoleAction, EMPTY);

  const assignable = ASSIGNABLE.filter(
    (target) => target !== currentRole && canAssignRole(actorRole, currentRole, target),
  );

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false);
        }}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("changeRole")}
        className="rounded-lg p-1.5 text-foreground-subtle transition-colors hover:bg-surface-muted hover:text-foreground"
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-inline-end-0 top-full z-(--z-dropdown) mt-1.5 w-52 overflow-hidden rounded-xl border border-border bg-surface-raised p-1 shadow-lg"
        >
          {assignable.map((target) => (
            <form key={target} action={roleAction}>
              <input type="hidden" name="memberId" value={memberId} />
              <input type="hidden" name="role" value={target} />
              <button
                type="submit"
                role="menuitem"
                onClick={() => setOpen(false)}
                className="w-full rounded-lg px-2.5 py-2 text-start text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {t("changeRole")} → {t(`roles.${target}`)}
              </button>
            </form>
          ))}

          {canRemove && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                setConfirming(true);
              }}
              className={cn(
                "w-full rounded-lg px-2.5 py-2 text-start text-sm text-foreground-muted",
                "transition-colors hover:bg-danger-soft hover:text-danger",
                assignable.length > 0 && "mt-1 border-t border-border pt-2",
              )}
            >
              {t("remove")}
            </button>
          )}
        </div>
      )}

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        title={t("remove")}
        description={t("removeConfirm", { name: memberName })}
        footer={
          <form action={removeAction}>
            <input type="hidden" name="memberId" value={memberId} />
            <SubmitButton variant="danger" size="sm">
              {t("remove")}
            </SubmitButton>
          </form>
        }
      />
    </div>
  );
}
