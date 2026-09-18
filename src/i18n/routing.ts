import { defineRouting } from "next-intl/routing";
import { defaultLocale, locales } from "@/lib/i18n/config";

export const routing = defineRouting({
  locales,
  defaultLocale,
  // Every locale is prefixed, including the default. Keeps URLs symmetric,
  // keeps `hreflang`/canonical simple, and avoids a rootless default route.
  localePrefix: "always",
  localeCookie: {
    name: "LINGOSAAS_LOCALE",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  },
});
