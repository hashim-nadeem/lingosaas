import { setRequestLocale } from "next-intl/server";
import { PreferencesForm } from "@/components/settings/settings-forms";
import { requireSession } from "@/lib/db/context";
import { getUserPreference } from "@/lib/db/team";
import { getLocaleConfig, localeList } from "@/lib/i18n/config";

/**
 * A curated zone list, not the full IANA database: 400+ options in a <select>
 * is unusable, and these cover the markets the product ships to. The server
 * still validates against the real zone database, so any value works if set.
 */
const TIMEZONES = [
  ...new Set([
    ...localeList.map((l) => getLocaleConfig(l.code).timezone),
    "America/Los_Angeles",
    "America/Chicago",
    "America/Bogota",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Madrid",
    "Europe/Berlin",
    "Africa/Cairo",
    "Asia/Riyadh",
    "Asia/Karachi",
    "Asia/Kolkata",
    "Asia/Singapore",
    "Asia/Tokyo",
    "Australia/Sydney",
    "UTC",
  ]),
].sort();

export default async function PreferencesSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const user = await requireSession();
  const preference = await getUserPreference(user.id);
  const config = getLocaleConfig(locale);

  return (
    <PreferencesForm
      locale={preference?.locale ?? locale}
      timezone={preference?.timezone ?? config.timezone}
      theme={preference?.theme ?? "SYSTEM"}
      notifyInApp={preference?.notifyInApp ?? true}
      notifyEmail={preference?.notifyEmail ?? false}
      timezones={TIMEZONES}
    />
  );
}
