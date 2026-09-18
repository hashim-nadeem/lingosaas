import { getTranslations } from "next-intl/server";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from "@/lib/formatters";
import { getLocaleConfig, type Locale } from "@/lib/i18n/config";

/**
 * Shows the user what their locale actually does to the data — the same values
 * every time, so switching language visibly changes currency, separators,
 * date order and numeral system.
 */
export async function RegionalFormatCard({ locale }: { locale: Locale }) {
  const t = await getTranslations("dashboard.localeShowcase");
  const config = getLocaleConfig(locale);

  const sampleDate = new Date("2026-03-14T09:30:00Z");
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  const rows = [
    { label: t("amount"), value: formatCurrency(1250.5, locale) },
    { label: t("number"), value: formatNumber(1234567.89, locale) },
    { label: t("date"), value: formatDate(sampleDate, locale, "long") },
    { label: t("relative"), value: formatRelativeTime(threeDaysAgo, locale) },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
        <CardDescription>
          {t("subtitle", { region: config.region, currency: config.currency })}
        </CardDescription>
      </CardHeader>

      <dl className="border-t border-border">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between gap-4 border-b border-border px-5 py-2.5 last:border-0"
          >
            <dt className="text-xs text-foreground-muted">{row.label}</dt>
            <dd className="text-sm font-medium text-foreground tabular">{row.value}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}
