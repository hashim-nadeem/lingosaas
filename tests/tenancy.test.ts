import { loadEnvFile } from "node:process";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

try {
  loadEnvFile(".env");
} catch {
  // CI provides the environment directly
}

/**
 * Integration tests against a real Postgres (`docker compose up -d postgres`).
 *
 * These assert the database-level guarantees the application layer relies on.
 * The unit tests prove the permission *rules*; these prove the schema actually
 * enforces the constraints those rules assume — the two together are what make
 * "tenant isolation" a fact rather than a claim.
 */
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SUFFIX = Math.random().toString(36).slice(2, 8);
const email = (name: string) => `${name}-${SUFFIX}@test.local`;

let alphaWorkspaceId: string;
let betaWorkspaceId: string;
let alphaProjectId: string;
let betaProjectId: string;
let alphaUserId: string;
let betaUserId: string;

beforeAll(async () => {
  const alphaUser = await prisma.user.create({
    data: { name: "Alpha Owner", email: email("alpha"), passwordHash: "x" },
    select: { id: true },
  });
  const betaUser = await prisma.user.create({
    data: { name: "Beta Owner", email: email("beta"), passwordHash: "x" },
    select: { id: true },
  });
  alphaUserId = alphaUser.id;
  betaUserId = betaUser.id;

  const alpha = await prisma.workspace.create({
    data: {
      name: "Alpha",
      slug: `alpha-${SUFFIX}`,
      ownerId: alphaUserId,
      members: { create: { userId: alphaUserId, role: "OWNER" } },
      projects: {
        create: { status: "PLANNING", translations: { create: { locale: "en-US", name: "Alpha Secret" } } },
      },
    },
    select: { id: true, projects: { select: { id: true } } },
  });

  const beta = await prisma.workspace.create({
    data: {
      name: "Beta",
      slug: `beta-${SUFFIX}`,
      ownerId: betaUserId,
      members: { create: { userId: betaUserId, role: "OWNER" } },
      projects: {
        create: { status: "PLANNING", translations: { create: { locale: "en-US", name: "Beta Secret" } } },
      },
    },
    select: { id: true, projects: { select: { id: true } } },
  });

  alphaWorkspaceId = alpha.id;
  betaWorkspaceId = beta.id;
  alphaProjectId = alpha.projects[0].id;
  betaProjectId = beta.projects[0].id;
});

afterAll(async () => {
  await prisma.workspace.deleteMany({ where: { slug: { in: [`alpha-${SUFFIX}`, `beta-${SUFFIX}`] } } });
  await prisma.user.deleteMany({ where: { id: { in: [alphaUserId, betaUserId] } } });
  await prisma.$disconnect();
});

describe("tenant isolation", () => {
  it("does not return another workspace's project when scoped by workspaceId", () => {
    // This is exactly the query shape lib/db/projects.ts uses.
    return expect(
      prisma.project.findFirst({
        where: { id: betaProjectId, workspaceId: alphaWorkspaceId },
        select: { id: true },
      }),
    ).resolves.toBeNull();
  });

  it("returns the project when the workspace does match", async () => {
    const found = await prisma.project.findFirst({
      where: { id: alphaProjectId, workspaceId: alphaWorkspaceId },
      select: { id: true },
    });
    expect(found?.id).toBe(alphaProjectId);
  });

  it("finds no membership for a user in a workspace they do not belong to", async () => {
    // The forged-cookie path: a valid workspace id the user has no claim on.
    const membership = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: betaWorkspaceId, userId: alphaUserId } },
    });
    expect(membership).toBeNull();
  });

  it("lists only the caller's own projects", async () => {
    const projects = await prisma.project.findMany({
      where: { workspaceId: alphaWorkspaceId },
      select: { id: true },
    });
    expect(projects.map((p) => p.id)).toEqual([alphaProjectId]);
  });
});

describe("schema constraints", () => {
  it("rejects two translations of the same project in one locale", async () => {
    await expect(
      prisma.projectTranslation.create({
        data: { projectId: alphaProjectId, locale: "en-US", name: "Duplicate" },
      }),
    ).rejects.toThrow();
  });

  it("rejects a duplicate membership for the same user and workspace", async () => {
    await expect(
      prisma.workspaceMember.create({
        data: { workspaceId: alphaWorkspaceId, userId: alphaUserId, role: "MEMBER" },
      }),
    ).rejects.toThrow();
  });

  it("cascades project and translation deletes when a workspace is removed", async () => {
    const temp = await prisma.workspace.create({
      data: {
        name: "Temp",
        slug: `temp-${SUFFIX}`,
        ownerId: alphaUserId,
        projects: {
          create: { status: "PLANNING", translations: { create: { locale: "en-US", name: "Temp" } } },
        },
      },
      select: { id: true, projects: { select: { id: true } } },
    });
    const projectId = temp.projects[0].id;

    await prisma.workspace.delete({ where: { id: temp.id } });

    // No orphan rows: deleting a tenant must take its data with it.
    expect(await prisma.project.findUnique({ where: { id: projectId } })).toBeNull();
    expect(
      await prisma.projectTranslation.findFirst({ where: { projectId } }),
    ).toBeNull();
  });

  it("keeps a project when its creator is deleted, nulling the reference", async () => {
    const ghost = await prisma.user.create({
      data: { name: "Ghost", email: email("ghost"), passwordHash: "x" },
      select: { id: true },
    });
    const project = await prisma.project.create({
      data: {
        workspaceId: alphaWorkspaceId,
        createdById: ghost.id,
        translations: { create: { locale: "en-US", name: "Orphaned" } },
      },
      select: { id: true },
    });

    await prisma.user.delete({ where: { id: ghost.id } });

    // A departing employee must not delete the workspace's project history.
    const after = await prisma.project.findUnique({
      where: { id: project.id },
      select: { createdById: true },
    });
    expect(after).not.toBeNull();
    expect(after?.createdById).toBeNull();

    await prisma.project.delete({ where: { id: project.id } });
  });
});
