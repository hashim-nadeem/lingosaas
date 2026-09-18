"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils/cn";
import { Button } from "./button";

/**
 * Built on native `<dialog>`: focus trapping, Escape-to-close, inertness of the
 * page behind it and the top-layer stacking all come for free and correctly.
 * Reimplementing those in React is how modals end up inaccessible.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  tone = "danger",
  body,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  tone?: "danger" | "primary";
  /** Optional form fields rendered above the footer. */
  body?: React.ReactNode;
  /** The control that performs the action. Falls back to a plain OK button. */
  footer?: React.ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const t = useTranslations("common");

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      // Clicking the backdrop closes; clicking the panel must not.
      onClick={(e) => {
        if (e.target === ref.current) onClose();
      }}
      aria-labelledby="confirm-title"
      className={cn(
        "m-auto w-[min(28rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface-raised p-0 text-foreground shadow-xl",
        "backdrop:bg-black/45 backdrop:backdrop-blur-[1px]",
        "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
      )}
    >
      <div className="flex flex-col gap-2 p-5">
        <h2 id="confirm-title" className="text-base font-semibold tracking-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-foreground-muted">{description}</p>}
        {body && <div className="mt-2 flex flex-col gap-4">{body}</div>}
      </div>

      <div className="flex items-center justify-end gap-2 border-t border-border px-5 py-3">
        <Button type="button" variant="secondary" size="sm" onClick={onClose}>
          {t("cancel")}
        </Button>
        {footer ?? (
          <Button
            type="button"
            size="sm"
            variant={tone === "danger" ? "danger" : "primary"}
            onClick={onClose}
          >
            {confirmLabel ?? t("confirm")}
          </Button>
        )}
      </div>
    </dialog>
  );
}
