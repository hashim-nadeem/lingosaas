/**
 * Deliberately small (PRD §46). Structured console output is enough for now,
 * and keeping every error path behind one function means swapping in Sentry
 * later is a change to this file, not to fifty call sites.
 */
type Scope = "auth" | "db" | "action" | "render";

export function logError(scope: Scope, error: unknown, context?: Record<string, unknown>) {
  const payload = {
    level: "error",
    scope,
    message: error instanceof Error ? error.message : String(error),
    // Never log the stack in production: it reaches the browser console.
    stack: process.env.NODE_ENV === "development" && error instanceof Error ? error.stack : undefined,
    ...context,
  };
  console.error(JSON.stringify(payload));
}

export function logEvent(scope: Scope, message: string, context?: Record<string, unknown>) {
  console.log(JSON.stringify({ level: "info", scope, message, ...context }));
}
