import { getTranslations, setRequestLocale } from "next-intl/server";
import { SettingsTabs } from "@/components/layout/settings-tabs";

export default async function SettingsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("settings");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        {t("title")}
      </h1>
      <SettingsTabs />
      <div className="max-w-2xl">{children}</div>
    </div>
  );
}
