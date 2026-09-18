import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Mail } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/primitives";
import { marketingMetadata } from "@/lib/i18n/metadata";
import { localeList } from "@/lib/i18n/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return marketingMetadata(locale, "contact", "/contact");
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("nav");
  const tLocale = await getTranslations("locale");

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-5 py-20 sm:px-8">
      <FadeIn className="flex flex-col gap-3 text-center">
        <h1 className="text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          {t("contact")}
        </h1>
      </FadeIn>

      <FadeIn delay={0.08}>
        <Card className="flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex size-11 items-center justify-center rounded-full bg-accent-soft text-accent">
            <Mail className="size-5" aria-hidden="true" />
          </span>
          <a
            href="mailto:hello@lingosaas.dev"
            dir="ltr"
            className="text-lg font-medium text-accent underline-offset-4 hover:underline"
          >
            hello@lingosaas.dev
          </a>
        </Card>
      </FadeIn>

      <FadeIn delay={0.16}>
        <div className="grid gap-3 sm:grid-cols-3">
          {localeList.map((option) => (
            <Card key={option.code} className="p-4" dir={option.direction} lang={option.code}>
              <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span aria-hidden="true">{option.flag}</span>
                {option.region}
              </p>
              <dl className="mt-2 flex flex-col gap-1 text-xs text-foreground-muted">
                <div className="flex justify-between gap-2">
                  <dt>{tLocale("timezone")}</dt>
                  <dd dir="ltr" className="tabular">
                    {option.timezone.replace(/_/g, " ")}
                  </dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>{tLocale("currency")}</dt>
                  <dd className="tabular">{option.currency}</dd>
                </div>
              </dl>
            </Card>
          ))}
        </div>
      </FadeIn>
    </div>
  );
}
