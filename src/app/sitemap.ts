import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n/config";
import { APP_URL } from "@/lib/i18n/metadata";

const PUBLIC_PATHS = ["", "/pricing", "/about", "/contact"] as const;

/**
 * Only marketing routes. Application pages are behind auth and marked
 * noindex; listing them would invite crawlers to a wall of 401s.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_PATHS.flatMap((path) =>
    locales.map((locale) => ({
      url: `${APP_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: path === "" ? 1 : 0.7,
      // Every entry points at its siblings, so each market is discovered.
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, `${APP_URL}/${l}${path}`])),
      },
    })),
  );
}
