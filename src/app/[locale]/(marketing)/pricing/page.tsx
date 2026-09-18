import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FaqSection, PricingSection } from "@/components/marketing/sections";
import { marketingMetadata } from "@/lib/i18n/metadata";
import type { Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return marketingMetadata(locale, "pricing", "/pricing");
}

export default async function PricingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing.pricing");

  return (
    <>
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-pretty text-base text-foreground-muted">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <PricingSection locale={locale as Locale} />
      <FaqSection />
    </>
  );
}
