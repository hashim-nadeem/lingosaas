import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/layout/status-page";

export default async function NotFound() {
  const t = await getTranslations("errors.notFound");
  return (
    <StatusPage
      code="404"
      title={t("title")}
      description={t("description")}
      actionLabel={t("action")}
      actionHref="/dashboard"
    />
  );
}
