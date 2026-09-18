import { getTranslations } from "next-intl/server";
import { StatusPage } from "@/components/layout/status-page";

export default async function Unauthorized() {
  const t = await getTranslations("errors.unauthorized");
  return (
    <StatusPage
      code="401"
      title={t("title")}
      description={t("description")}
      actionLabel={t("action")}
      actionHref="/login"
    />
  );
}
