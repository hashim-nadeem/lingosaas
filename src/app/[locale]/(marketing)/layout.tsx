import { setRequestLocale } from "next-intl/server";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";

/**
 * Deliberately does NOT read the session.
 *
 * Reading cookies here would opt every marketing page out of static rendering,
 * trading crawlability and TTFB for a header that says "Dashboard" instead of
 * "Sign in". Signed-in visitors are redirected from /login and /register
 * instead, which costs nothing and reads the same.
 */
export default async function MarketingLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-dvh flex-col bg-canvas">
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
    </div>
  );
}
