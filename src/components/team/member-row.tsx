import { getTranslations } from "next-intl/server";
import type { Role } from "@prisma/client";
import { RoleBadge } from "@/components/ui/badge";
import { LocaleAwareDate } from "@/components/localization/locale-aware";
import { canAssignRole, canManageMember } from "@/lib/permissions";
import { MemberActions } from "./member-actions";

type Member = {
  id: string;
  role: Role;
  createdAt: Date;
  user: { id: string; name: string; email: string; image: string | null };
};

export async function MemberRow({
  member,
  actorRole,
  isSelf,
}: {
  member: Member;
  actorRole: Role;
  isSelf: boolean;
}) {
  const t = await getTranslations("team");

  // Mirrors the server-side rank checks exactly. The UI hides what the action
  // would reject anyway — the action is still the authority.
  const mayManage = !isSelf && canManageMember(actorRole, member.role);
  const mayChangeRole =
    !isSelf &&
    (["ADMIN", "MEMBER"] as const).some((target) =>
      canAssignRole(actorRole, member.role, target),
    );

  return (
    <li className="flex items-center gap-3 border-b border-border px-5 py-3.5 last:border-0 sm:gap-4">
      <span
        aria-hidden="true"
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent"
      >
        {[...member.user.name.trim()][0]?.toUpperCase() ?? "?"}
      </span>

      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-sm font-medium text-foreground">{member.user.name}</span>
        {/* Email stays LTR even on the Arabic page — an RTL address reads wrong. */}
        <span className="truncate text-xs text-foreground-subtle" dir="ltr">
          {member.user.email}
        </span>
      </span>

      <span className="hidden text-xs text-foreground-subtle md:block">
        {t("fields.joined")}: <LocaleAwareDate value={member.createdAt} style="medium" />
      </span>

      <RoleBadge role={member.role} label={t(`roles.${member.role}`)} />

      {(mayManage || mayChangeRole) && (
        <MemberActions
          memberId={member.id}
          memberName={member.user.name}
          currentRole={member.role}
          actorRole={actorRole}
          canRemove={mayManage}
        />
      )}
    </li>
  );
}
