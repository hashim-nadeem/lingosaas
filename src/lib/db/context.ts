import "server-only";
import { cookies } from "next/headers";
import { forbidden, unauthorized } from "next/navigation";
import type { Role } from "@prisma/client";
import { auth } from "@/lib/auth";
import { can, type Permission } from "@/lib/permissions";
import { prisma } from "./client";

export const ACTIVE_WORKSPACE_COOKIE = "LINGOSAAS_WORKSPACE";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  image: string | null;
};

export type WorkspaceContext = {
  user: SessionUser;
  workspace: { id: string; name: string; slug: string; description: string | null; ownerId: string };
  role: Role;
};

/**
 * The authentication boundary. Every server action, route handler and data
 * function starts here — never at a component.
 */
export async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  const id = session?.user?.id;
  if (!id) unauthorized();

  // The JWT can outlive the row it points at (deleted account, rotated secret).
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, image: true },
  });
  if (!user) unauthorized();

  return user;
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, name: true, email: true, image: true },
  });
}

/**
 * The tenant boundary.
 *
 * The active workspace arrives as a cookie, which is client-controlled and
 * therefore untrusted: it is only ever used as a *hint*, and the membership
 * lookup below is what actually authorizes access. A forged cookie naming
 * someone else's workspace matches no membership row and falls through to the
 * user's own first workspace.
 */
export async function requireWorkspace(): Promise<WorkspaceContext> {
  const user = await requireSession();
  const hint = (await cookies()).get(ACTIVE_WORKSPACE_COOKIE)?.value;

  const membership =
    (hint
      ? await prisma.workspaceMember.findUnique({
          where: { workspaceId_userId: { workspaceId: hint, userId: user.id } },
          select: { role: true, workspace: WORKSPACE_FIELDS },
        })
      : null) ??
    (await prisma.workspaceMember.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "asc" },
      select: { role: true, workspace: WORKSPACE_FIELDS },
    }));

  // Authenticated but in no workspace at all — the app shell sends them to
  // workspace creation rather than rendering an empty tenant.
  if (!membership) forbidden();

  return { user, workspace: membership.workspace, role: membership.role };
}

const WORKSPACE_FIELDS = {
  select: { id: true, name: true, slug: true, description: true, ownerId: true },
} as const;

/** Same as requireWorkspace, but also asserts a capability from the matrix. */
export async function requirePermission(permission: Permission): Promise<WorkspaceContext> {
  const context = await requireWorkspace();
  if (!can(context.role, permission)) forbidden();
  return context;
}

/** Every workspace the user belongs to — for the switcher. */
export async function listUserWorkspaces(userId: string) {
  const rows = await prisma.workspaceMember.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    select: { role: true, workspace: { select: { id: true, name: true, slug: true } } },
  });
  return rows.map((r) => ({ ...r.workspace, role: r.role }));
}
