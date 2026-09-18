# LingoSaaS

**One Platform. Every Market.**

A multilingual, multi-tenant SaaS starter that serves the United States, Mexico and the United Arab Emirates from a single codebase — including a genuine right-to-left layout mode for Arabic, per-market regional formatting, and translated database content.

Localization here is an architectural decision, not a translation file. Language is the easy part; currency, date order, numeral systems, writing direction, tenant isolation and role resolution are the parts that actually decide whether a product feels native in a market.

---

## Table of contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Screenshots](#screenshots)
- [Quick start (Docker)](#quick-start-docker)
- [Quick start (without Docker)](#quick-start-without-docker)
- [Environment variables](#environment-variables)
- [Database](#database)
- [Demo credentials](#demo-credentials)
- [Testing](#testing)
- [Deployment to Vercel](#deployment-to-vercel)
- [Architecture](#architecture)
  - [Project structure](#project-structure)
  - [Tenant isolation](#tenant-isolation)
  - [Permission model](#permission-model)
  - [Internationalization](#internationalization)
  - [RTL implementation](#rtl-implementation)
  - [Database translation strategy](#database-translation-strategy)
  - [Design system and motion](#design-system-and-motion)
- [Adding a new locale](#adding-a-new-locale)
- [Translation workflow](#translation-workflow)
- [Design decisions](#design-decisions)
- [Known limitations](#known-limitations)
- [Future improvements](#future-improvements)

---

## Features

**Internationalization**
- Three locales out of the box: `en-US`, `es-MX`, `ar-AE` — 305 message keys each, verified in CI to match exactly
- Locale-prefixed routes (`/en-US/projects`, `/ar-AE/projects`) that stay put when you switch language
- Full RTL layout mode for Arabic — not mirrored CSS, but logical properties throughout and deliberately handled directional icons
- Regional formatting via `Intl`: currency, decimal and thousands separators, date order, relative time
- Translated database content with a consistent fallback chain and a visible "not yet translated" notice
- Locale-aware metadata, `hreflang` alternates and a sitemap covering every market

**Multi-tenancy and access control**
- Workspaces with owner / admin / member roles
- Tenant isolation enforced in the data-access layer, never in the UI
- A single permission matrix, with rank rules that stop an admin unseating an owner

**Product**
- Dashboard with live metrics and a regional-format showcase
- Project CRUD, editing every locale's translation in one form
- Team management, invitations, role changes
- Notifications stored as message keys, so they re-localize when the reader switches language
- User preferences: language, time zone, theme, notification opt-outs
- Designed loading, empty, error, permission-denied and not-found states

---

## Technology stack

| Layer | Choice | Version |
|---|---|---|
| Framework | Next.js (App Router) | 16.3.5 |
| UI | React | 19.2.8 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS (CSS-first `@theme`) | 4.x |
| i18n | next-intl | 4.14.5 |
| Database | PostgreSQL | 17 |
| ORM | Prisma (with the `pg` driver adapter) | 7.10.0 |
| Auth | Auth.js / NextAuth (credentials, JWT sessions) | 5.0.0-beta |
| Validation | Zod | 4.x |
| Motion | Motion for React | 13.x |
| Tests | Vitest | 5.x |

---

## Screenshots

> _Add screenshots here._ Suggested set, which together demonstrate the product's thesis:
>
> | File | What it should show |
> |---|---|
> | `docs/screenshots/hero-en.png` | Landing page, English |
> | `docs/screenshots/hero-ar.png` | The same landing page in Arabic — note the mirrored layout |
> | `docs/screenshots/locale-preview.gif` | The interactive market switcher re-rendering live |
> | `docs/screenshots/dashboard-en.png` | Dashboard with metrics and the regional-format card |
> | `docs/screenshots/dashboard-ar.png` | The same dashboard, RTL, sidebar on the right |
> | `docs/screenshots/project-form.png` | The one-tab-per-locale translation editor |
> | `docs/screenshots/dark-mode.png` | Dark theme |

---

## Quick start (Docker)

Requires Docker Desktop. Nothing else — no local Node or Postgres.

```bash
cp .env.example .env          # then set AUTH_SECRET (see below)
docker compose up --build
```

The app is at <http://localhost:3000>; Postgres is exposed on `5432`.

On first run, create the schema and load the demo data:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app npx prisma db seed
```

Generate an `AUTH_SECRET` before starting:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Useful commands:

```bash
docker compose logs -f app          # follow app logs
docker compose exec app sh          # shell inside the container
docker compose down                 # stop
docker compose down -v              # stop and delete the database volume
```

Hot reload works: the project is bind-mounted, while `node_modules` and `.next`
stay in named volumes so the container's own native binaries are not shadowed by
the host's.

### Troubleshooting

**`ports are not available: ... bind: address already in use`** — something else
holds port 3000, usually a `next dev` left running outside Docker. Find and stop
it, or change the host port in `docker-compose.yml` (`"3001:3000"`).

```bash
# macOS / Linux
lsof -ti:3000 | xargs kill

# Windows (PowerShell)
Get-NetTCPConnection -LocalPort 3000 -State Listen |
  Select-Object -ExpandProperty OwningProcess -Unique |
  ForEach-Object { Stop-Process -Id $_ -Force }
```

**The build fails partway through `npm ci`** with an `rpc error` or `EOF` — that
is the Docker daemon dropping the connection, not a problem with the image. Run
`docker compose build app` again.

**`AUTH_SECRET` is empty** — the app returns 500 on any auth route with
`MissingSecret` in the logs. `.env.example` ships the key blank on purpose;
generate a value with the command above.

---

## Quick start (without Docker)

Requires Node 22+ and a PostgreSQL 17 instance. The fastest path is to run only
the database in Docker:

```bash
docker compose up -d postgres
cp .env.example .env                # set AUTH_SECRET
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

---

## Environment variables

Copy `.env.example` to `.env`. Never commit `.env`.

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | yes | `postgresql://user:pass@host:5432/db?schema=public`. Inside Compose the host is `postgres`; from your own machine it is `localhost`. |
| `AUTH_SECRET` | yes | Signs session JWTs. Generate with the command above, or `npx auth secret`. |
| `AUTH_URL` | no | Only when the deployment URL cannot be inferred. Vercel sets this for you. |
| `NEXT_PUBLIC_APP_URL` | yes in production | Absolute base URL. Used for canonical links, `hreflang` and the sitemap — a wrong value silently breaks SEO. |
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` / `POSTGRES_PORT` | no | Compose-only overrides. |

---

## Database

```bash
npm run db:migrate     # create and apply a migration (development)
npm run db:deploy      # apply existing migrations (production)
npm run db:seed        # load demo data
npm run db:studio      # browse the data
npm run db:reset       # drop, re-migrate and re-seed
```

> **Prisma 7 note.** The connection URL no longer lives in `schema.prisma`. The
> CLI reads it from `prisma.config.ts`, and the runtime client connects through
> the `@prisma/adapter-pg` driver adapter in `src/lib/db/client.ts`.
> `prisma.config.ts` loads `.env` with Node's built-in `loadEnvFile`, so there is
> no `dotenv` dependency.

The seed is idempotent — re-running it replaces the demo tenants rather than
duplicating them.

---

## Demo credentials

After seeding:

| Email | Password | Role | Preferred locale |
|---|---|---|---|
| `demo@lingosaas.dev` | `demo1234` | Owner | English |
| `diego@lingosaas.dev` | `demo1234` | Admin | Spanish |
| `layla@lingosaas.dev` | `demo1234` | Member | Arabic |
| `sarah@lingosaas.dev` | `demo1234` | Member | English |

The demo owner belongs to **two** workspaces — *Northwind Global* and
*Atlas Labs* — so workspace switching and tenant isolation are visible, not just
claimed. Sign in as `layla@` to see the member role's reduced permissions.

One seeded project (*Support Handbook*) is deliberately **English-only**, so the
translation fallback and its "not yet translated" notice are visible without
having to create one.

---

## Testing

```bash
npm test           # all suites
npm run test:watch
npm run typecheck
npm run lint
```

60 tests across four suites:

| Suite | Covers |
|---|---|
| `src/lib/i18n/i18n.test.ts` | Locale config, direction, `Intl` formatting per market, the fallback chain, and key/placeholder parity across all three catalogues |
| `src/lib/permissions/permissions.test.ts` | Every cell of the PRD permission matrix, plus the rank rules that prevent privilege escalation |
| `src/lib/validations/validations.test.ts` | Auth and project schemas, FormData parsing, slug generation including non-Latin input |
| `tests/tenancy.test.ts` | **Integration.** Runs against real Postgres: cross-tenant reads return nothing, unique constraints hold, cascades delete, and a deleted user does not take the workspace's projects with them |

The integration suite needs the database running (`docker compose up -d postgres`).

---

## Deployment to Vercel

The application deploys without architectural changes. Docker is for local
development only — nothing in production depends on it.

1. **Provision Postgres** with Neon, Supabase, or any Vercel-compatible
   provider. Use their pooled connection string.
2. **Import the repository** into Vercel. The framework preset is detected
   automatically.
3. **Set environment variables** in the Vercel project: `DATABASE_URL`,
   `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL` (your production URL).
4. **Build command** — the default `npm run build` already runs
   `prisma generate && next build`, so the client is generated against the
   deployment's schema.
5. **Run migrations** against the production database before or during the first
   deploy:

   ```bash
   DATABASE_URL="<production url>" npx prisma migrate deploy
   ```

   Do not run `prisma migrate dev` against production — it can reset data.

Deployment-safety properties already in place: no local filesystem writes, no
long-running process assumptions, no hardcoded `localhost`, and every absolute
URL derived from `NEXT_PUBLIC_APP_URL`.

---

## Architecture

### Project structure

```text
src/
├── actions/              Server actions — every mutation, each starting with an authorization call
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/  Public, statically prerendered
│   │   ├── (auth)/       Login, register
│   │   ├── (app)/        Authenticated product surface
│   │   ├── error.tsx     Designed 500
│   │   ├── forbidden.tsx Designed 403
│   │   ├── not-found.tsx Designed 404
│   │   └── unauthorized.tsx
│   ├── api/auth/         Auth.js route handlers
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── ui/               Primitives: button, card, field, badge, dialog, states
│   ├── layout/           Sidebar, switchers, menus, status page
│   ├── marketing/        Hero, sections, the interactive locale preview
│   ├── localization/     Language switcher, locale-aware date/currency
│   ├── motion/           The entire motion vocabulary — four primitives
│   ├── dashboard/  projects/  team/  settings/
├── i18n/                 next-intl routing, request config, navigation
├── lib/
│   ├── auth/             Auth.js configuration
│   ├── db/               Prisma client, the tenant boundary, query functions
│   ├── i18n/             Locale config, fallback chain, metadata helpers
│   ├── permissions/      The permission matrix and rank rules
│   ├── validations/      Zod schemas
│   ├── formatters/       Intl wrappers
│   └── utils/            cn, slug, logger
├── messages/             en-US.json, es-MX.json, ar-AE.json
└── prisma/               schema.prisma, migrations, seed.ts
```

### Tenant isolation

Two functions form the entire boundary, in `src/lib/db/context.ts`:

```ts
requireSession()                    // → the user, or the 401 state
requireWorkspace()                  // → { user, workspace, role }, membership-verified
requirePermission('project:delete') // → the above, plus a capability assertion
```

Every query function and every server action begins with one of these. **None of
them accepts a `workspaceId` argument.** That is what makes cross-tenant access
impossible rather than merely unlikely — there is no parameter to forge.

The active workspace arrives as a cookie, which is client-controlled and
therefore treated as a *hint* only. The membership lookup is what authorizes
access; a forged cookie naming someone else's workspace matches no membership
row and falls back to the user's own.

Reads for a resource that exists in another tenant return **404, not 403** — a
403 would confirm the resource exists. This is verified end to end, and by the
integration suite.

**Role is never stored in the JWT.** The token carries only the user id; the role
is re-read on every request. A role baked into a token goes stale the moment an
admin demotes someone, which is a privilege-escalation bug, not a caching
trade-off.

### Permission model

One matrix in `src/lib/permissions/index.ts`, mirroring the PRD table, plus rank
rules a flat matrix cannot express:

- `can(role, permission)` — the matrix lookup
- `canManageMember(actor, target)` — an admin may manage members, never an owner or a peer admin
- `canAssignRole(actor, from, to)` — nobody may grant a role at or above their own

Because no one outranks themselves, **an owner can never be removed**, which
guarantees a workspace always retains one. The UI hides what the server would
reject — but the server is the authority, and both read the same functions.

### Internationalization

- `src/lib/i18n/config.ts` is the single source of truth: code, language, native
  name, region, direction, currency, timezone, flag. Nothing else in the codebase
  hardcodes any of these.
- Static UI strings live in `messages/<locale>.json`, resolved by next-intl.
- Server actions return **translation keys**, never English prose, so an error
  message is localized like the rest of the page.
- Dates are formatted on the server with an explicit time zone. Formatting them
  on the client would hydrate against the browser's zone and mismatch.
- `src/lib/i18n/use-message.ts` holds the one sanctioned cast for keys that are
  only known at runtime.

Metadata deserves a note: `alternates` is set **per page**, never in a layout.
Next merges metadata down the tree, so a layout-level canonical silently makes
every child page canonicalize to the locale root — which de-indexes the site.

### RTL implementation

Arabic is a complete layout mode, not a translation file.

- `dir` is set on `<html>` from the locale config, so every descendant inherits it.
- Spacing uses **logical properties** throughout: `ms-`/`me-`, `ps-`/`pe-`,
  `inset-inline-start`, `border-inline`, `text-align: start`. Physical `ml-`/`pr-`
  do not appear in layout code.
- Directional icons — arrows, chevrons, the sign-out glyph — carry `.rtl-flip`
  and mirror. The logo and other marks deliberately do not.
- Dropdowns open toward the reading edge, so they never leave the viewport.
- The sidebar slides in from the reading edge.
- Email addresses and time-zone names render `dir="ltr"` even on Arabic pages; an
  RTL-rendered address reads wrong.
- Arabic gets its own typeface (IBM Plex Sans Arabic) because Inter has no Arabic
  coverage.
- In the project editor, each locale's input renders in *its own* direction — so
  an Arabic name reads correctly while you edit from the English UI.

### Database translation strategy

Static UI text and user-generated content are handled differently.

```text
Project              ProjectTranslation
- id                 - projectId
- workspaceId        - locale
- status             - name
- createdAt          - description
                     @@unique([projectId, locale])
```

The fallback chain lives in exactly one function, `pickTranslation`:

1. the requested locale
2. `en-US`
3. whatever exists
4. `null` — and callers render a designed "translation unavailable" state

When a fallback is used, the UI says so rather than pretending the content is
translated. `en-US` is required when creating a project precisely because it
anchors this chain.

Notifications follow the same principle from the other direction: they store a
message **key** plus parameters, not rendered prose, so a notification written
while the reader was on English reads correctly in Arabic after they switch.

### Design system and motion

All design tokens live in `src/app/globals.css` under Tailwind v4's `@theme` —
colors (in OKLCH), radii, shadows, motion durations and easings, breakpoints and
a z-index ladder. Dark mode redefines the same semantic tokens, so no component
knows which theme is active. Theme is applied before first paint by a small
inline script, avoiding the light-then-dark flash.

The motion vocabulary is four primitives — `FadeIn`, `ScrollReveal`, `Stagger` /
`StaggerItem`, `SectionHeading`. Every one reads `useReducedMotion` and degrades
to an instant, non-moving render rather than a faster animation, because a 50ms
slide is still motion. `prefers-reduced-motion` is also honoured globally in CSS
as a floor.

Animation is limited to `transform` and `opacity`. Shared-element transitions
(the settings tab indicator, the market-switcher pill) use Motion's `layoutId`,
which mirrors correctly under RTL automatically because it animates the real box
rather than a hardcoded offset.

---

## Adding a new locale

Four steps, in order:

1. **Add it to the config.** Append the code to `locales` in
   `src/lib/i18n/config.ts` and add its entry to `localeConfigs` — language,
   native name, region, direction, currency, timezone, flag.
2. **Add the message file.** Copy `messages/en-US.json` to
   `messages/<code>.json` and translate the values. Keep the key structure
   identical and preserve every `{placeholder}`; use the correct CLDR plural
   categories for the language.
3. **Translate existing content.** Add `ProjectTranslation` rows for the new
   locale, or let the fallback chain serve `en-US` until someone does.
4. **Run the tests.** `npm test` fails if the new catalogue's keys or
   placeholders diverge from `en-US`.

Routing, direction, formatting, metadata, the language switcher, the sitemap and
the footer's market links all derive from the config and need no changes.

If the new locale is RTL, no layout work is required — that is the point of the
logical properties. If it needs a different script, add a font in
`src/app/[locale]/layout.tsx` and a `:lang()` rule in `globals.css`.

## Translation workflow

- **UI strings** → `messages/*.json`. Never concatenate translated fragments;
  write one complete message with ICU interpolation.
- **User content** → `ProjectTranslation` rows, edited through the project form's
  per-locale tabs. All locales submit in one request, so switching tabs never
  drops what you typed.
- **Validation and action errors** → return a translation key from the server;
  the client resolves it. Keys that reach the runtime resolver must be
  parameter-free, since there is nothing to interpolate with.
- **Parity is enforced by tests**, not by discipline: a missing key is a runtime
  crash in next-intl, so `npm test` checks all three catalogues against `en-US`.

---

## Design decisions

**JWT sessions, with the role excluded.** Avoids a database round-trip per
request and suits serverless. The role is deliberately not a claim — see
[Tenant isolation](#tenant-isolation).

**Auth is not enforced in middleware.** Route protection lives in the
data-access layer, so a missed matcher entry cannot expose data; the worst case
is an unstyled redirect. Middleware does locale negotiation only.

**No Three.js, no Lenis.** The PRD marks both optional and then lists the reasons
to avoid them — GPU cost, scroll-jacking, accessibility. The signature visual is
the locale preview, which demonstrates the actual product thesis and costs
almost nothing. Both remain easy to add.

**No production Dockerfile.** Vercel builds from source and the PRD requires no
Docker in production. Shipping an unused Dockerfile is dead weight that rots.

**Native platform features over libraries.** `<dialog>` for modals (focus
trapping, Escape, top-layer stacking, all correct for free), `<details>` for the
FAQ (keyboard accessible, findable by in-page search, works without JS), the
`form` attribute to place a submit button outside its form, and Node's
`loadEnvFile` instead of `dotenv`.

**One rule for icon props.** Icons are passed as rendered elements, never as
component types. Function types cannot cross the server/client boundary; keeping
a single rule removes the whole class of error rather than fixing it per site.

**Marketing pages do not read the session.** Reading cookies there would opt all
12 marketing pages out of static rendering, trading crawlability and TTFB for a
header that says "Dashboard" instead of "Sign in". Signed-in visitors are
redirected away from `/login` and `/register` instead.

---

## Known limitations

- **No password reset.** It needs an email provider the MVP does not have. The
  message keys already exist in all three catalogues; the page and a
  `PasswordResetToken` model are what remain. A dead "forgot password" link is
  worse than none, so the link is not shown.
- **Invitations are not emailed.** An invitation row with a token is created, but
  nothing delivers it and there is no accept-invite route yet. Pending invitations
  are listed and revocable in the team page.
- **Email addresses cannot be changed** in profile settings, because changing an
  identity requires verification.
- **The time-zone picker is a curated list**, not the full IANA database — 400+
  options in a `<select>` is unusable. The server validates against the real zone
  database, so any valid zone works if set another way.
- **Notification fan-out is a single `createMany`.** Fine for workspaces of this
  size; a large tenant would want a queue.
- **No rate limiting** on the credentials endpoint. Login does run a constant-time
  bcrypt comparison even for unknown emails, so response time does not reveal
  which addresses are registered — but a proper limiter belongs in front of it.
- **Auth.js v5 is still a beta.** It is the only line compatible with the App
  Router, and it is contained behind `src/lib/auth/`.

## Future improvements

- Password reset and invitation acceptance once a mail provider is wired in
- Rate limiting on authentication endpoints
- Project-level assignment, so `project:update` can be scoped per member rather
  than per workspace
- Audit log for role and workspace changes
- End-to-end tests with Playwright covering the RTL layout visually
- Sentry and PostHog — the logging boundary in `src/lib/utils/logger.ts` exists
  so that is a one-file change
- Machine-translation assist in the project editor to pre-fill untranslated locales

---

## License

Not currently licensed for redistribution. Add a `LICENSE` file before publishing.
