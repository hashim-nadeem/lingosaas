import { getTranslations, setRequestLocale } from "next-intl/server";
import { FolderKanban, Plus } from "lucide-react";
import type { ProjectStatus } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { ProjectCard } from "@/components/projects/project-card";
import { Stagger, StaggerItem } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/states";
import { requireWorkspace } from "@/lib/db/context";
import { listProjects } from "@/lib/db/projects";
import { can } from "@/lib/permissions";
import { projectStatusSchema } from "@/lib/validations/project";
import type { Locale } from "@/lib/i18n/config";
import { cn } from "@/lib/utils/cn";

const FILTERS = ["ALL", "PLANNING", "IN_PROGRESS", "COMPLETED", "ARCHIVED"] as const;

export default async function ProjectsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("projects");
  const { role } = await requireWorkspace();

  // An unknown ?status= is ignored rather than erroring — a bad query string
  // should never be a dead end.
  const requested = projectStatusSchema.safeParse((await searchParams).status);
  const status: ProjectStatus | undefined = requested.success ? requested.data : undefined;

  const projects = await listProjects(locale as Locale, { status });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-foreground-muted">{t("subtitle")}</p>
        </div>

        {can(role, "project:create") && (
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        )}
      </div>

      <nav
        aria-label={t("filter.label")}
        className="-mx-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0"
      >
        {FILTERS.map((filter) => {
          const isActive = filter === "ALL" ? !status : status === filter;
          return (
            <Link
              key={filter}
              href={filter === "ALL" ? "/projects" : `/projects?status=${filter}`}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium",
                "transition-colors duration-(--duration-fast)",
                isActive
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-foreground-muted hover:border-border-strong hover:bg-surface-muted",
              )}
            >
              {filter === "ALL" ? t("filter.all") : t(`status.${filter}`)}
            </Link>
          );
        })}
      </nav>

      {projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban />}
          title={status ? t("emptyFiltered.title") : t("empty.title")}
          description={status ? t("emptyFiltered.description") : t("empty.description")}
          action={
            !status &&
            can(role, "project:create") && (
              <Button asChild size="sm">
                <Link href="/projects/new">{t("empty.action")}</Link>
              </Button>
            )
          }
        />
      ) : (
        <Stagger as="ul" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <StaggerItem key={project.id} as="li">
              <ProjectCard project={project} locale={locale as Locale} />
            </StaggerItem>
          ))}
        </Stagger>
      )}
    </div>
  );
}
