<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# LingoSaaS conventions

Invariants that are not obvious from reading any single file. Breaking one of
these is a bug even when it typechecks.

## Tenancy
- No function in `src/lib/db/` or `src/actions/` takes a `workspaceId` argument.
  It always comes from `requireWorkspace()`. There must be no parameter to forge.
- Every server action starts with `requireSession`, `requireWorkspace` or
  `requirePermission` — before reading `formData`.
- A resource belonging to another tenant is `notFound()`, never `forbidden()`.
  A 403 confirms the resource exists.
- The role is never a JWT claim. It is re-read per request.

## i18n
- Nothing hardcodes a currency, timezone, direction or locale name. It all comes
  from `src/lib/i18n/config.ts`.
- Server actions and Zod schemas return translation **keys**, never prose.
- Keys resolved at runtime go through `useMessage()` and must be
  parameter-free.
- `alternates` metadata is set per page, never in a layout — Next merges
  metadata downward and a layout canonical de-indexes every child.
- Adding a key to `messages/en-US.json` means adding it to the other two.
  `npm test` enforces parity of keys and placeholders.

## Layout
- Logical properties only: `ms-`/`me-`, `ps-`/`pe-`, `inset-inline-*`,
  `text-start`. Never `ml-`/`pr-` for layout.
- Directional icons get `.rtl-flip`. Brand marks do not.
- Email addresses and time-zone names carry `dir="ltr"` even on Arabic pages.

## React boundaries
- Icons are passed as rendered elements (`icon={<Users />}`), never component
  types — function types cannot cross the server/client boundary.
- Client components are module proxies from the server: no static properties
  hung off them (`Stagger.Item` returns `undefined`; export `StaggerItem`).
- Dates are formatted on the server with an explicit time zone. Formatting on
  the client hydrates against the browser's zone and mismatches.
- A `loading.tsx` wraps every nested route in a Suspense boundary and flushes
  the status early — scope it with a route group if a child needs to 404.

## Motion
- Every animated component reads `useReducedMotion` and degrades to no motion,
  not to faster motion.
- Animate `transform` and `opacity` only.
