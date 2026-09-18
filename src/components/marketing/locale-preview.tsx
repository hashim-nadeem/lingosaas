"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowUpRight, Users } from "lucide-react";
import { formatCurrency, formatDate, formatNumber } from "@/lib/formatters";
import { localeList, type Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

/**
 * The signature section (PRD §27).
 *
 * A miniature dashboard that genuinely re-renders in the chosen market — its
 * own `dir`, its own font, its own Intl output. Nothing here is a screenshot,
 * which is the whole point: a reviewer can see the layout mirror in real time
 * without leaving the marketing page or signing in.
 *
 * Strings for the preview come from the visitor's own message catalogue via
 * `messages`, so the card is translated by the same machinery as the app.
 */
export function LocalePreview({
  messages,
}: {
  messages: Record<Locale, { revenue: string; projects: string; members: string; updated: string }>;
}) {
  const t = useTranslations("marketing.preview");
  const [active, setActive] = useState<Locale>("en-US");
  const reduced = useReducedMotion();

  const config = localeList.find((l) => l.code === active)!;
  const copy = messages[active];
  const sampleDate = new Date("2026-03-14T09:30:00Z");

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        role="tablist"
        aria-label={t("title")}
        className="flex flex-wrap justify-center gap-2 rounded-full border border-border bg-surface p-1.5 shadow-xs"
      >
        {localeList.map((option) => {
          const selected = option.code === active;
          return (
            <button
              key={option.code}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(option.code)}
              className={cn(
                "relative flex items-center gap-2 rounded-full px-3.5 py-2 text-sm font-medium",
                "transition-colors duration-(--duration-fast)",
                selected ? "text-accent-foreground" : "text-foreground-muted hover:text-foreground",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={reduced ? undefined : "locale-preview-pill"}
                  className="absolute inset-0 rounded-full bg-accent"
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
              <span className="relative" aria-hidden="true">
                {option.flag}
              </span>
              <span className="relative" lang={option.code}>
                {option.region}
              </span>
            </button>
          );
        })}
      </div>

      {/* `key` forces a fresh subtree per locale so the crossfade actually runs
          and the direction flip is never half-applied. */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          dir={config.direction}
          lang={config.code}
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
          transition={{ duration: reduced ? 0.12 : 0.3, ease: [0.22, 1, 0.36, 1] }}
          className={cn(
            "w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-surface shadow-lg",
            config.direction === "rtl" && "font-(family-name:--font-arabic)",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
            <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <span aria-hidden="true">{config.flag}</span>
              {config.region}
            </span>
            <span className="rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-foreground-muted">
              {config.currency} · {config.direction.toUpperCase()}
            </span>
          </div>

          <div className="grid gap-px bg-border sm:grid-cols-3">
            <PreviewMetric
              label={copy.revenue}
              value={formatCurrency(48250.75, active)}
              trend="+12.4%"
            />
            <PreviewMetric label={copy.projects} value={formatNumber(24, active)} />
            <PreviewMetric
              label={copy.members}
              value={formatNumber(1280, active)}
              icon={<Users className="size-3.5" />}
            />
          </div>

          <p className="border-t border-border px-5 py-3 text-xs text-foreground-subtle">
            {copy.updated.replace("{date}", formatDate(sampleDate, active, "long"))}
          </p>
        </motion.div>
      </AnimatePresence>

      <p className="max-w-md text-center text-sm text-foreground-subtle">{t("note")}</p>
    </div>
  );
}

function PreviewMetric({
  label,
  value,
  trend,
  icon,
}: {
  label: string;
  value: string;
  trend?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5 bg-surface px-5 py-4">
      <span className="flex items-center gap-1.5 text-xs font-medium text-foreground-muted">
        {icon}
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight text-foreground tabular">{value}</span>
      {trend && (
        <span className="flex items-center gap-0.5 text-xs font-medium text-success">
          <ArrowUpRight className="size-3 rtl-flip" aria-hidden="true" />
          <span dir="ltr">{trend}</span>
        </span>
      )}
    </div>
  );
}
