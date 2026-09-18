"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut, Monitor, Moon, Settings, Sun, User } from "lucide-react";
import { signOutAction } from "@/actions/auth";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

type Theme = "LIGHT" | "DARK" | "SYSTEM";

const THEME_ICON = { LIGHT: Sun, DARK: Moon, SYSTEM: Monitor } as const;

export function UserMenu({
  name,
  email,
  initialTheme,
}: {
  name: string;
  email: string;
  initialTheme: Theme;
}) {
  const t = useTranslations();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(initialTheme);

  function applyTheme(next: Theme) {
    setTheme(next);
    const dark =
      next === "DARK" ||
      (next === "SYSTEM" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    // Mirrors the pre-paint script in ThemeScript; the database copy is the
    // source of truth and is written by the preferences form.
    try {
      localStorage.setItem("lingosaas-theme", next);
    } catch {
      // Private mode or blocked storage — the in-memory switch still works.
    }
  }

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
        className="flex items-center gap-2 rounded-lg p-1 transition-colors hover:bg-surface-muted"
      >
        <span
          aria-hidden="true"
          className="flex size-8 items-center justify-center rounded-full bg-accent-soft text-xs font-semibold text-accent"
        >
          {[...name.trim()][0]?.toUpperCase() ?? "?"}
        </span>
        <span className="sr-only">{name}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute inset-inline-end-0 top-full z-(--z-dropdown) mt-2 w-60 overflow-hidden rounded-xl border border-border bg-surface-raised p-1 shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-foreground">{name}</p>
            <p className="truncate text-xs text-foreground-subtle" dir="ltr">
              {email}
            </p>
          </div>

          <div className="flex items-center gap-1 border-b border-border p-1">
            <span className="sr-only">{t("a11y.toggleTheme")}</span>
            {(["LIGHT", "DARK", "SYSTEM"] as const).map((option) => {
              const Icon = THEME_ICON[option];
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => applyTheme(option)}
                  aria-pressed={theme === option}
                  aria-label={t(`settings.preferences.themes.${option}`)}
                  title={t(`settings.preferences.themes.${option}`)}
                  className={cn(
                    "flex flex-1 items-center justify-center rounded-md py-1.5 transition-colors",
                    theme === option
                      ? "bg-accent-soft text-accent"
                      : "text-foreground-muted hover:bg-surface-muted",
                  )}
                >
                  <Icon className="size-4" aria-hidden="true" />
                </button>
              );
            })}
          </div>

          <Link
            href="/settings/profile"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <User className="size-4" aria-hidden="true" />
            {t("settings.tabs.profile")}
          </Link>
          <Link
            href="/settings/preferences"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
          >
            <Settings className="size-4" aria-hidden="true" />
            {t("settings.tabs.preferences")}
          </Link>

          {/* A form, not a link: signing out must not be triggerable by a
              prefetch or a crawler following a GET. */}
          <form action={signOutAction} className="border-t border-border pt-1">
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm text-foreground-muted transition-colors hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="size-4 rtl-flip" aria-hidden="true" />
              {t("common.signOut")}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
