import { setRequestLocale } from "next-intl/server";
import { Sidebar } from "@/components/layout/sidebar";
import { UserMenu } from "@/components/layout/user-menu";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import { listUserWorkspaces, requireWorkspace } from "@/lib/db/context";
import { countUnreadNotifications, getUserPreference } from "@/lib/db/team";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // One authorization call for the whole shell; the pages below re-verify
  // independently, so a page rendered outside this layout is still protected.
  const { user, workspace } = await requireWorkspace();
  const [workspaces, unreadCount, preference] = await Promise.all([
    listUserWorkspaces(user.id),
    countUnreadNotifications(),
    getUserPreference(user.id),
  ]);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas lg:flex-row">
      <Sidebar workspaces={workspaces} activeId={workspace.id} unreadCount={unreadCount} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-(--z-header) flex items-center justify-end gap-2 border-b border-border bg-canvas/85 px-4 py-2.5 backdrop-blur-sm sm:px-6">
          <LanguageSwitcher compact />
          <UserMenu name={user.name} email={user.email} initialTheme={preference?.theme ?? "SYSTEM"} />
        </header>

        <main id="main" className="flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
