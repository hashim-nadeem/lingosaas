import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Hero } from "@/components/marketing/hero";
import { LocalePreview } from "@/components/marketing/locale-preview";
import {
  CtaSection,
  FaqSection,
  FormattingSection,
  PricingSection,
  ValueSection,
} from "@/components/marketing/sections";
import { SectionHeading } from "@/components/motion/primitives";
import { marketingMetadata } from "@/lib/i18n/metadata";
import { locales, type Locale } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return marketingMetadata(locale, "home");
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("marketing.preview");

  // The preview card is a client component, so its strings are resolved here
  // and passed down — one place, still fully translated, no second catalogue.
  const previewMessages = Object.fromEntries(
    await Promise.all(
      locales.map(async (code) => {
        const tp = await getTranslations({ locale: code, namespace: "marketing.preview" });
        return [
          code,
          {
            revenue: tp("sampleRevenue"),
            projects: tp("sampleProjects"),
            members: tp("sampleMembers"),
            updated: tp.raw("sampleUpdated") as string,
          },
        ];
      }),
    ),
  ) as Record<Locale, { revenue: string; projects: string; members: string; updated: string }>;

  return (
    <>
      <Hero />

      <section className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 sm:px-8">
        <SectionHeading title={t("title")} subtitle={t("subtitle")} />
        <LocalePreview messages={previewMessages} />
      </section>

      <ValueSection />
      <FormattingSection />
      <PricingSection locale={locale as Locale} />
      <FaqSection />
      <CtaSection />
    </>
  );
}
