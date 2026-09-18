import { getTranslations, setRequestLocale } from "next-intl/server";
import { ProjectForm } from "@/components/projects/project-form";
import { FadeIn } from "@/components/motion/primitives";
import { requirePermission } from "@/lib/db/context";

export default async function NewProjectPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Renders the permission-denied state rather than a form that would fail on
  // submit — the check belongs before the UI, not after it.
  await requirePermission("project:create");
  const t = await getTranslations("projects");

  return (
    <FadeIn className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("createTitle")}</h1>
      <ProjectForm />
    </FadeIn>
  );
}
