import { getLocale } from "next-intl/server";
import { formatCurrency, formatDate, formatNumber, formatRelativeTime } from "@/lib/formatters";
import type { Locale } from "@/lib/i18n/config";

/**
 * Server components, deliberately: dates rendered on the client hydrate against
 * the browser's zone and mismatch the server's. Formatting once on the server
 * with an explicit zone removes the whole class of bug.
 *
 * `<time dateTime>` keeps the machine-readable value for assistive tech.
 */

export async function LocaleAwareDate({
  value,
  style = "medium",
}: {
  value: Date | string;
  style?: "short" | "medium" | "long" | "full";
}) {
  const locale = (await getLocale()) as Locale;
  const iso = new Date(value).toISOString();
  return <time dateTime={iso}>{formatDate(value, locale, style)}</time>;
}

export async function LocaleAwareRelativeTime({ value }: { value: Date | string }) {
  const locale = (await getLocale()) as Locale;
  const iso = new Date(value).toISOString();
  return (
    <time dateTime={iso} title={formatDate(value, locale, "long")}>
      {formatRelativeTime(value, locale)}
    </time>
  );
}

export async function LocaleAwareCurrency({
  value,
  currency,
}: {
  value: number;
  currency?: string;
}) {
  const locale = (await getLocale()) as Locale;
  return <span className="tabular">{formatCurrency(value, locale, currency)}</span>;
}

export async function LocaleAwareNumber({
  value,
  options,
}: {
  value: number;
  options?: Intl.NumberFormatOptions;
}) {
  const locale = (await getLocale()) as Locale;
  return <span className="tabular">{formatNumber(value, locale, options)}</span>;
}
