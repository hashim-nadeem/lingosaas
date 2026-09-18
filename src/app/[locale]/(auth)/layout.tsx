import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import { Logo } from "@/components/layout/logo";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("common");

  return (
    <div className="relative flex min-h-dvh flex-col bg-canvas">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-glow" aria-hidden="true" />

      <header className="relative flex items-center justify-between px-5 py-5 sm:px-8">
        <Link href="/" className="rounded-lg" aria-label={t("appName")}>
          <Logo />
        </Link>
        <LanguageSwitcher />
      </header>

      <main id="main" className="relative flex flex-1 items-center justify-center px-5 pb-16 pt-4">
        <div className="w-full max-w-100">{children}</div>
      </main>
    </div>
  );
}
