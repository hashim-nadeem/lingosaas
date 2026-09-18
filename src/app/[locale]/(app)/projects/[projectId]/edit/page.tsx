import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectForm } from "@/components/projects/project-form";
import { FadeIn } from "@/components/motion/primitives";
import { requirePermission } from "@/lib/db/context";
import { getProject } from "@/lib/db/projects";
import type { Locale } from "@/lib/i18n/config";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ locale: string; projectId: string }>;
}) {
  const { locale, projectId } = await params;
  setRequestLocale(locale);

  await requirePermission("project:update");
  const t = await getTranslations("projects");
  const project = await getProject(projectId, locale as Locale);

  // The form edits every locale at once, so it needs all rows — not the one
  // the fallback chain picked for display.
  const initialTranslations = Object.fromEntries(
    project.translations.map((row) => [
      row.locale,
      { name: row.name, description: row.description ?? "" },
    ]),
  );

  return (
    <FadeIn className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("editTitle")}</h1>
      <ProjectForm
        projectId={project.id}
        initialStatus={project.status}
        initialTranslations={initialTranslations}
      />
    </FadeIn>
  );
}
