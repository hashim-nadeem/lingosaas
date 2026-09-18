"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import type { Role } from "@prisma/client";
import { switchWorkspaceAction } from "@/actions/workspace";
import { cn } from "@/lib/utils/cn";

type WorkspaceOption = { id: string; name: string; slug: string; role: Role };

export function WorkspaceSwitcher({
  workspaces,
  activeId,
  onCreate,
}: {
  workspaces: WorkspaceOption[];
  activeId: string;
  onCreate?: () => void;
}) {
  const t = useTranslations("workspace");
  const tRoles = useTranslations("team.roles");
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const active = workspaces.find((w) => w.id === activeId) ?? workspaces[0];

  function select(id: string) {
    setOpen(false);
    if (id === activeId) return;
    startTransition(() => {
      // Server action: the cookie is set httpOnly and membership re-verified.
      void switchWorkspaceAction(id);
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        onBlur={(e) => {
          if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) setOpen(false);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("switch")}
        disabled={pending}
        className={cn(
          "flex w-full items-center gap-2.5 rounded-lg border border-border bg-surface px-2.5 py-2",
          "text-start transition-colors duration-(--duration-fast)",
          "hover:border-border-strong hover:bg-surface-muted disabled:opacity-60",
        )}
      >
        <span
          aria-hidden="true"
          className="flex size-7 shrink-0 items-center justify-center rounded-md bg-accent text-xs font-semibold text-accent-foreground"
        >
          {initials(active.name)}
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-medium text-foreground">{active.name}</span>
          <span className="truncate text-xs text-foreground-subtle">{tRoles(active.role)}</span>
        </span>
        {pending ? (
          <Loader2 className="size-4 shrink-0 animate-spin text-foreground-subtle" aria-hidden="true" />
        ) : (
          <ChevronsUpDown className="size-4 shrink-0 text-foreground-subtle" aria-hidden="true" />
        )}
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("switch")}
          className={cn(
            "absolute inset-inline-start-0 top-full z-(--z-dropdown) mt-1.5 w-full min-w-56",
            "overflow-hidden rounded-xl border border-border bg-surface-raised p-1 shadow-lg",
          )}
        >
          {workspaces.map((workspace) => (
            <li key={workspace.id}>
              <button
                type="button"
                role="option"
                aria-selected={workspace.id === activeId}
                onClick={() => select(workspace.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm",
                  "transition-colors duration-(--duration-instant) hover:bg-surface-muted",
                  workspace.id === activeId && "bg-accent-soft",
                )}
              >
                <span
                  aria-hidden="true"
                  className="flex size-6 shrink-0 items-center justify-center rounded-md bg-surface-muted text-[0.65rem] font-semibold text-foreground-muted"
                >
                  {initials(workspace.name)}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium text-foreground">
                  {workspace.name}
                </span>
                {workspace.id === activeId && (
                  <Check className="size-4 shrink-0 text-accent" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}

          {onCreate && (
            <li className="mt-1 border-t border-border pt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreate();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-start text-sm text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                <Plus className="size-4" aria-hidden="true" />
                {t("create")}
              </button>
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

function initials(name: string) {
  // Works for Arabic and Latin alike: first character of the first two words.
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => [...word][0] ?? "")
    .join("")
    .toUpperCase();
}
