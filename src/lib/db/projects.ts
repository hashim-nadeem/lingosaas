import "server-only";
import type { ProjectStatus } from "@prisma/client";
import { forbidden, notFound } from "next/navigation";
import { prisma } from "./client";
import { requireWorkspace, type WorkspaceContext } from "./context";
import { pickTranslation } from "@/lib/i18n/translations";
import type { Locale } from "@/lib/i18n/config";

/**
 * Every function here derives `workspaceId` from `requireWorkspace()`.
 * None of them accepts one as an argument — that is what makes cross-tenant
 * access impossible rather than merely unlikely.
 */

const TRANSLATION_SELECT = {
  select: { locale: true, name: true, description: true },
} as const;

export type ProjectListItem = {
  id: string;
  status: ProjectStatus;
  createdAt: Date;
  name: string;
  description: string | null;
  /** Locale actually rendered — differs from the request when falling back. */
  resolvedLocale: string | null;
  createdBy: { id: string; name: string } | null;
};

export async function listProjects(
  locale: Locale,
  filter?: { status?: ProjectStatus },
): Promise<ProjectListItem[]> {
  const { workspace } = await requireWorkspace();

  const rows = await prisma.project.findMany({
    where: { workspaceId: workspace.id, ...(filter?.status ? { status: filter.status } : {}) },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      createdAt: true,
      translations: TRANSLATION_SELECT,
      createdBy: { select: { id: true, name: true } },
    },
  });

  return rows.map((row) => {
    const t = pickTranslation(row.translations, locale);
    return {
      id: row.id,
      status: row.status,
      createdAt: row.createdAt,
      name: t?.name ?? "",
      description: t?.description ?? null,
      resolvedLocale: t?.locale ?? null,
      createdBy: row.createdBy,
    };
  });
}

export async function getProject(id: string, locale: Locale) {
  const { workspace, role } = await requireWorkspace();

  // Scoped by workspaceId, so a valid id from another tenant is a 404 — not a
  // 403, which would confirm the resource exists.
  const project = await prisma.project.findFirst({
    where: { id, workspaceId: workspace.id },
    select: {
      id: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      translations: TRANSLATION_SELECT,
      createdBy: { select: { id: true, name: true, image: true } },
    },
  });

  if (!project) notFound();

  const resolved = pickTranslation(project.translations, locale);

  return {
    ...project,
    name: resolved?.name ?? "",
    description: resolved?.description ?? null,
    resolvedLocale: resolved?.locale ?? null,
    /** All translations, for the edit form. */
    translations: project.translations,
    role,
  };
}

export async function getProjectMetrics() {
  const { workspace } = await requireWorkspace();

  // One grouped query rather than four counts.
  const [byStatus, memberCount] = await Promise.all([
    prisma.project.groupBy({
      by: ["status"],
      where: { workspaceId: workspace.id },
      _count: { _all: true },
    }),
    prisma.workspaceMember.count({ where: { workspaceId: workspace.id } }),
  ]);

  const counts = Object.fromEntries(byStatus.map((r) => [r.status, r._count._all])) as Partial<
    Record<ProjectStatus, number>
  >;

  return {
    total: byStatus.reduce((sum, r) => sum + r._count._all, 0),
    active: counts.IN_PROGRESS ?? 0,
    completed: counts.COMPLETED ?? 0,
    planning: counts.PLANNING ?? 0,
    archived: counts.ARCHIVED ?? 0,
    members: memberCount,
  };
}

/** Assert the project belongs to the caller's workspace before mutating it. */
export async function assertProjectInWorkspace(
  id: string,
  context: WorkspaceContext,
): Promise<void> {
  const found = await prisma.project.findFirst({
    where: { id, workspaceId: context.workspace.id },
    select: { id: true },
  });
  if (!found) forbidden();
}
