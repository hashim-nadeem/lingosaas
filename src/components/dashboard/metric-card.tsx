"use client";

import { useEffect, useRef, useState } from "react";
import { useFormatter } from "next-intl";
import { animate, useInView, useReducedMotion } from "motion/react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils/cn";

/**
 * Counts up when scrolled into view.
 *
 * The number is formatted with `Intl` on every frame, so Arabic sees
 * Eastern Arabic numerals counting up — not Latin digits that swap at the end.
 * Under reduced motion the final value renders immediately.
 */
export function AnimatedMetricCard({
  label,
  value,
  icon,
  tone = "neutral",
}: {
  label: string;
  value: number;
  /** A rendered element, not a component: function types cannot cross the
      server/client boundary, but serialized elements can. */
  icon?: React.ReactNode;
  tone?: "neutral" | "accent" | "success";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduced = useReducedMotion();
  const format = useFormatter();
  const [animated, setAnimated] = useState(0);

  // Derived, not synced: under reduced motion the final value is simply what
  // renders, so the effect never has to push state on mount.
  const display = reduced ? value : animated;

  useEffect(() => {
    if (!inView || reduced) return;
    const controls = animate(0, value, {
      duration: Math.min(0.4 + value * 0.02, 1.2),
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setAnimated(Math.round(latest)),
    });
    return () => controls.stop();
  }, [inView, reduced, value]);

  return (
    <Card ref={ref} className="p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-foreground-muted">{label}</p>
        {icon && (
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg [&>svg]:size-4",
              tone === "accent" && "bg-accent-soft text-accent",
              tone === "success" && "bg-success-soft text-success",
              tone === "neutral" && "bg-surface-muted text-foreground-subtle",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      {/* aria-live off: the count-up is decorative. The final value is in the
          DOM from the start for assistive tech via the visually-hidden span. */}
      <p className="mt-2 text-3xl font-semibold tracking-tight text-foreground tabular" aria-hidden="true">
        {format.number(display)}
      </p>
      <span className="sr-only">{format.number(value)}</span>
    </Card>
  );
}
