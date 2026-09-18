import { defaultLocale, type Locale } from "./config";

/** Any DB row carrying a locale column. */
type Translated = { locale: string };

/**
 * PRD §16 fallback chain, applied identically everywhere:
 *   1. the requested locale
 *   2. en-US
 *   3. whatever exists
 *   4. null — callers render their designed "translation unavailable" state
 */
export function pickTranslation<T extends Translated>(rows: readonly T[], locale: Locale): T | null {
  return (
    rows.find((r) => r.locale === locale) ??
    rows.find((r) => r.locale === defaultLocale) ??
    rows[0] ??
    null
  );
}

/** True when the row we rendered is not the one the user asked for. */
export function isFallback<T extends Translated>(row: T | null, locale: Locale): boolean {
  return row !== null && row.locale !== locale;
}
