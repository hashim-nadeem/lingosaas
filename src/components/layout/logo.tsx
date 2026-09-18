import { cn } from "@/lib/utils/cn";

/**
 * A globe reduced to three meridians — reads as "one shape, many regions",
 * which is the product thesis. Inline SVG: no network request, inherits color,
 * and never mirrors in RTL (it is a mark, not a direction).
 */
export function Logo({ className, showWordmark = true }: { className?: string; showWordmark?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 28 28"
        className="size-7 shrink-0"
        aria-hidden="true"
        fill="none"
        strokeWidth="1.6"
      >
        <rect width="28" height="28" rx="8" className="fill-accent" />
        <g stroke="currentColor" className="text-accent-foreground" strokeLinecap="round">
          <circle cx="14" cy="14" r="7.2" />
          <ellipse cx="14" cy="14" rx="3" ry="7.2" />
          <path d="M6.9 14h14.2" />
        </g>
      </svg>
      {showWordmark && (
        <span className="text-[0.95rem] font-semibold tracking-tight text-foreground">LingoSaaS</span>
      )}
    </span>
  );
}
