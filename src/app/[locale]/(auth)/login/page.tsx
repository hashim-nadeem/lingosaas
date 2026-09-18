import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LoginForm } from "@/components/auth/auth-forms";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.login" });
  return { title: t("title"), description: t("description"), robots: { index: false } };
}

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("login.title")}</h1>
        <p className="text-sm text-foreground-muted">{t("login.subtitle")}</p>
      </div>

      <Card className="p-6 shadow-md">
        <LoginForm />
      </Card>

      {/* ponytail: no password-reset flow yet — it needs an email provider the
          MVP does not have, and a dead "forgot password" link is worse than no
          link. Messages for it already exist in the catalogs; add the page plus
          a PasswordResetToken model when mail is wired up. */}
      <div className="flex flex-col items-center gap-3 text-sm">
        <p className="text-foreground-muted">
          {t("login.noAccount")}{" "}
          <Link href="/register" className="rounded font-medium text-accent underline-offset-4 hover:underline">
            {t("login.createOne")}
          </Link>
        </p>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-surface-muted/50 px-4 py-3 text-center text-xs text-foreground-muted">
        <span className="font-medium text-foreground">{t("demo.label")}</span>{" "}
        {t("demo.hint", { email: "demo@lingosaas.dev", password: "demo1234" })}
      </div>
    </FadeIn>
  );
}
