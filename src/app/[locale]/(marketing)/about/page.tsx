import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { FormattingSection, ValueSection, CtaSection } from "@/components/marketing/sections";
import { marketingMetadata } from "@/lib/i18n/metadata";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return marketingMetadata(locale, "about", "/about");
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("marketing.value");

  return (
    <>
      <div className="relative overflow-hidden border-b border-border">
        <div className="pointer-events-none absolute inset-0 bg-glow" aria-hidden="true" />
        <div className="relative mx-auto max-w-3xl px-5 py-20 text-center sm:px-8">
          <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-pretty text-base text-foreground-muted">
            {t("subtitle")}
          </p>
        </div>
      </div>
      <ValueSection />
      <FormattingSection />
      <CtaSection />
    </>
  );
}
