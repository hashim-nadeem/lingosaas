"use client";

import { useTranslations } from "next-intl";

/**
 * next-intl types `t()` against the literal message keys, which is exactly what
 * you want at a call site — and exactly what you cannot have when a server
 * action hands back a key at runtime.
 *
 * This is the single sanctioned cast. Keys that reach it must be
 * parameter-free, since there is nothing to interpolate with.
 */
export function useMessage() {
  const t = useTranslations();
  return (key: string): string => t(key as never);
}
