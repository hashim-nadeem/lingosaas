import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/layout/status-page";

export default async function Forbidden() {
  const t = await getTranslations("errors.forbidden");
  return (
    <StatusPage
      code="403"
      title={t("title")}
      description={t("description")}
      actionLabel={t("action")}
      actionHref="/dashboard"
    />
  );
}
