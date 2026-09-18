import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/layout/logo";
import { localeList } from "@/lib/i18n/config";

export async function SiteFooter() {
  const t = await getTranslations("marketing.footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");

  const columns = [
    { title: t("product"), links: [{ href: "/pricing", label: tNav("pricing") }] },
    {
      title: t("company"),
      links: [
        { href: "/about", label: tNav("about") },
        { href: "/contact", label: tNav("contact") },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-surface-muted/40">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-sm text-foreground-muted">{tCommon("tagline")}</p>
          </div>

          <div className="flex gap-12">
            {columns.map((column) => (
              <div key={column.title} className="flex flex-col gap-2.5">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                  {column.title}
                </h3>
                {column.links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}

            <div className="flex flex-col gap-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-subtle">
                {tCommon("appName")}
              </h3>
              {/* Real locale links, not a decorative flag row — these are the
                  crawlable entry points for each market. */}
              {localeList.map((option) => (
                <a
                  key={option.code}
                  href={`/${option.code}`}
                  hrefLang={option.code}
                  lang={option.code}
                  dir={option.direction}
                  className="text-sm text-foreground-muted transition-colors hover:text-foreground"
                >
                  {option.flag} {option.nativeName}
                </a>
              ))}
            </div>
          </div>
        </div>

        <p className="border-t border-border pt-6 text-xs text-foreground-subtle">
          {t("rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
