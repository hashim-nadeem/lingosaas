import { getTranslations, setRequestLocale } from "next-intl/server";
import { Languages, Pencil } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { DeleteProjectButton } from "@/components/projects/delete-project-button";
import { LocaleAwareDate } from "@/components/localization/locale-aware";
import { FadeIn } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/ui/badge";
import { getProject } from "@/lib/db/projects";
import { can } from "@/lib/permissions";
import { getLocaleConfig, localeList, type Locale } from "@/lib/i18n/config";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("projects");
  // Workspace-scoped: an id from another tenant is a 404, never a 403.
  const project = await getProject(projectId, locale as Locale);

  const fellBack = project.resolvedLocale !== null && project.resolvedLocale !== locale;
  const translated = new Set(project.translations.map((row) => row.locale));

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1
              className="text-pretty text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
              lang={project.resolvedLocale ?? undefined}
            >
              {project.name || t("untranslated")}
            </h1>
            <StatusBadge status={project.status} label={t(`status.${project.status}`)} />
          </div>
          <p className="text-sm text-foreground-subtle">
            {t("fields.createdAt")}: <LocaleAwareDate value={project.createdAt} style="long" />
            {project.createdBy && ` · ${t("fields.createdBy")}: ${project.createdBy.name}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {can(project.role, "project:update") && (
            <Button asChild variant="secondary">
              <Link href={`/projects/${project.id}/edit`}>
                <Pencil className="size-4" aria-hidden="true" />
                {t("editTitle")}
              </Link>
            </Button>
          )}
          {can(project.role, "project:delete") && (
            <DeleteProjectButton projectId={project.id} projectName={project.name} locale={locale} />
          )}
        </div>
      </div>

      {fellBack && project.resolvedLocale && (
        <p className="flex items-start gap-2 rounded-lg border border-warning/25 bg-warning-soft px-3.5 py-2.5 text-sm text-foreground">
          <Languages className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden="true" />
          {t("fallbackNotice", {
            language: getLocaleConfig(locale).nativeName,
            fallbackLanguage: getLocaleConfig(project.resolvedLocale).nativeName,
          })}
        </p>
      )}

      {project.description && (
        <Card className="p-5">
          <p
            className="whitespace-pre-wrap text-pretty text-sm leading-relaxed text-foreground-muted"
            lang={project.resolvedLocale ?? undefined}
          >
            {project.description}
          </p>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t("fields.translations")}</CardTitle>
        </CardHeader>
        <ul className="border-t border-border">
          {localeList.map((option) => {
            const row = project.translations.find((r) => r.locale === option.code);
            return (
              <li
                key={option.code}
                className="flex items-start gap-4 border-b border-border px-5 py-3.5 last:border-0"
              >
                <span className="flex w-28 shrink-0 items-center gap-2 text-sm text-foreground-muted">
                  <span aria-hidden="true">{option.flag}</span>
                  <span lang={option.code}>{option.nativeName}</span>
                </span>
                {row ? (
                  <span
                    className="min-w-0 flex-1 truncate text-sm text-foreground"
                    lang={option.code}
                    dir={option.direction}
                  >
                    {row.name}
                  </span>
                ) : (
                  <span className="flex-1 text-sm italic text-foreground-subtle">
                    {t("untranslated")}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {translated.size < localeList.length && can(project.role, "project:update") && (
          <div className="border-t border-border px-5 py-3">
            <Button asChild variant="link" size="sm">
              <Link href={`/projects/${project.id}/edit`}>{t("editTitle")}</Link>
            </Button>
          </div>
        )}
      </Card>
    </FadeIn>
  );
}
