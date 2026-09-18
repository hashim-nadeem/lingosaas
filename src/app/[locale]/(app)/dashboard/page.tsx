import type { Metadata } from "next";
import { privateMetadata } from "@/lib/i18n/metadata";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { CheckCircle2, FolderKanban, Loader, Plus, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { AnimatedMetricCard } from "@/components/dashboard/metric-card";
import { RegionalFormatCard } from "@/components/dashboard/regional-format-card";
import { LocaleAwareRelativeTime } from "@/components/localization/locale-aware";
import { FadeIn, Stagger, StaggerItem } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/states";
import { requireWorkspace } from "@/lib/db/context";
import { getProjectMetrics, listProjects } from "@/lib/db/projects";
import { listNotifications } from "@/lib/db/team";
import { can } from "@/lib/permissions";
import type { Locale } from "@/lib/i18n/config";
import { NotificationLine } from "@/components/dashboard/notification-line";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return privateMetadata(locale, "dashboard");
}

export default async function DashboardPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("dashboard");
  const tProjects = await getTranslations("projects");
  const tNotifications = await getTranslations("notifications");

  const { user, workspace, role } = await requireWorkspace();
  const [metrics, projects, notifications] = await Promise.all([
    getProjectMetrics(),
    listProjects(locale as Locale),
    listNotifications(4),
  ]);

  const recent = projects.slice(0, 5);

  return (
    <div className="flex flex-col gap-7">
      <FadeIn className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("greeting", { name: user.name.split(" ")[0] })}
          </h1>
          <p className="text-sm text-foreground-muted">
            {t("subtitle", { workspace: workspace.name })}
          </p>
        </div>

        {can(role, "project:create") && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="size-4" aria-hidden="true" />
              {tProjects("create")}
            </Link>
          </Button>
        )}
      </FadeIn>

      <Stagger className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StaggerItem>
          <AnimatedMetricCard label={t("metrics.totalProjects")} value={metrics.total} icon={<FolderKanban />} />
        </StaggerItem>
        <StaggerItem>
          <AnimatedMetricCard
            label={t("metrics.activeProjects")}
            value={metrics.active}
            icon={<Loader />}
            tone="accent"
          />
        </StaggerItem>
        <StaggerItem>
          <AnimatedMetricCard
            label={t("metrics.completedProjects")}
            value={metrics.completed}
            icon={<CheckCircle2 />}
            tone="success"
          />
        </StaggerItem>
        <StaggerItem>
          <AnimatedMetricCard label={t("metrics.teamMembers")} value={metrics.members} icon={<Users />} />
        </StaggerItem>
      </Stagger>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>{t("recentProjects")}</CardTitle>
            <Button asChild variant="link" size="sm">
              <Link href="/projects">{t("viewAll")}</Link>
            </Button>
          </CardHeader>

          {recent.length === 0 ? (
            <div className="p-5 pt-0">
              <EmptyState
                icon={<FolderKanban />}
                title={tProjects("empty.title")}
                description={tProjects("empty.description")}
                action={
                  can(role, "project:create") && (
                    <Button asChild size="sm">
                      <Link href="/projects/new">{tProjects("empty.action")}</Link>
                    </Button>
                  )
                }
              />
            </div>
          ) : (
            <ul className="border-t border-border">
              {recent.map((project) => (
                <li key={project.id}>
                  <Link
                    href={`/projects/${project.id}`}
                    className="flex items-center gap-4 border-b border-border px-5 py-3.5 transition-colors last:border-0 hover:bg-surface-muted"
                  >
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-medium text-foreground">
                        {project.name || tProjects("untranslated")}
                      </span>
                      <span className="text-xs text-foreground-subtle">
                        <LocaleAwareRelativeTime value={project.createdAt} />
                      </span>
                    </span>
                    <StatusBadge status={project.status} label={tProjects(`status.${project.status}`)} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex flex-col gap-5">
          <RegionalFormatCard locale={locale as Locale} />

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>{t("recentNotifications")}</CardTitle>
              <Button asChild variant="link" size="sm">
                <Link href="/notifications">{t("viewAll")}</Link>
              </Button>
            </CardHeader>

            {notifications.length === 0 ? (
              <p className="px-5 pb-5 text-sm text-foreground-muted">
                {tNotifications("empty.description")}
              </p>
            ) : (
              <ul className="border-t border-border">
                {notifications.map((notification) => (
                  <li key={notification.id} className="border-b border-border px-5 py-3 last:border-0">
                    <NotificationLine
                      messageKey={notification.messageKey}
                      params={notification.params}
                      unread={notification.readAt === null}
                    />
                    <p className="mt-1 text-xs text-foreground-subtle">
                      <LocaleAwareRelativeTime value={notification.createdAt} />
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
