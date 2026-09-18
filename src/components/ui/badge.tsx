import type { ProjectStatus, Role } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

const tones = {
  neutral: "bg-surface-muted text-foreground-muted border-border",
  accent: "bg-accent-soft text-accent border-accent/20",
  success: "bg-success-soft text-success border-success/20",
  warning: "bg-warning-soft text-warning border-warning/25",
  danger: "bg-danger-soft text-danger border-danger/20",
  info: "bg-info-soft text-info border-info/20",
} as const;

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: keyof typeof tones }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

const STATUS_TONE: Record<ProjectStatus, keyof typeof tones> = {
  PLANNING: "info",
  IN_PROGRESS: "accent",
  COMPLETED: "success",
  ARCHIVED: "neutral",
};

export function StatusBadge({ status, label }: { status: ProjectStatus; label: string }) {
  return (
    <Badge tone={STATUS_TONE[status]}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {label}
    </Badge>
  );
}

const ROLE_TONE: Record<Role, keyof typeof tones> = {
  OWNER: "accent",
  ADMIN: "info",
  MEMBER: "neutral",
};

export function RoleBadge({ role, label }: { role: Role; label: string }) {
  return <Badge tone={ROLE_TONE[role]}>{label}</Badge>;
}
