import { getTranslations, setRequestLocale } from "next-intl/server";
import { Users } from "lucide-react";
import { InviteMemberDialog } from "@/components/team/invite-member-dialog";
import { MemberRow } from "@/components/team/member-row";
import { InvitationRow } from "@/components/team/invitation-row";
import { FadeIn } from "@/components/motion/primitives";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { requireWorkspace } from "@/lib/db/context";
import { listMembers, listPendingInvitations } from "@/lib/db/team";
import { can } from "@/lib/permissions";

export default async function TeamPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("team");
  const { user, workspace, role } = await requireWorkspace();
  const [members, invitations] = await Promise.all([listMembers(), listPendingInvitations()]);

  const mayInvite = can(role, "member:invite");

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-foreground-muted">
            {t("subtitle", { workspace: workspace.name })}
          </p>
        </div>
        {mayInvite && <InviteMemberDialog actorRole={role} />}
      </div>

      {members.length <= 1 && !mayInvite ? (
        <EmptyState icon={<Users />} title={t("empty.title")} description={t("empty.description")} />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <ul className="border-t border-border">
            {members.map((member) => (
              <MemberRow
                key={member.id}
                member={member}
                actorRole={role}
                isSelf={member.user.id === user.id}
              />
            ))}
          </ul>
        </Card>
      )}

      {mayInvite && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("pendingInvites")}</CardTitle>
          </CardHeader>
          <ul className="border-t border-border">
            {invitations.map((invitation) => (
              <InvitationRow key={invitation.id} invitation={invitation} />
            ))}
          </ul>
        </Card>
      )}
    </FadeIn>
  );
}
