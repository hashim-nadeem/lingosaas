"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Bell,
  FolderKanban,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import type { Role } from "@prisma/client";
import { Link, usePathname } from "@/i18n/navigation";
import { Logo } from "./logo";
import { WorkspaceSwitcher } from "./workspace-switcher";
import { cn } from "@/lib/utils/cn";

const NAV = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/projects", labelKey: "projects", icon: FolderKanban },
  { href: "/team", labelKey: "team", icon: Users },
  { href: "/notifications", labelKey: "notifications", icon: Bell },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const;

export function Sidebar({
  workspaces,
  activeId,
  unreadCount,
}: {
  workspaces: { id: string; name: string; slug: string; role: Role }[];
  activeId: string;
  unreadCount: number;
}) {
  const [open, setOpen] = useState(false);
  const t = useTranslations("nav");

  return (
    <>
      {/* Mobile bar. The sidebar itself is hidden below lg. */}
      <div className="flex items-center gap-3 border-b border-border bg-surface px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label={t("openMenu")}
          className="rounded-lg p-1.5 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
        >
          <Menu className="size-5" aria-hidden="true" />
        </button>
        <Logo />
      </div>

      {open && (
        <div
          className="fixed inset-0 z-(--z-overlay) bg-black/40 lg:hidden motion-safe:animate-in motion-safe:fade-in-0"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "flex w-68 shrink-0 flex-col gap-4 border-e border-border bg-surface p-3",
          // Slides in from the reading edge, so it feels native in both directions.
          "fixed inset-block-0 inset-inline-start-0 z-(--z-sidebar) transition-transform duration-(--duration-normal) ease-(--ease-out-soft)",
          "lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full rtl:translate-x-full lg:rtl:translate-x-0",
        )}
      >
        <div className="flex items-center justify-between px-1 pt-1">
          <Link href="/dashboard" className="rounded-lg">
            <Logo />
          </Link>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label={t("closeMenu")}
            className="rounded-lg p-1.5 text-foreground-muted hover:bg-surface-muted lg:hidden"
          >
            <X className="size-4.5" aria-hidden="true" />
          </button>
        </div>

        <WorkspaceSwitcher workspaces={workspaces} activeId={activeId} />

        <nav className="flex flex-col gap-0.5" aria-label={t("dashboard")}>
          {NAV.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={t(item.labelKey)}
              badge={item.labelKey === "notifications" ? unreadCount : 0}
              onNavigate={() => setOpen(false)}
            />
          ))}
        </nav>
      </aside>
    </>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  badge,
  onNavigate,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge: number;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  // `/projects` must stay active on `/projects/abc`, but `/` must not match all.
  const active = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium",
        "transition-colors duration-(--duration-fast)",
        active
          ? "bg-accent-soft text-accent"
          : "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
      )}
    >
      <Icon className="size-4.5 shrink-0" aria-hidden="true" />
      <span className="flex-1 truncate">{label}</span>
      {badge > 0 && (
        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1.5 text-[0.7rem] font-semibold text-accent-foreground tabular">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
