import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * Locale-aware replacements for next/link and next/navigation.
 * Import these, never the next/* originals, or locale prefixes get dropped.
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
