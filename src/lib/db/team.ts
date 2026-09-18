import "server-only";
import { prisma } from "./client";
import { requireWorkspace } from "./context";

export async function listMembers() {
  const { workspace } = await requireWorkspace();

  return prisma.workspaceMember.findMany({
    where: { workspaceId: workspace.id },
    // Owner first, then admins, then members; stable by join date within a role.
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      role: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, image: true } },
    },
  });
}

export async function listPendingInvitations() {
  const { workspace } = await requireWorkspace();

  return prisma.invitation.findMany({
    where: { workspaceId: workspace.id, acceptedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, role: true, expiresAt: true, createdAt: true },
  });
}

export async function listNotifications(limit = 20) {
  const { user, workspace } = await requireWorkspace();

  return prisma.notification.findMany({
    // Scoped to the user AND the active workspace: switching workspace must not
    // surface the other tenant's activity.
    where: { userId: user.id, OR: [{ workspaceId: workspace.id }, { workspaceId: null }] },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      messageKey: true,
      params: true,
      readAt: true,
      createdAt: true,
    },
  });
}

export async function countUnreadNotifications() {
  const { user, workspace } = await requireWorkspace();

  return prisma.notification.count({
    where: {
      userId: user.id,
      readAt: null,
      OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
    },
  });
}

export async function getUserPreference(userId: string) {
  return prisma.userPreference.findUnique({
    where: { userId },
    select: { locale: true, timezone: true, theme: true, notifyInApp: true, notifyEmail: true },
  });
}
