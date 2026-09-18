import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing.hero");
  return <main id="main" className="p-10"><h1 className="text-4xl font-semibold">{t("title")}</h1></main>;
}
