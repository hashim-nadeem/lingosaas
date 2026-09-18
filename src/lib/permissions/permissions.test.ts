import { describe, expect, it } from "vitest";
import type { Role } from "@prisma/client";
import { can, canAssignRole, canManageMember, outranks, PERMISSIONS } from "./index";

const ROLES: Role[] = ["OWNER", "ADMIN", "MEMBER"];

describe("permission matrix (PRD §14)", () => {
  it("matches the PRD table exactly", () => {
    // Every cell of the published matrix, asserted rather than assumed.
    const table: [Parameters<typeof can>[1], Record<Role, boolean>][] = [
      ["workspace:view", { OWNER: true, ADMIN: true, MEMBER: true }],
      ["project:view", { OWNER: true, ADMIN: true, MEMBER: true }],
      ["project:create", { OWNER: true, ADMIN: true, MEMBER: true }],
      ["project:update", { OWNER: true, ADMIN: true, MEMBER: true }],
      ["project:delete", { OWNER: true, ADMIN: true, MEMBER: false }],
      ["member:invite", { OWNER: true, ADMIN: true, MEMBER: false }],
      ["member:remove", { OWNER: true, ADMIN: true, MEMBER: false }],
      ["member:changeRole", { OWNER: true, ADMIN: true, MEMBER: false }],
      ["workspace:update", { OWNER: true, ADMIN: true, MEMBER: false }],
      ["workspace:delete", { OWNER: true, ADMIN: false, MEMBER: false }],
    ];

    for (const [permission, expected] of table) {
      for (const role of ROLES) {
        expect(can(role, permission), `${role} / ${permission}`).toBe(expected[role]);
      }
    }
  });

  it("grants MEMBER nothing destructive", () => {
    const destructive = ["project:delete", "workspace:delete", "member:remove", "member:invite"] as const;
    for (const permission of destructive) {
      expect(can("MEMBER", permission)).toBe(false);
    }
  });

  it("never lists a role outside the enum", () => {
    for (const roles of Object.values(PERMISSIONS)) {
      for (const role of roles) expect(ROLES).toContain(role);
    }
  });
});

describe("rank rules", () => {
  it("nobody outranks themselves", () => {
    for (const role of ROLES) expect(outranks(role, role)).toBe(false);
  });

  it("ranks owner above admin above member", () => {
    expect(outranks("OWNER", "ADMIN")).toBe(true);
    expect(outranks("OWNER", "MEMBER")).toBe(true);
    expect(outranks("ADMIN", "MEMBER")).toBe(true);
    expect(outranks("ADMIN", "OWNER")).toBe(false);
    expect(outranks("MEMBER", "ADMIN")).toBe(false);
  });
});

describe("member management guards", () => {
  it("lets an owner remove admins and members", () => {
    expect(canManageMember("OWNER", "ADMIN")).toBe(true);
    expect(canManageMember("OWNER", "MEMBER")).toBe(true);
  });

  it("stops an admin removing an owner or a peer admin", () => {
    // Privilege escalation: an admin must not be able to unseat the owner.
    expect(canManageMember("ADMIN", "OWNER")).toBe(false);
    expect(canManageMember("ADMIN", "ADMIN")).toBe(false);
  });

  it("lets an admin remove a member", () => {
    expect(canManageMember("ADMIN", "MEMBER")).toBe(true);
  });

  it("stops a member removing anyone, including another member", () => {
    for (const target of ROLES) {
      expect(canManageMember("MEMBER", target)).toBe(false);
    }
  });

  it("never lets an owner be removed by anyone", () => {
    // Guarantees a workspace always retains its owner.
    for (const actor of ROLES) {
      expect(canManageMember(actor, "OWNER")).toBe(false);
    }
  });
});

describe("role assignment guards", () => {
  it("lets an owner promote a member to admin and demote back", () => {
    expect(canAssignRole("OWNER", "MEMBER", "ADMIN")).toBe(true);
    expect(canAssignRole("OWNER", "ADMIN", "MEMBER")).toBe(true);
  });

  it("stops anyone granting a role at or above their own", () => {
    expect(canAssignRole("OWNER", "MEMBER", "OWNER")).toBe(false);
    expect(canAssignRole("ADMIN", "MEMBER", "ADMIN")).toBe(false);
    expect(canAssignRole("ADMIN", "MEMBER", "OWNER")).toBe(false);
  });

  it("stops an admin changing an owner's or another admin's role", () => {
    expect(canAssignRole("ADMIN", "OWNER", "MEMBER")).toBe(false);
    expect(canAssignRole("ADMIN", "ADMIN", "MEMBER")).toBe(false);
  });

  it("stops a member changing any role", () => {
    for (const from of ROLES) {
      for (const to of ROLES) {
        expect(canAssignRole("MEMBER", from, to)).toBe(false);
      }
    }
  });

  it("allows an admin exactly one transition: member stays a member", () => {
    // The only role an admin can assign is MEMBER, to someone already below them.
    expect(canAssignRole("ADMIN", "MEMBER", "MEMBER")).toBe(true);
  });
});
