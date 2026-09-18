import { getTranslations } from "next-intl/server";
import { Languages } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { InteractiveCard } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { LocaleAwareRelativeTime } from "@/components/localization/locale-aware";
import { getLocaleConfig, type Locale } from "@/lib/i18n/config";
import type { ProjectListItem } from "@/lib/db/projects";

export async function ProjectCard({
  project,
  locale,
}: {
  project: ProjectListItem;
  locale: Locale;
}) {
  const t = await getTranslations("projects");

  // The fallback chain already picked a row; say so rather than pretending the
  // content is translated (PRD §16).
  const fellBack = project.resolvedLocale !== null && project.resolvedLocale !== locale;
  const fallbackConfig = fellBack ? getLocaleConfig(project.resolvedLocale!) : null;

  return (
    <InteractiveCard className="h-full">
      <Link
        href={`/projects/${project.id}`}
        className="flex h-full flex-col gap-3 p-5 focus-visible:outline-none"
      >
        <div className="flex items-start justify-between gap-3">
          <h3
            className="text-pretty text-base font-semibold leading-snug tracking-tight text-foreground"
            lang={project.resolvedLocale ?? undefined}
          >
            {project.name || t("untranslated")}
          </h3>
          <StatusBadge status={project.status} label={t(`status.${project.status}`)} />
        </div>

        {project.description && (
          <p
            className="line-clamp-3 flex-1 text-sm text-foreground-muted"
            lang={project.resolvedLocale ?? undefined}
          >
            {project.description}
          </p>
        )}

        {fellBack && fallbackConfig && (
          <p className="flex items-start gap-1.5 rounded-lg bg-warning-soft px-2.5 py-1.5 text-xs text-foreground-muted">
            <Languages className="mt-0.5 size-3.5 shrink-0 text-warning" aria-hidden="true" />
            {t("fallbackNotice", {
              language: getLocaleConfig(locale).nativeName,
              fallbackLanguage: fallbackConfig.nativeName,
            })}
          </p>
        )}

        <div className="mt-auto flex items-center gap-2 pt-1 text-xs text-foreground-subtle">
          <LocaleAwareRelativeTime value={project.createdAt} />
          {project.createdBy && (
            <>
              <span aria-hidden="true">·</span>
              <span className="truncate">{project.createdBy.name}</span>
            </>
          )}
        </div>
      </Link>
    </InteractiveCard>
  );
}
