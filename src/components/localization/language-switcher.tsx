"use client";

import { useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Check, ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { localeList, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

/**
 * Switching language keeps you on the same page with the same params —
 * `/en-US/projects/abc` becomes `/ar-AE/projects/abc`, not the home page.
 * `usePathname` from our navigation module returns the locale-stripped path,
 * and `params` carries the dynamic segments back through.
 */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const t = useTranslations("locale");
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  const current = localeList.find((l) => l.code === locale) ?? localeList[0];

  function select(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(
        // @ts-expect-error — params are typed per-route; they are valid for the
        // route we are already on, which is the only one we navigate to.
        { pathname, params },
        { locale: next },
      );
      // Persist for the next anonymous visit; authenticated users' stored
      // preference is updated by the settings form instead.
      document.cookie = `LINGOSAAS_LOCALE=${next};path=/;max-age=31536000;samesite=lax`;
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
        aria-label={t("switchLanguage")}
        disabled={pending}
        className={cn(
          "inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-2.5",
          "text-sm font-medium text-foreground transition-colors duration-(--duration-fast)",
          "hover:border-border-strong hover:bg-surface-muted disabled:opacity-60",
        )}
      >
        <Globe className="size-4 text-foreground-muted" aria-hidden="true" />
        {!compact && <span>{current.nativeName}</span>}
        <ChevronDown
          className={cn(
            "size-3.5 text-foreground-subtle transition-transform duration-(--duration-fast)",
            open && "rotate-180",
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("switchLanguage")}
          className={cn(
            // Opens toward the reading edge, so it never leaves the viewport in RTL.
            "absolute inset-inline-end-0 top-full z-(--z-dropdown) mt-2 min-w-56 overflow-hidden",
            "rounded-xl border border-border bg-surface-raised p-1 shadow-lg",
            "motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95",
          )}
        >
          {localeList.map((option) => (
            <li key={option.code}>
              <button
                type="button"
                role="option"
                aria-selected={option.code === locale}
                lang={option.code}
                dir={option.direction}
                onClick={() => select(option.code)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start text-sm",
                  "transition-colors duration-(--duration-instant) hover:bg-surface-muted",
                  option.code === locale && "bg-accent-soft",
                )}
              >
                <span aria-hidden="true" className="text-base leading-none">
                  {option.flag}
                </span>
                <span className="flex flex-1 flex-col">
                  <span className="font-medium text-foreground">{option.nativeName}</span>
                  <span className="text-xs text-foreground-subtle">
                    {option.region} · {option.currency}
                  </span>
                </span>
                {option.code === locale && (
                  <Check className="size-4 text-accent" aria-hidden="true" />
                )}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
