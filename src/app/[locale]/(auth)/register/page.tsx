import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RegisterForm } from "@/components/auth/auth-forms";
import { Card } from "@/components/ui/card";
import { FadeIn } from "@/components/motion/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.register" });
  return { title: t("title"), description: t("description"), robots: { index: false } };
}

export default async function RegisterPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("auth");

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{t("register.title")}</h1>
        <p className="text-sm text-foreground-muted">{t("register.subtitle")}</p>
      </div>

      <Card className="p-6 shadow-md">
        <RegisterForm />
      </Card>

      <p className="text-center text-sm text-foreground-muted">
        {t("register.hasAccount")}{" "}
        <Link href="/login" className="rounded font-medium text-accent underline-offset-4 hover:underline">
          {t("register.signIn")}
        </Link>
      </p>
    </FadeIn>
  );
}
