import type { MetadataRoute } from "next";
import { APP_URL } from "@/lib/i18n/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Authenticated surfaces and the auth endpoints are never useful to a crawler.
      disallow: ["/api/", "/*/dashboard", "/*/projects", "/*/team", "/*/settings", "/*/notifications"],
    },
    sitemap: `${APP_URL}/sitemap.xml`,
  };
}
