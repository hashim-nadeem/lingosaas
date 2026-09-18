import { getTranslations } from "next-intl/server";
import type { Prisma } from "@prisma/client";
import { cn } from "@/lib/utils/cn";

/**
 * Notifications store a message KEY plus params, never rendered prose — so a
 * notification written while the user was on English reads correctly in Arabic
 * after they switch. The key comes from our own enum, not user input.
 */
export async function NotificationLine({
  messageKey,
  params,
  unread,
}: {
  messageKey: string;
  params: Prisma.JsonValue;
  unread: boolean;
}) {
  const t = await getTranslations("notifications.messages");
  const values = (params && typeof params === "object" && !Array.isArray(params) ? params : {}) as Record<
    string,
    string
  >;

  return (
    <p className={cn("flex items-start gap-2 text-sm", unread ? "text-foreground" : "text-foreground-muted")}>
      {unread && (
        <span
          className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent"
          aria-label="unread"
          role="img"
        />
      )}
      <span>{t(messageKey as never, values as never)}</span>
    </p>
  );
}
