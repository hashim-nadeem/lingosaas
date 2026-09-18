/**
 * URL slug from arbitrary user input, including Arabic.
 *
 * NFKD + stripping combining marks folds accented Latin ("Rediseño" → "rediseno").
 * Arabic has no ASCII fold, so a fully non-Latin name legitimately reduces to
 * nothing — callers must handle the empty string (see `uniqueSlug`).
 */
export function slugify(input: string): string {
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

/**
 * Appends a short random suffix until `exists` says the slug is free.
 * Falls back to a generated stem when the name yields no ASCII at all.
 */
export async function uniqueSlug(
  name: string,
  exists: (slug: string) => Promise<boolean>,
): Promise<string> {
  const stem = slugify(name) || "workspace";
  if (!(await exists(stem))) return stem;

  for (let i = 0; i < 5; i++) {
    const candidate = `${stem}-${Math.random().toString(36).slice(2, 7)}`;
    if (!(await exists(candidate))) return candidate;
  }
  // Astronomically unlikely; a timestamp is guaranteed to differ.
  return `${stem}-${Date.now().toString(36)}`;
}
