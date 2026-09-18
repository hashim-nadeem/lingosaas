import { getTranslations } from "next-intl/server";
import {
  Check,
  Coins,
  Database,
  KeyRound,
  Languages,
  Route,
  Building2,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollReveal, SectionHeading, Stagger, StaggerItem } from "@/components/motion/primitives";
import { formatCurrency, formatDate } from "@/lib/formatters";
import { localeList, type Locale } from "@/lib/i18n/config";

const VALUE_ITEMS = [
  { key: "routing", icon: Route },
  { key: "formatting", icon: Coins },
  { key: "rtl", icon: Languages },
  { key: "content", icon: Database },
  { key: "tenancy", icon: Building2 },
  { key: "permissions", icon: KeyRound },
] as const;

export async function ValueSection() {
  const t = await getTranslations("marketing.value");

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 sm:px-8">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {VALUE_ITEMS.map(({ key, icon: Icon }) => (
          <StaggerItem key={key}>
            <Card className="h-full p-5">
              <span className="flex size-9 items-center justify-center rounded-lg bg-accent-soft text-accent">
                <Icon className="size-4.5" aria-hidden="true" />
              </span>
              <h3 className="mt-3.5 text-base font-semibold tracking-tight text-foreground">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-foreground-muted">
                {t(`items.${key}.description`)}
              </p>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

/** A static side-by-side of the three markets, complementing the interactive preview. */
export async function FormattingSection() {
  const t = await getTranslations("marketing.features");
  const sample = new Date("2026-03-14T09:30:00Z");

  return (
    <section className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 sm:px-8">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {localeList.map((option) => (
          <StaggerItem key={option.code}>
            <Card
              className="h-full p-5"
              // Each card renders in ITS market's direction, side by side —
              // the clearest possible demonstration of what RTL means here.
              dir={option.direction}
              lang={option.code}
            >
              <div className="flex items-center gap-2">
                <span aria-hidden="true" className="text-lg">
                  {option.flag}
                </span>
                <span className="text-sm font-semibold text-foreground">{option.region}</span>
              </div>

              <dl className="mt-4 flex flex-col gap-2.5 text-sm">
                <Row label={option.currency} value={formatCurrency(1250.5, option.code)} />
                <Row label={option.timezone.split("/")[1].replace(/_/g, " ")} value={formatDate(sample, option.code, "medium")} />
                <Row label={option.direction.toUpperCase()} value={option.nativeName} />
              </dl>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border pb-2 last:border-0 last:pb-0">
      <dt className="text-xs uppercase tracking-wide text-foreground-subtle">{label}</dt>
      <dd className="font-medium text-foreground tabular">{value}</dd>
    </div>
  );
}

const PLANS = [
  { key: "starter", workspaces: 1, projects: 10, locales: 1, members: 3, popular: false },
  { key: "growth", workspaces: 5, projects: 0, locales: 3, members: 25, popular: true },
  { key: "enterprise", workspaces: 20, projects: 0, locales: 12, members: 250, popular: false },
] as const;

const PRICES: Record<string, number> = { starter: 0, growth: 39, enterprise: 149 };

export async function PricingSection({ locale }: { locale: Locale }) {
  const t = await getTranslations("marketing.pricing");

  return (
    <section id="pricing" className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-20 sm:px-8">
      <SectionHeading title={t("title")} subtitle={t("subtitle")} />

      <Stagger className="grid gap-4 md:grid-cols-3">
        {PLANS.map((plan) => (
          <StaggerItem key={plan.key}>
            <Card
              className={`relative flex h-full flex-col p-6 ${
                plan.popular ? "border-accent shadow-md" : ""
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-2.5 inset-inline-start-6 rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
                  {t("mostPopular")}
                </span>
              )}

              <h3 className="text-base font-semibold tracking-tight text-foreground">
                {t(`plans.${plan.key}.name`)}
              </h3>
              <p className="mt-1 text-sm text-foreground-muted">{t(`plans.${plan.key}.description`)}</p>

              <p className="mt-5 flex items-baseline gap-1">
                {/* Priced in the visitor's own currency — the same Intl path the
                    app uses, not a hardcoded dollar sign. */}
                <span className="text-3xl font-semibold tracking-tight text-foreground tabular">
                  {formatCurrency(PRICES[plan.key], locale, undefined)}
                </span>
                <span className="text-sm text-foreground-muted">{t("perMonth")}</span>
              </p>

              <ul className="mt-5 flex flex-1 flex-col gap-2.5">
                <Feature>{t("features.workspaces", { count: plan.workspaces })}</Feature>
                <Feature>{t("features.projects", { count: plan.projects })}</Feature>
                <Feature>{t("features.locales", { count: plan.locales })}</Feature>
                <Feature>{t("features.members", { count: plan.members })}</Feature>
                <Feature>{t("features.rtl")}</Feature>
                {plan.key !== "starter" && <Feature>{t("features.support")}</Feature>}
              </ul>

              <Button
                asChild
                variant={plan.popular ? "primary" : "secondary"}
                className="mt-6 w-full"
              >
                <Link href="/register">{t(`plans.${plan.key}.cta`)}</Link>
              </Button>
            </Card>
          </StaggerItem>
        ))}
      </Stagger>
    </section>
  );
}

function Feature({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2 text-sm text-foreground-muted">
      <Check className="mt-0.5 size-4 shrink-0 text-success" aria-hidden="true" />
      {children}
    </li>
  );
}

const FAQ_KEYS = ["addLocale", "rtl", "tenancy", "deploy"] as const;

export async function FaqSection() {
  const t = await getTranslations("marketing.faq");

  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-10 px-5 py-20 sm:px-8">
      <SectionHeading title={t("title")} />

      <div className="flex flex-col gap-3">
        {FAQ_KEYS.map((key) => (
          <ScrollReveal key={key}>
            {/* Native <details>: keyboard accessible, findable by in-page search,
                and works with JavaScript disabled. No accordion library. */}
            <details className="group rounded-xl border border-border bg-surface px-5 transition-colors hover:border-border-strong">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-start text-sm font-medium text-foreground marker:content-none">
                {t(`items.${key}.question`)}
                <span
                  aria-hidden="true"
                  className="grid size-5 shrink-0 place-items-center rounded-full border border-border text-foreground-subtle transition-transform duration-(--duration-fast) group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="pb-4 text-sm leading-relaxed text-foreground-muted">
                {t(`items.${key}.answer`)}
              </p>
            </details>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}

export async function CtaSection() {
  const t = await getTranslations("marketing.cta");

  return (
    <section className="mx-auto max-w-6xl px-5 py-20 sm:px-8">
      <ScrollReveal>
        <div className="relative overflow-hidden rounded-3xl border border-border bg-surface px-6 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 bg-glow" aria-hidden="true" />
          <div className="relative flex flex-col items-center gap-4">
            <h2 className="text-balance text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h2>
            <p className="max-w-md text-pretty text-base text-foreground-muted">{t("subtitle")}</p>
            <Button asChild size="lg" className="mt-2">
              <Link href="/register">{t("button")}</Link>
            </Button>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
