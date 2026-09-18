"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/localization/language-switcher";
import { Logo } from "@/components/layout/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const LINKS = [
  { href: "/pricing", key: "pricing" },
  { href: "/about", key: "about" },
  { href: "/contact", key: "contact" },
] as const;

export function SiteHeader() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-(--z-header) transition-[background-color,border-color,backdrop-filter]",
        "duration-(--duration-normal)",
        scrolled
          ? "border-b border-border bg-canvas/80 backdrop-blur-md"
          : "border-b border-transparent bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link href="/" className="rounded-lg">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label={t("features")}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
            >
              {t(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher compact />

          <div className="hidden items-center gap-2 sm:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{tCommon("signIn")}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/register">{tCommon("getStarted")}</Link>
            </Button>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            className="rounded-lg p-2 text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground md:hidden"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-border bg-canvas px-5 py-3 md:hidden">
          <nav className="flex flex-col gap-0.5" aria-label={t("features")}>
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                // Closing here rather than in an effect on pathname: the click
                // IS the event, so no cascading render is needed to observe it.
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground-muted transition-colors hover:bg-surface-muted hover:text-foreground"
              >
                {t(link.key)}
              </Link>
            ))}
          </nav>
          <div className="mt-2 flex flex-col gap-2 border-t border-border pt-3 sm:hidden">
            <Button asChild variant="secondary" className="w-full">
              <Link href="/login">{tCommon("signIn")}</Link>
            </Button>
            <Button asChild className="w-full">
              <Link href="/register">{tCommon("getStarted")}</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
