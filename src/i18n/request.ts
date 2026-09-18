import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { getLocaleConfig } from "@/lib/i18n/config";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested) ? requested : routing.defaultLocale;
  const config = getLocaleConfig(locale);

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    // Server and client must agree on the zone, or dates hydrate mismatched.
    timeZone: config.timezone,
    formats: {
      dateTime: {
        short: { dateStyle: "short" },
        medium: { dateStyle: "medium" },
        long: { dateStyle: "long" },
        withTime: { dateStyle: "medium", timeStyle: "short" },
      },
      number: {
        currency: { style: "currency", currency: config.currency },
        compact: { notation: "compact", maximumFractionDigits: 1 },
      },
    },
  };
});
