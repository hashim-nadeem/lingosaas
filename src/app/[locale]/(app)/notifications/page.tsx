import { getTranslations, setRequestLocale } from "next-intl/server";
import { BellOff } from "lucide-react";
import { markNotificationsReadAction } from "@/actions/workspace";
import { NotificationLine } from "@/components/dashboard/notification-line";
import { LocaleAwareRelativeTime } from "@/components/localization/locale-aware";
import { FadeIn } from "@/components/motion/primitives";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/states";
import { countUnreadNotifications, listNotifications } from "@/lib/db/team";

export default async function NotificationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("notifications");
  const [notifications, unread] = await Promise.all([
    listNotifications(50),
    countUnreadNotifications(),
  ]);

  return (
    <FadeIn className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h1>
          <p className="text-sm text-foreground-muted">{t("unreadCount", { count: unread })}</p>
        </div>

        {unread > 0 && (
          <form action={markNotificationsReadAction}>
            <Button type="submit" variant="secondary" size="sm">
              {t("markAllRead")}
            </Button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyState icon={<BellOff />} title={t("empty.title")} description={t("empty.description")} />
      ) : (
        <Card>
          <ul>
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className="border-b border-border px-5 py-3.5 last:border-0"
              >
                <NotificationLine
                  messageKey={notification.messageKey}
                  params={notification.params}
                  unread={notification.readAt === null}
                />
                <p className="mt-1 ps-3.5 text-xs text-foreground-subtle">
                  <LocaleAwareRelativeTime value={notification.createdAt} />
                </p>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </FadeIn>
  );
}
