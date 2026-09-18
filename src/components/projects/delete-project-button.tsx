"use client";

import { useActionState, useState } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { deleteProjectAction } from "@/actions/projects";
import type { ActionState } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { SubmitButton } from "@/components/ui/form-status";

const EMPTY: ActionState = {};

export function DeleteProjectButton({
  projectId,
  projectName,
  locale,
}: {
  projectId: string;
  projectName: string;
  locale: string;
}) {
  const t = useTranslations("projects");
  const [open, setOpen] = useState(false);
  const [, action] = useActionState(deleteProjectAction, EMPTY);

  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <Trash2 className="size-4 text-danger" aria-hidden="true" />
        <span className="sr-only sm:not-sr-only">{t("deleteTitle")}</span>
      </Button>

      <ConfirmDialog
        open={open}
        onClose={() => setOpen(false)}
        title={t("deleteTitle")}
        description={t("deleteConfirm", { name: projectName })}
        footer={
          <form action={action}>
            <input type="hidden" name="id" value={projectId} />
            <input type="hidden" name="locale" value={locale} />
            <SubmitButton variant="danger" size="sm">
              {t("deleteTitle")}
            </SubmitButton>
          </form>
        }
      />
    </>
  );
}
