"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { StatusPage } from "@/components/layout/status-page";
import { Button } from "@/components/ui/button";
import { logError } from "@/lib/utils/logger";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("errors.generic");

  useEffect(() => {
    // The digest is the only safe handle on a server error in production —
    // the message itself is redacted before it reaches the client.
    logError("render", error);
  }, [error]);

  return (
    <StatusPage
      code={error.digest ?? "500"}
      title={t("title")}
      description={t("description")}
      action={<Button onClick={reset}>{t("action")}</Button>}
    />
  );
}
