import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

/**
 * The shared shell for every terminal state — 404, 403, 401 and unhandled
 * errors. One layout means these never look like the framework's defaults.
 */
export function StatusPage({
  code,
  title,
  description,
  actionLabel,
  actionHref,
  action,
}: {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center gap-6 px-6 py-16 text-center">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-glow" aria-hidden="true" />

      <Logo showWordmark={false} />

      <div className="relative flex flex-col items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground-subtle tabular">
          {code}
        </span>
        <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        <p className="max-w-md text-pretty text-sm text-foreground-muted">{description}</p>
      </div>

      {action ??
        (actionLabel && actionHref && (
          <Button asChild>
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ))}
    </div>
  );
}
