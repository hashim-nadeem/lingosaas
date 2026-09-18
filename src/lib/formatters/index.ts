import { getLocaleConfig, type Locale } from "@/lib/i18n/config";

// Intl formatters are expensive to construct and immutable once built.
const cache = new Map<string, Intl.NumberFormat | Intl.DateTimeFormat | Intl.RelativeTimeFormat>();

function memo<T extends Intl.NumberFormat | Intl.DateTimeFormat | Intl.RelativeTimeFormat>(
  key: string,
  build: () => T,
): T {
  const hit = cache.get(key);
  if (hit) return hit as T;
  const made = build();
  cache.set(key, made);
  return made;
}

/** Currency for the locale's own market (USD for en-US, MXN for es-MX, AED for ar-AE). */
export function formatCurrency(amount: number, locale: Locale, currency?: string): string {
  const config = getLocaleConfig(locale);
  const code = currency ?? config.currency;
  return memo(`cur:${locale}:${code}`, () =>
    new Intl.NumberFormat(locale, { style: "currency", currency: code }),
  ).format(amount);
}

export function formatNumber(value: number, locale: Locale, options?: Intl.NumberFormatOptions): string {
  const key = `num:${locale}:${options ? JSON.stringify(options) : ""}`;
  return memo(key, () => new Intl.NumberFormat(locale, options)).format(value);
}

export function formatCompactNumber(value: number, locale: Locale): string {
  return formatNumber(value, locale, { notation: "compact", maximumFractionDigits: 1 });
}

export function formatPercent(value: number, locale: Locale): string {
  return formatNumber(value, locale, { style: "percent", maximumFractionDigits: 1 });
}

type DateStyle = "short" | "medium" | "long" | "full";

export function formatDate(date: Date | string, locale: Locale, dateStyle: DateStyle = "medium"): string {
  const config = getLocaleConfig(locale);
  return memo(`date:${locale}:${dateStyle}:${config.timezone}`, () =>
    new Intl.DateTimeFormat(locale, { dateStyle, timeZone: config.timezone }),
  ).format(new Date(date));
}

export function formatDateTime(date: Date | string, locale: Locale, timezone?: string): string {
  const tz = timezone ?? getLocaleConfig(locale).timezone;
  return memo(`dt:${locale}:${tz}`, () =>
    new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone: tz }),
  ).format(new Date(date));
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 31_536_000_000],
  ["month", 2_592_000_000],
  ["week", 604_800_000],
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
  ["second", 1000],
];

/** "3 days ago" / "hace 3 días" / "قبل ٣ أيام" */
export function formatRelativeTime(date: Date | string, locale: Locale, now: Date = new Date()): string {
  const diff = new Date(date).getTime() - now.getTime();
  const formatter = memo(`rel:${locale}`, () =>
    new Intl.RelativeTimeFormat(locale, { numeric: "auto" }),
  ) as Intl.RelativeTimeFormat;

  for (const [unit, ms] of RELATIVE_UNITS) {
    if (Math.abs(diff) >= ms) return formatter.format(Math.round(diff / ms), unit);
  }
  return formatter.format(0, "second");
}
