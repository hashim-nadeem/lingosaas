import { cn } from "@/lib/utils/cn";

export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-xs",
        "transition-[border-color,box-shadow] duration-(--duration-normal) ease-(--ease-out-soft)",
        className,
      )}
      {...props}
    />
  );
}

/** Adds the lift-on-hover treatment. Opt in — most cards should sit still. */
export function InteractiveCard({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <Card
      className={cn(
        "hover:-translate-y-0.5 hover:border-border-strong hover:shadow-md",
        "transition-[transform,border-color,box-shadow]",
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("flex flex-col gap-1 p-5 pb-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3 className={cn("text-base font-semibold tracking-tight text-foreground", className)} {...props} />
  );
}

export function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p className={cn("text-sm text-foreground-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("p-5 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center gap-2 border-t border-border px-5 py-3", className)}
      {...props}
    />
  );
}
