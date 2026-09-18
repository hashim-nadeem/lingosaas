import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

/**
 * Locale negotiation only (Next 16 renamed this convention from `middleware`).
 *
 * Auth is deliberately NOT enforced here. Route protection lives in the
 * data-access layer (`requireSession` / `requireWorkspace`), so a missed matcher
 * entry can never expose data — the worst case is an unstyled redirect.
 */
export default createMiddleware(routing);

export const config = {
  // Everything except API routes, Next internals and files with an extension.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
