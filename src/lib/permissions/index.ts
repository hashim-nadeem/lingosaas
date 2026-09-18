import type { Role } from "@prisma/client";

/**
 * The permission matrix from the PRD, in one place.
 * Every authorization decision in the app routes through `can()`.
 */
export const PERMISSIONS = {
  "workspace:view": ["OWNER", "ADMIN", "MEMBER"],
  "workspace:update": ["OWNER", "ADMIN"],
  "workspace:delete": ["OWNER"],
  "project:view": ["OWNER", "ADMIN", "MEMBER"],
  "project:create": ["OWNER", "ADMIN", "MEMBER"],
  "project:update": ["OWNER", "ADMIN", "MEMBER"],
  "project:delete": ["OWNER", "ADMIN"],
  "member:view": ["OWNER", "ADMIN", "MEMBER"],
  "member:invite": ["OWNER", "ADMIN"],
  "member:remove": ["OWNER", "ADMIN"],
  "member:changeRole": ["OWNER", "ADMIN"],
} as const satisfies Record<string, readonly Role[]>;

export type Permission = keyof typeof PERMISSIONS;

export function can(role: Role, permission: Permission): boolean {
  return (PERMISSIONS[permission] as readonly Role[]).includes(role);
}

/**
 * Rank guards the cases a flat matrix cannot express: an ADMIN may manage
 * MEMBERs but never an OWNER or a peer ADMIN, and OWNER is never demotable
 * by anyone but themselves (handled at the action layer via ownership transfer).
 */
const RANK: Record<Role, number> = { OWNER: 3, ADMIN: 2, MEMBER: 1 };

export function outranks(actor: Role, target: Role): boolean {
  return RANK[actor] > RANK[target];
}

/** Can `actor` act on a membership currently held at `target`? */
export function canManageMember(actor: Role, target: Role): boolean {
  return can(actor, "member:remove") && outranks(actor, target);
}

/** Can `actor` move a member from `from` to `to`? */
export function canAssignRole(actor: Role, from: Role, to: Role): boolean {
  if (!can(actor, "member:changeRole")) return false;
  // You may never grant a role at or above your own.
  return outranks(actor, from) && outranks(actor, to);
}
