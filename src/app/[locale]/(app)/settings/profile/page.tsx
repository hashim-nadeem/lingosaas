import { setRequestLocale } from "next-intl/server";
import { ProfileForm } from "@/components/settings/settings-forms";
import { requireSession } from "@/lib/db/context";

export default async function ProfileSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const user = await requireSession();

  return <ProfileForm name={user.name} email={user.email} />;
}
