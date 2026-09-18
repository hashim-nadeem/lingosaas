"use server";

import { randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { forbidden } from "next/navigation";
import { z } from "zod";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/db/client";
import {
  ACTIVE_WORKSPACE_COOKIE,
  requirePermission,
  requireSession,
  requireWorkspace,
} from "@/lib/db/context";
import { canAssignRole, canManageMember } from "@/lib/permissions";
import { emailSchema } from "@/lib/validations/auth";
import { uniqueSlug } from "@/lib/utils/slug";
import type { ActionState } from "./auth";

const INVITE_TTL_DAYS = 7;

/**
 * Switching workspace sets a cookie, but the cookie is only a hint —
 * `requireWorkspace()` re-verifies membership on every read. This check exists
 * so a forged value fails loudly here rather than silently falling back.
 */
export async function switchWorkspaceAction(workspaceId: string): Promise<void> {
  const user = await requireSession();

  const membership = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId: user.id } },
    select: { id: true },
  });
  if (!membership) forbidden();

  (await cookies()).set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  revalidatePath("/", "layout");
}

const workspaceNameSchema = z
  .string()
  .trim()
  .min(2, { message: "validation.minLength" })
  .max(60, { message: "validation.maxLength" });

export async function createWorkspaceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireSession();

  const parsed = z
    .object({ name: workspaceNameSchema, description: z.string().trim().max(300).optional() })
    .safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    });

  if (!parsed.success) return { fieldErrors: { name: "validation.required" } };

  const slug = await uniqueSlug(parsed.data.name, async (candidate) =>
    Boolean(await prisma.workspace.findUnique({ where: { slug: candidate }, select: { id: true } })),
  );

  try {
    const workspace = await prisma.$transaction(async (tx) => {
      const created = await tx.workspace.create({
        data: { name: parsed.data.name, description: parsed.data.description, slug, ownerId: user.id },
        select: { id: true },
      });
      await tx.workspaceMember.create({
        data: { workspaceId: created.id, userId: user.id, role: "OWNER" },
      });
      return created;
    });

    await switchWorkspaceAction(workspace.id);
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/", "layout");
  return {};
}

export async function updateWorkspaceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("workspace:update");

  const parsed = z
    .object({ name: workspaceNameSchema, description: z.string().trim().max(300).optional() })
    .safeParse({
      name: formData.get("name"),
      description: formData.get("description") || undefined,
    });

  if (!parsed.success) return { fieldErrors: { name: "validation.required" } };

  try {
    await prisma.workspace.update({
      where: { id: context.workspace.id },
      data: { name: parsed.data.name, description: parsed.data.description ?? null },
    });
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/", "layout");
  return {};
}

export async function deleteWorkspaceAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("workspace:delete");

  // Typing the slug is the confirmation — a misclick cannot destroy a tenant.
  if (formData.get("confirm") !== context.workspace.slug) {
    return { fieldErrors: { confirm: "validation.required" } };
  }

  try {
    await prisma.workspace.delete({ where: { id: context.workspace.id } });
    (await cookies()).delete(ACTIVE_WORKSPACE_COOKIE);
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/", "layout");
  return {};
}

const roleSchema = z.enum(["OWNER", "ADMIN", "MEMBER"]);

export async function inviteMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("member:invite");

  const parsed = z
    .object({ email: emailSchema, role: roleSchema })
    .safeParse({ email: formData.get("email"), role: formData.get("role") });

  if (!parsed.success) return { fieldErrors: { email: "validation.email" } };

  // An admin cannot mint an owner; only a role strictly below their own.
  if (!canAssignRole(context.role, "MEMBER", parsed.data.role)) forbidden();

  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
  const token = randomBytes(32).toString("base64url");

  try {
    await prisma.invitation.upsert({
      where: { workspaceId_email: { workspaceId: context.workspace.id, email: parsed.data.email } },
      create: {
        workspaceId: context.workspace.id,
        email: parsed.data.email,
        role: parsed.data.role,
        token,
        invitedById: context.user.id,
        expiresAt,
      },
      // Re-inviting rotates the token and extends the window.
      update: { role: parsed.data.role, token, expiresAt, acceptedAt: null },
    });
  } catch {
    return { error: "errors.formFailed" };
  }

  revalidatePath("/[locale]/team", "page");
  return {};
}

export async function revokeInvitationAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("member:invite");

  const id = formData.get("id");
  if (typeof id !== "string") return { error: "errors.formFailed" };

  // Scoped delete: an id from another workspace matches nothing.
  await prisma.invitation.deleteMany({ where: { id, workspaceId: context.workspace.id } });

  revalidatePath("/[locale]/team", "page");
  return {};
}

export async function removeMemberAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("member:remove");

  const memberId = formData.get("memberId");
  if (typeof memberId !== "string") return { error: "errors.formFailed" };

  const target = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId: context.workspace.id },
    select: { id: true, role: true, userId: true },
  });
  if (!target) forbidden();

  // Rank check, not just the permission bit: an admin may not remove an owner
  // or a peer admin, and the last owner may never be removed at all.
  if (!canManageMember(context.role, target.role)) forbidden();

  await prisma.workspaceMember.delete({ where: { id: target.id } });

  revalidatePath("/[locale]/team", "page");
  return {};
}

export async function changeMemberRoleAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const context = await requirePermission("member:changeRole");

  const memberId = formData.get("memberId");
  const parsedRole = roleSchema.safeParse(formData.get("role"));
  if (typeof memberId !== "string" || !parsedRole.success) return { error: "errors.formFailed" };

  const target = await prisma.workspaceMember.findFirst({
    where: { id: memberId, workspaceId: context.workspace.id },
    select: { id: true, role: true },
  });
  if (!target) forbidden();

  if (!canAssignRole(context.role, target.role, parsedRole.data as Role)) forbidden();

  await prisma.workspaceMember.update({
    where: { id: target.id },
    data: { role: parsedRole.data },
  });

  revalidatePath("/[locale]/team", "page");
  return {};
}

/** Marks everything the bell shows as read. */
export async function markNotificationsReadAction(): Promise<void> {
  const { user, workspace } = await requireWorkspace();

  await prisma.notification.updateMany({
    where: {
      userId: user.id,
      readAt: null,
      OR: [{ workspaceId: workspace.id }, { workspaceId: null }],
    },
    data: { readAt: new Date() },
  });

  revalidatePath("/[locale]/notifications", "page");
  revalidatePath("/", "layout");
}
