import { setRequestLocale } from "next-intl/server";
import { WorkspaceForm } from "@/components/settings/settings-forms";
import { DeleteWorkspaceCard } from "@/components/settings/delete-workspace-card";
import { requirePermission } from "@/lib/db/context";
import { can } from "@/lib/permissions";

export default async function WorkspaceSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Members never reach this page — they get the designed 403, not a form
  // that would fail on submit.
  const { workspace, role } = await requirePermission("workspace:update");

  return (
    <div className="flex flex-col gap-6">
      <WorkspaceForm
        name={workspace.name}
        slug={workspace.slug}
        description={workspace.description ?? ""}
      />
      {can(role, "workspace:delete") && (
        <DeleteWorkspaceCard slug={workspace.slug} />
      )}
    </div>
  );
}
