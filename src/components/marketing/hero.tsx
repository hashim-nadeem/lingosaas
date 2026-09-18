import { getTranslations } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/primitives";
import { localeList } from "@/lib/i18n/config";

export async function Hero() {
  const t = await getTranslations("marketing.hero");

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-grid" aria-hidden="true" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-glow" aria-hidden="true" />

      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 px-5 pb-20 pt-20 text-center sm:px-8 sm:pt-28">
        <FadeIn delay={0}>
          <span className="inline-flex items-center rounded-full border border-border bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-foreground-muted backdrop-blur-sm">
            {t("eyebrow")}
          </span>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h1 className="text-balance text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-6xl">
            {t("title")}
          </h1>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="max-w-xl text-pretty text-base leading-relaxed text-foreground-muted sm:text-lg">
            {t("subtitle")}
          </p>
        </FadeIn>

        <FadeIn delay={0.24}>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/register">
                {t("primaryCta")}
                {/* Directional icon: flips under RTL so it still points forward. */}
                <ArrowRight className="size-4 rtl-flip" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/login">{t("secondaryCta")}</Link>
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.32}>
          <div className="mt-4 flex flex-col items-center gap-3">
            <p className="text-xs font-medium uppercase tracking-wider text-foreground-subtle">
              {t("trustedBy")}
            </p>
            <ul className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
              {localeList.map((option) => (
                <li
                  key={option.code}
                  lang={option.code}
                  dir={option.direction}
                  className="flex items-center gap-1.5 text-sm text-foreground-muted"
                >
                  <span aria-hidden="true">{option.flag}</span>
                  {option.nativeName}
                </li>
              ))}
            </ul>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
