"use client";

import { useTranslations } from "next-intl";
import { motion, useReducedMotion } from "motion/react";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { href: "/settings/profile", key: "profile" },
  { href: "/settings/preferences", key: "preferences" },
  { href: "/settings/workspace", key: "workspace" },
] as const;

/**
 * The indicator is a shared `layoutId`, so it slides between tabs instead of
 * cutting. Motion mirrors the travel direction automatically under `dir="rtl"`
 * because it animates the element's real box, not a hardcoded x offset.
 */
export function SettingsTabs() {
  const t = useTranslations("settings.tabs");
  const pathname = usePathname();
  const reduced = useReducedMotion();

  return (
    <nav className="-mx-4 flex gap-1 overflow-x-auto border-b border-border px-4 sm:mx-0 sm:px-0">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative shrink-0 px-3 py-2.5 text-sm font-medium transition-colors duration-(--duration-fast)",
              active ? "text-accent" : "text-foreground-muted hover:text-foreground",
            )}
          >
            {t(tab.key)}
            {active && (
              <motion.span
                layoutId={reduced ? undefined : "settings-tab-indicator"}
                className="absolute inset-inline-0 bottom-0 block h-0.5 rounded-full bg-accent"
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
