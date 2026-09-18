import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { locales, type Locale } from "./config";

export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

type MetadataNamespace = "home" | "pricing" | "about" | "contact";

/**
 * Builds per-page localized metadata.
 *
 * `alternates` must be set per PAGE, not in the layout: Next merges metadata
 * down the tree, so a layout-level canonical silently makes every child page
 * canonicalize to the locale root — which de-indexes the whole site.
 */
export async function marketingMetadata(
  locale: string,
  namespace: MetadataNamespace,
  path = "",
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `metadata.${namespace}` });
  const title = t("title");
  const description = t("description");

  return {
    title,
    description,
    alternates: {
      canonical: `/${locale}${path}`,
      languages: Object.fromEntries(locales.map((l) => [l, `/${l}${path}`])),
    },
    openGraph: {
      type: "website",
      locale,
      url: `/${locale}${path}`,
      siteName: "LingoSaaS",
      title,
      description,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** Application and auth pages: titled, described, never indexed (PRD §37). */
export async function privateMetadata(
  locale: string,
  namespace: string,
): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: `metadata.${namespace}` });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: false, follow: false },
  };
}

export type { Locale };
