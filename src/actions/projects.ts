"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/client";
import { requirePermission } from "@/lib/db/context";
import { assertProjectInWorkspace } from "@/lib/db/projects";
import { defaultLocale, isLocale, locales } from "@/lib/i18n/config";
import { projectFromFormData, type ProjectInput } from "@/lib/validations/project";
import type { ActionState } from "./auth";

/**
 * Mutations start with `requirePermission`, which resolves the tenant AND the
 * role in one call. Nothing here reads a workspace id from the request.
 */

export async function createProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("project:create");
  const parsed = projectFromFormData(formData);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error) };

  const { status, translations } = parsed.data;

  try {
    const project = await prisma.project.create({
      data: {
        workspaceId: context.workspace.id,
        createdById: context.user.id,
        status,
        translations: { create: translationRows(translations) },
      },
      select: { id: true, translations: { where: { locale: "en-US" }, select: { name: true } } },
    });

    await notifyWorkspace(context.workspace.id, context.user.id, "PROJECT_CREATED", {
      actor: context.user.name,
      project: project.translations[0]?.name ?? "",
    });
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]/dashboard", "page");
  redirect(`/${localeFrom(formData)}/projects`);
}

export async function updateProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("project:update");

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "errors.formFailed" };
  await assertProjectInWorkspace(id, context);

  const parsed = projectFromFormData(formData);
  if (!parsed.success) return { fieldErrors: flatten(parsed.error) };

  const { status, translations } = parsed.data;

  try {
    await prisma.$transaction([
      prisma.project.update({ where: { id }, data: { status } }),
      // Upsert per locale: editing en-US must not drop the Arabic translation.
      ...translationRows(translations).map((row) =>
        prisma.projectTranslation.upsert({
          where: { projectId_locale: { projectId: id, locale: row.locale } },
          create: { projectId: id, ...row },
          update: { name: row.name, description: row.description },
        }),
      ),
    ]);
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/[locale]/projects", "page");
  revalidatePath(`/[locale]/projects/${id}`, "page");
  revalidatePath("/[locale]/dashboard", "page");
  redirect(`/${localeFrom(formData)}/projects/${id}`);
}

export async function deleteProjectAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("project:delete");

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "errors.formFailed" };
  await assertProjectInWorkspace(id, context);

  try {
    await prisma.project.delete({ where: { id } });
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/[locale]/projects", "page");
  revalidatePath("/[locale]/dashboard", "page");
  redirect(`/${localeFrom(formData)}/projects`);
}

/** The locale is a hidden form field; never trust it without validating. */
function localeFrom(formData: FormData) {
  const value = formData.get("locale");
  return isLocale(value) ? value : defaultLocale;
}

type TranslationRow = { locale: string; name: string; description: string | null };

/** Drops locales the user left blank — an empty row would beat the fallback. */
function translationRows(translations: ProjectInput["translations"]): TranslationRow[] {
  const rows: TranslationRow[] = [];
  for (const locale of locales) {
    const entry = translations[locale];
    const name = entry?.name?.trim();
    if (!name) continue;
    rows.push({ locale, name, description: entry?.description?.trim() || null });
  }
  return rows;
}

function flatten(error: { issues: { path: PropertyKey[]; message: string }[] }) {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    if (key && !out[key]) out[key] = issue.message;
  }
  return out;
}

/** Fan a notification out to everyone in the workspace except the actor. */
async function notifyWorkspace(
  workspaceId: string,
  actorId: string,
  type: "PROJECT_CREATED" | "PROJECT_UPDATED" | "MEMBER_INVITED" | "WORKSPACE_UPDATED",
  params: Record<string, string>,
) {
  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId, userId: { not: actorId } },
    select: { userId: true },
  });
  if (members.length === 0) return;

  await prisma.notification.createMany({
    data: members.map((m) => ({
      userId: m.userId,
      workspaceId,
      type,
      messageKey: type,
      params,
    })),
  });
}
