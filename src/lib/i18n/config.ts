/**
 * The single source of truth for every locale-dependent value in the app.
 * Nothing else may hardcode a currency, a timezone or a text direction.
 */

export const locales = ["en-US", "es-MX", "ar-AE"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en-US";

export type LocaleConfig = {
  code: Locale;
  /** English name, for admin/debug surfaces. */
  language: string;
  /** Endonym — what the switcher shows. */
  nativeName: string;
  region: string;
  direction: "ltr" | "rtl";
  currency: string;
  timezone: string;
  /** Unicode region flag, used as a lightweight visual identifier. */
  flag: string;
};

export const localeConfigs: Record<Locale, LocaleConfig> = {
  "en-US": {
    code: "en-US",
    language: "English",
    nativeName: "English",
    region: "United States",
    direction: "ltr",
    currency: "USD",
    timezone: "America/New_York",
    flag: "🇺🇸",
  },
  "es-MX": {
    code: "es-MX",
    language: "Spanish",
    nativeName: "Español",
    region: "México",
    direction: "ltr",
    currency: "MXN",
    timezone: "America/Mexico_City",
    flag: "🇲🇽",
  },
  "ar-AE": {
    code: "ar-AE",
    language: "Arabic",
    nativeName: "العربية",
    region: "الإمارات العربية المتحدة",
    direction: "rtl",
    currency: "AED",
    timezone: "Asia/Dubai",
    flag: "🇦🇪",
  },
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && locales.includes(value as Locale);
}

export function getLocaleConfig(locale: string): LocaleConfig {
  return localeConfigs[isLocale(locale) ? locale : defaultLocale];
}

export function getDirection(locale: string): "ltr" | "rtl" {
  return getLocaleConfig(locale).direction;
}

export const localeList: LocaleConfig[] = locales.map((l) => localeConfigs[l]);
