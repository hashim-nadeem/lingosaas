import { loadEnvFile } from "node:process";
import { defineConfig, env } from "prisma/config";

// Prisma 7 no longer reads .env on its own. Node 22 does, so no dotenv needed.
// Absent in CI/Vercel, where DATABASE_URL is already in the environment.
try {
  loadEnvFile(".env");
} catch {
  // no .env file — fall through to the real environment
}

/**
 * Prisma 7 moved the connection URL out of schema.prisma. This file configures
 * the CLI (migrate, db push, seed); the runtime client gets its connection from
 * the pg driver adapter in src/lib/db/client.ts.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: env("DATABASE_URL"),
  },
  migrations: {
    seed: "npx tsx prisma/seed.ts",
  },
});
