import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils/cn";

const variants = {
  primary:
    "bg-accent text-accent-foreground shadow-sm hover:bg-accent-hover active:translate-y-px",
  secondary:
    "bg-surface text-foreground border border-border shadow-xs hover:bg-surface-muted hover:border-border-strong",
  ghost: "text-foreground-muted hover:bg-surface-muted hover:text-foreground",
  danger: "bg-danger text-white shadow-sm hover:bg-danger-hover",
  link: "text-accent underline-offset-4 hover:underline p-0 h-auto",
} as const;

const sizes = {
  sm: "h-8 px-3 text-sm gap-1.5 rounded-md",
  md: "h-10 px-4 text-sm gap-2 rounded-lg",
  lg: "h-12 px-6 text-base gap-2.5 rounded-lg",
  icon: "size-10 rounded-lg",
} as const;

export type ButtonProps = React.ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  /** Render as the single child element (a Link, usually) instead of a <button>. */
  asChild?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex select-none items-center justify-center whitespace-nowrap font-medium",
        "transition-[background-color,border-color,color,transform,box-shadow]",
        "duration-(--duration-fast) ease-(--ease-out-soft)",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}
