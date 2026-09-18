import { useId } from "react";
import { cn } from "@/lib/utils/cn";

export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
        // `text-start` rather than `text-left` — Arabic must read from the right.
        "text-start placeholder:text-foreground-subtle",
        "transition-[border-color,box-shadow] duration-(--duration-fast)",
        "hover:border-border-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-(--color-accent-ring)",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:ring-danger/25",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-24 w-full resize-y rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground",
        "text-start placeholder:text-foreground-subtle",
        "transition-[border-color,box-shadow] duration-(--duration-fast)",
        "hover:border-border-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-(--color-accent-ring)",
        "disabled:cursor-not-allowed disabled:opacity-60",
        "aria-invalid:border-danger aria-invalid:ring-danger/25",
        className,
      )}
      {...props}
    />
  );
}

export function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-foreground",
        "transition-[border-color,box-shadow] duration-(--duration-fast)",
        "hover:border-border-strong focus:border-accent focus:outline-none focus:ring-3 focus:ring-(--color-accent-ring)",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      {...props}
    />
  );
}

/**
 * Label + control + error, wired with generated ids so the error is announced.
 * Every form field in the app goes through this — that is how the accessibility
 * wiring stays consistent instead of being remembered case by case.
 */
export function Field({
  label,
  hint,
  error,
  required,
  children,
  className,
}: {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (props: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode;
  className?: string;
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ms-0.5 text-danger" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children({ id, "aria-describedby": describedBy, "aria-invalid": error ? true : undefined })}
      {hint && !error && (
        <p id={hintId} className="text-xs text-foreground-subtle">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
