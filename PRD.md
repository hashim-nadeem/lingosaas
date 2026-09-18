# LingoSaaS
## Multilingual Multi-Tenant SaaS Starter Platform

**Document Type:** Product Requirements Document  
**Document Status:** Implementation Blueprint  
**Primary Audience:** Implementing engineers, technical reviewers, portfolio reviewers  
**Application Type:** Full-Stack SaaS Web Application  
**Deployment Target:** Vercel  
**Local Development:** Docker Compose  
**Database:** PostgreSQL  
**Primary Framework:** Next.js with App Router  

---

# 1. Executive Summary

LingoSaaS is a modern, production-oriented, multilingual, multi-tenant SaaS starter platform designed to demonstrate how a SaaS product can serve international markets from a single codebase.

The platform must support:

- English for the United States
- Spanish for Mexico
- Arabic for the United Arab Emirates
- Right-to-left Arabic layouts
- Localized currency, dates, numbers, and time zones
- Multi-tenant workspaces
- Authentication and authorization
- Project management
- Team collaboration
- Dynamic database content translations
- Premium modern UI
- Smooth scrolling and meaningful animations
- Docker-based local development
- Vercel production deployment

This project should not feel like a basic tutorial dashboard. It must look and behave like a polished commercial SaaS product suitable for:

- Portfolio presentation
- Technical interviews
- Client demonstrations
- Architecture discussions
- SaaS starter-template positioning
- Demonstrating internationalization expertise
- Demonstrating full-stack and product engineering skills

---

# 2. Product Vision

## Vision Statement

> Build one SaaS platform that feels native to every market, language, and writing direction without duplicating the application codebase.

The application should demonstrate that localization is not simply translating text. It must include:

- Language
- Regional formatting
- Currency
- Time zone
- Date and number formats
- Writing direction
- Layout adaptation
- Localized dynamic content
- Localized validation and notifications
- Locale-aware user preferences
- SEO-ready localized routes

---

# 3. Product Name

Working product name:

```text
LingoSaaS
```

Possible tagline:

```text
One Platform. Every Market.
```

Alternative positioning:

```text
Build globally. Experience locally.
```

The final visual identity should feel modern, premium, technical, and internationally focused.

---

# 4. Objectives

## Primary Objectives

1. Demonstrate production-quality Next.js full-stack architecture.
2. Demonstrate multilingual SaaS implementation.
3. Demonstrate proper Arabic RTL support.
4. Demonstrate multi-tenant data isolation.
5. Demonstrate authentication and role-based permissions.
6. Demonstrate dynamic database translations.
7. Demonstrate localized regional formatting.
8. Demonstrate Docker-based development.
9. Demonstrate Vercel-ready deployment.
10. Create a visually impressive portfolio-quality product.
11. Demonstrate clean architecture and maintainable code.
12. Demonstrate thoughtful animation and interaction design.

## Secondary Objectives

- Make the project easy to extend.
- Keep the architecture suitable for real SaaS products.
- Avoid unnecessary complexity.
- Maintain strong performance.
- Make the codebase understandable to another developer.
- Provide clear documentation for local setup and deployment.

---

# 5. Non-Goals

The initial version should not attempt to implement:

- Billing subscriptions
- Stripe payments
- Complex accounting
- Enterprise SSO
- Advanced analytics
- Real-time chat
- Full project-management software comparable to Jira
- Complex workflow automation
- Native mobile applications
- Microservices
- Kubernetes
- Event-driven distributed architecture
- Excessive AI features unrelated to the product purpose

The architecture should remain extensible, but the MVP must remain focused.

---

# 6. Target Users

## 6.1 SaaS Owner

A business owner managing a workspace and its projects.

## 6.2 Workspace Administrator

A user managing members, workspace settings, and projects.

## 6.3 Workspace Member

A user participating in projects and viewing workspace information.

## 6.4 International Customer

A customer who expects the platform to work naturally in their preferred language and regional format.

Example markets:

- United States
- Mexico
- United Arab Emirates

---

# 7. Supported Locales

The initial application must support the following locales:

```text
en-US
es-MX
ar-AE
```

## Locale Details

| Locale | Language | Region | Direction | Currency |
|---|---|---|---|---|
| en-US | English | United States | LTR | USD |
| es-MX | Spanish | Mexico | LTR | MXN |
| ar-AE | Arabic | UAE | RTL | AED |

## Locale Configuration

Create a centralized locale configuration file containing:

- Locale code
- Language name
- Native language name
- Region name
- Text direction
- Currency
- Currency symbol
- Date format behavior
- Number format behavior
- Time zone
- Flag or visual identifier if required

Example conceptual structure:

```ts
type LocaleConfig = {
  code: string;
  language: string;
  nativeName: string;
  direction: "ltr" | "rtl";
  currency: string;
  timezone: string;
};
```

Do not scatter locale-specific values throughout the codebase.

---

# 8. Recommended Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- App Router
- Tailwind CSS
- shadcn/ui where appropriate
- CSS logical properties
- Responsive design system

## Internationalization

- `next-intl` or an equally mature Next.js internationalization solution

## Backend

- Next.js Server Components
- Server Actions where appropriate
- Route Handlers where appropriate
- Secure server-side data access layer

## Database

- PostgreSQL

## ORM

- Prisma

## Authentication

- Auth.js / NextAuth-compatible architecture

Use a modern, maintainable authentication implementation compatible with the selected Next.js version.

## Validation

- Zod

## Forms

- React Hook Form where useful

## Animation

Preferred approach:

- Motion for React
- CSS transitions and keyframes
- Intersection Observer-based reveal behavior
- Optional Lenis for marketing-page smooth scrolling
- Optional Three.js only for meaningful visual enhancement

## Development Environment

- Docker
- Docker Compose
- PostgreSQL container
- Application container

## Production

- Vercel for Next.js application
- Managed PostgreSQL provider such as Neon, Supabase, or another Vercel-compatible PostgreSQL provider

---

# 9. Architecture Principles

The implementation must follow these principles:

1. Server-first architecture.
2. Keep client components limited to interactive areas.
3. Do not make entire pages client components unnecessarily.
4. Separate UI, business logic, validation, and database access.
5. Avoid direct Prisma calls scattered across UI components.
6. Enforce tenant isolation at the data-access layer.
7. Centralize localization configuration.
8. Centralize permission checks.
9. Use reusable components instead of duplicated markup.
10. Avoid premature abstractions.
11. Prefer simple, readable, production-quality code.
12. Keep the application deployable to Vercel.
13. Avoid introducing unnecessary infrastructure.
14. Ensure all important states are designed and implemented.

---

# 10. Application Structure

Recommended high-level structure:

```text
src/
├── app/
│   ├── [locale]/
│   │   ├── (marketing)/
│   │   │   ├── page.tsx
│   │   │   ├── pricing/
│   │   │   ├── about/
│   │   │   └── contact/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   ├── forgot-password/
│   │   │   └── reset-password/
│   │   └── (app)/
│   │       ├── dashboard/
│   │       ├── projects/
│   │       ├── team/
│   │       ├── notifications/
│   │       └── settings/
│   ├── api/
│   └── globals.css
├── components/
│   ├── ui/
│   ├── layout/
│   ├── marketing/
│   ├── dashboard/
│   ├── projects/
│   ├── team/
│   ├── localization/
│   └── motion/
├── lib/
│   ├── auth/
│   ├── db/
│   ├── i18n/
│   ├── permissions/
│   ├── validations/
│   ├── formatters/
│   ├── analytics/
│   └── utils/
├── actions/
├── hooks/
├── types/
├── messages/
│   ├── en-US/
│   ├── es-MX/
│   └── ar-AE/
└── prisma/
    ├── schema.prisma
    └── seed.ts
```

The exact structure may be adjusted after architectural review, but separation of responsibilities must be preserved.

---

# 11. Route Architecture

All user-facing routes must be locale-aware.

Examples:

```text
/en-US
/es-MX
/ar-AE
```

## Marketing Routes

```text
/[locale]
/[locale]/pricing
/[locale]/about
/[locale]/contact
```

## Authentication Routes

```text
/[locale]/login
/[locale]/register
/[locale]/forgot-password
/[locale]/reset-password
```

## Application Routes

```text
/[locale]/dashboard
/[locale]/projects
/[locale]/projects/[projectId]
/[locale]/team
/[locale]/notifications
/[locale]/settings
/[locale]/settings/profile
/[locale]/settings/preferences
/[locale]/settings/workspace
```

The routing strategy must prevent duplicated application implementations for each language.

---

# 12. Authentication Requirements

Implement:

- User registration
- Login
- Logout
- Session persistence
- Protected routes
- Password hashing
- Authentication error handling
- User profile
- Session-aware navigation

Optional if practical:

- Email verification
- Password reset flow
- Social login placeholders

Authentication must be implemented securely and should not rely only on client-side route protection.

---

# 13. Multi-Tenant Workspace System

The application must support multiple workspaces.

A user may:

- Own multiple workspaces
- Belong to multiple workspaces
- Switch between workspaces
- View only data belonging to the active workspace

Every workspace-owned resource must be associated with a workspace ID.

## Tenant Isolation

Tenant isolation is mandatory.

A user from Workspace A must never be able to access:

- Workspace B projects
- Workspace B members
- Workspace B notifications
- Workspace B settings
- Workspace B private data

Tenant filtering must be enforced server-side.

Do not rely only on hidden UI elements or client-side filtering.

---

# 14. Workspace Roles

Initial roles:

```text
OWNER
ADMIN
MEMBER
```

## Permission Matrix

| Capability | Owner | Admin | Member |
|---|---:|---:|---:|
| View workspace | Yes | Yes | Yes |
| View projects | Yes | Yes | Yes |
| Create projects | Yes | Yes | Yes |
| Edit projects | Yes | Yes | Based on access |
| Delete projects | Yes | Yes | No |
| Invite members | Yes | Yes | No |
| Remove members | Yes | Yes | No |
| Change member roles | Yes | Limited | No |
| Update workspace settings | Yes | Limited | No |
| Delete workspace | Yes | No | No |

The permission system must be centralized and reusable.

---

# 15. Core Product Features

## 15.1 Dashboard

The dashboard should include:

- Welcome message
- Active workspace
- Summary metrics
- Recent projects
- Team overview
- Recent notifications
- Locale-aware date and number examples
- Quick actions

Example metrics:

- Total projects
- Active projects
- Completed projects
- Team members

Metrics may initially be calculated from real database data.

Avoid fake hardcoded dashboard data unless clearly used as a visual placeholder.

---

## 15.2 Project Management

Users should be able to:

- View projects
- Create projects
- Edit projects
- Delete projects according to permissions
- View project details
- Assign project status
- View project creation date
- View localized project title and description

Project statuses:

```text
PLANNING
IN_PROGRESS
COMPLETED
ARCHIVED
```

---

# 16. Dynamic Database Translations

Static interface translations and dynamic database translations must be handled differently.

## Static Translations

Examples:

- Navigation labels
- Buttons
- Form labels
- Validation messages
- Page headings
- Empty states
- Notifications
- System messages

These should live in translation files.

## Dynamic Translations

Examples:

- Project name
- Project description
- Workspace description
- User-generated content

These must be stored in the database using a translation model.

Recommended structure:

```text
Project
ProjectTranslation
```

Conceptual example:

```text
Project
- id
- workspaceId
- status
- createdAt
- updatedAt

ProjectTranslation
- id
- projectId
- locale
- name
- description
```

A project may contain:

```text
en-US → Website Redesign
es-MX → Rediseño del sitio web
ar-AE → إعادة تصميم الموقع
```

## Fallback Behavior

If a translation is unavailable:

1. Use the requested locale if available.
2. Fall back to `en-US`.
3. If no translation exists, show a safe placeholder or original source value.

The fallback strategy must be consistent throughout the application.

---

# 17. Internationalization Requirements

The application must support:

- Static translations
- Dynamic translations
- Locale-aware routing
- Language switching
- Locale persistence
- Locale-aware validation
- Locale-aware notifications
- Locale-aware metadata
- Locale-aware formatting
- Locale-aware direction
- Locale-aware empty states
- Locale-aware loading states

Do not concatenate translated strings incorrectly.

Avoid patterns such as:

```ts
t("hello") + userName + t("welcome")
```

Prefer complete translation messages with interpolation support.

---

# 18. Language Switching

The language switcher must:

- Display available languages
- Show native language names
- Preserve the current route when switching
- Preserve relevant route parameters
- Update layout direction
- Update formatting immediately
- Persist the user preference when authenticated
- Use a cookie or equivalent mechanism for anonymous users

Example:

```text
English
Español
العربية
```

When switching from:

```text
/en-US/projects
```

to Spanish, navigate to:

```text
/es-MX/projects
```

When switching to Arabic:

```text
/ar-AE/projects
```

---

# 19. Arabic RTL Requirements

Arabic support must be treated as a complete layout mode, not just translated text.

The application must dynamically set:

```html
dir="rtl"
```

for Arabic and:

```html
dir="ltr"
```

for English and Spanish.

## RTL Requirements

- Navigation must mirror correctly.
- Sidebar placement must adapt.
- Icons must not be incorrectly mirrored.
- Directional icons should be intentionally handled.
- Text alignment must be correct.
- Dropdowns must open naturally.
- Forms must work correctly.
- Tables must remain usable.
- Modals must remain aligned.
- Toast notifications must appear correctly.
- Spacing must use logical CSS properties.
- Avoid excessive use of `margin-left` and `padding-right`.
- Prefer logical properties such as:
  - `margin-inline`
  - `padding-inline`
  - `inset-inline-start`
  - `border-inline`
  - `text-align: start`

Do not treat RTL as an afterthought.

---

# 20. Regional Formatting

Use the JavaScript internationalization APIs where appropriate.

Examples:

```ts
Intl.NumberFormat
Intl.DateTimeFormat
Intl.RelativeTimeFormat
```

Formatting must consider:

- Currency
- Decimal separators
- Thousands separators
- Date order
- Time format
- Time zone
- Relative dates
- Number formatting

Examples:

```text
en-US → $1,250.00
es-MX → $1,250.00 MXN
ar-AE → AED 1,250.00
```

The exact rendered output should be delegated to locale-aware APIs rather than manually hardcoded.

---

# 21. User Preferences

Users should be able to configure:

- Preferred language
- Preferred time zone
- Preferred currency display where applicable
- Theme preference
- Notification preferences

User preferences must be stored in the database for authenticated users.

Anonymous users may use cookies or local storage where appropriate.

---

# 22. Notification System

Implement a basic notification system.

Notification examples:

- Project created
- Project updated
- Member invited
- Workspace settings changed
- Welcome notification

Notifications should support:

- Read/unread state
- Timestamp
- Localized title
- Localized message
- Notification list
- Empty state

Notification text must be localized using translation keys or localized database content.

---

# 23. Database Schema

Recommended entities:

## User

- id
- name
- email
- password hash or authentication provider data
- createdAt
- updatedAt

## Workspace

- id
- name
- slug
- description
- ownerId
- createdAt
- updatedAt

## WorkspaceMember

- id
- workspaceId
- userId
- role
- createdAt

## UserPreference

- id
- userId
- locale
- timezone
- theme
- notification preferences

## Project

- id
- workspaceId
- status
- createdById
- createdAt
- updatedAt

## ProjectTranslation

- id
- projectId
- locale
- name
- description

## Invitation

- id
- workspaceId
- email
- role
- token
- expiresAt
- acceptedAt
- createdAt

## Notification

- id
- userId
- workspaceId
- type
- title or translation key
- message or translation key
- readAt
- createdAt

Add proper:

- Foreign keys
- Unique constraints
- Indexes
- Cascade behavior
- Tenant-related indexes
- Locale uniqueness constraints

For example, a project should not have duplicate translations for the same locale.

---

# 24. Data Access Layer

Create a dedicated data-access layer.

Examples:

```text
lib/db/
lib/data/
lib/repositories/
```

Database access should:

- Validate the authenticated user
- Resolve the active workspace
- Enforce tenant isolation
- Validate permissions
- Return typed data
- Avoid exposing sensitive fields
- Avoid direct database access from arbitrary client components

---

# 25. UI/UX Design Direction

The product must have a premium, modern, polished visual identity.

It must not look like:

- A generic admin dashboard
- A default shadcn demo
- A basic Tailwind starter
- A tutorial project
- A collection of unrelated components
- An over-animated landing page

The visual quality should be inspired by the design discipline of products such as:

- Linear
- Vercel
- Stripe
- Raycast
- Modern AI SaaS platforms

Do not copy their branding or layouts directly. Use them only as quality references.

---

# 26. Premium Marketing Website

The marketing website must feel like a real SaaS landing page.

Required sections:

1. Navigation
2. Hero section
3. Product value proposition
4. Locale demonstration
5. Feature showcase
6. Multi-language preview
7. Dashboard preview
8. Regional formatting showcase
9. Testimonials or trust section
10. Pricing placeholder or plans section
11. FAQ
12. Final CTA
13. Footer

The page should communicate:

```text
One Platform. Every Market.
```

The hero should visually demonstrate that the same platform adapts to different languages, currencies, dates, and writing directions.

---

# 27. Signature Interactive Experience

Create a signature section demonstrating localization visually.

For example:

## Global Experience Preview

A user can switch between:

```text
United States
Mexico
United Arab Emirates
```

The preview should dynamically update:

- Language
- Currency
- Date format
- Number format
- Text direction
- Sample dashboard content
- Regional labels
- UI alignment where appropriate

This section should become one of the strongest portfolio differentiators.

---

# 28. Dashboard Design Direction

The dashboard should be premium but restrained.

Use:

- Clear hierarchy
- Strong typography
- Elegant cards
- Subtle borders
- Soft shadows
- Meaningful whitespace
- Excellent empty states
- Consistent spacing
- Responsive tables
- Polished loading states
- Subtle micro-interactions

Avoid:

- Excessive gradients
- Overly bright colors
- Too many floating cards
- Unnecessary glassmorphism
- Excessive shadows
- Random animations
- Dense layouts
- Poor mobile behavior

---

# 29. Design System

Create centralized design tokens for:

- Colors
- Typography
- Spacing
- Radius
- Shadows
- Border colors
- Motion durations
- Motion easing
- Breakpoints
- Z-index layers

The application must feel visually consistent across:

- Marketing pages
- Authentication pages
- Dashboard
- Settings
- Modals
- Toasts
- Forms
- Tables
- Empty states

---

# 30. Motion and Animation Requirements

Animation is an important part of the product quality, but it must be intentional.

The objective is:

> Maximize perceived quality, not the number of animations.

Use animation to communicate:

- Hierarchy
- State changes
- Navigation
- Progress
- Focus
- Feedback
- Content discovery
- Product personality

---

# 31. Recommended Animation Approach

Preferred tools:

## Motion for React

Use for:

- Component entrance animations
- Shared layout transitions
- Modal animations
- Tabs
- Dropdowns
- Staggered lists
- Page transitions
- Micro-interactions

## CSS Animations

Use for:

- Background effects
- Gradients
- Decorative motion
- Hover effects
- Simple keyframes
- Performance-sensitive effects

## Intersection Observer

Use for:

- Scroll reveal
- Section entrance
- Viewport-triggered animation

## Lenis

Lenis may be evaluated for smooth scrolling, primarily on marketing pages.

Use it carefully:

- Do not break native scrolling.
- Do not interfere with accessibility.
- Do not create scroll-jacking.
- Do not force it on every dashboard page.
- Ensure mobile behavior remains reliable.
- Respect reduced-motion preferences.

## Three.js

Three.js is optional.

Use it only if it creates a meaningful visual experience, such as:

- Abstract global network
- Interactive globe
- Subtle 3D geometry
- Lightweight international data visualization
- Abstract floating particles related to global connectivity

Do not use Three.js simply because it is technically impressive.

Avoid:

- Heavy WebGL scenes
- Large 3D assets
- High GPU usage
- Poor mobile performance
- Distracting backgrounds
- Complex scenes that provide no product value

---

# 32. Referenced UI Libraries

The following resources may be used as inspiration or selectively evaluated:

## Inspira UI

Use only as visual inspiration if it is primarily Vue/Nuxt-oriented.

Do not introduce Vue or Nuxt into this project.

## Animate UI

Use as a reference for React, TypeScript, Tailwind, Motion, and shadcn-compatible animated components.

Do not blindly install every component.

Evaluate each component for:

- Accessibility
- Bundle size
- Maintainability
- Responsiveness
- Design consistency
- Actual product value

## Lenis

Evaluate for smooth scrolling on marketing pages only.

## Three.js

Evaluate only for a lightweight, meaningful signature visual.

The final stack must remain coherent and should not become a collection of unrelated libraries.

---

# 33. Required Reusable UI Components

Create reusable components where appropriate:

```text
AnimatedHero
ScrollReveal
AnimatedSection
PageTransition
PremiumCard
GradientBackground
GridBackground
AnimatedCounter
AnimatedMetricCard
LocalePreview
LanguageSwitcher
RegionalFormatPreview
AnimatedTabs
CommandMenu
LoadingSkeleton
EmptyState
AnimatedToast
ResponsiveSidebar
WorkspaceSwitcher
LocaleAwareDate
LocaleAwareCurrency
```

Component names may be adjusted, but the architecture should encourage reuse.

---

# 34. Suggested Motion Patterns

Implement subtle examples such as:

- Hero text fade and slide-up
- Staggered feature cards
- Scroll-based section reveal
- Animated counters
- Button hover transitions
- Card hover elevation
- Smooth modal entrance
- Tab indicator movement
- Sidebar transitions
- Toast entrance and exit
- Project list item appearance
- Language preview transitions
- Locale switch transition
- Dashboard metric number animation

Avoid:

- Constant bouncing
- Excessive spring effects
- Long transitions
- Distracting parallax
- Animation on every element
- Delayed interaction feedback
- Scroll-jacking
- Repetitive looping animations

---

# 35. Accessibility and Reduced Motion

The application must support:

```css
prefers-reduced-motion
```

When reduced motion is enabled:

- Disable nonessential animations.
- Reduce transition durations.
- Avoid parallax.
- Avoid continuous decorative motion.
- Preserve usability.
- Keep state changes understandable without animation.

All interactive elements must remain accessible with:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Appropriate labels
- Sufficient contrast
- Screen-reader-friendly behavior

---

# 36. Responsive Design

The application must be mobile-first.

Required breakpoints:

- Mobile
- Tablet
- Desktop
- Large desktop

Test at minimum:

- 320px
- 375px
- 390px
- 768px
- 1024px
- 1280px
- 1440px

The following must work on mobile:

- Navigation
- Sidebar
- Language switcher
- Forms
- Tables
- Cards
- Modals
- Dashboard
- Project details
- RTL layout
- Marketing animations

Do not simply shrink desktop layouts.

---

# 37. SEO Requirements

Marketing pages must include:

- Dynamic localized metadata
- Localized page titles
- Localized descriptions
- Open Graph metadata
- Twitter card metadata
- Canonical URLs where appropriate
- Sitemap strategy
- Robots configuration
- Semantic HTML
- Proper heading hierarchy

Localized routes should be indexable where appropriate.

Application dashboard pages should generally not be indexed.

---

# 38. Performance Requirements

Prioritize:

- Server Components
- Minimal client-side JavaScript
- Optimized images
- Lazy loading
- Code splitting
- Avoiding unnecessary dependencies
- Avoiding large animation libraries when CSS is sufficient
- Lightweight Three.js usage if included
- Efficient database queries
- Proper indexes
- Avoiding layout shifts
- Responsive image sizing

Animations must use performant properties where possible:

```text
transform
opacity
```

Avoid animating expensive layout properties unnecessarily.

---

# 39. Security Requirements

Implement:

- Secure authentication
- Password hashing
- Server-side authorization
- Tenant isolation
- Input validation
- Zod schemas
- CSRF-safe patterns where relevant
- Secure cookies
- Environment variable protection
- No secrets committed to Git
- Safe error messages
- Rate limiting considerations
- Secure database access
- Protection against unauthorized resource IDs

Never trust:

- Client-provided workspace IDs
- Client-provided user IDs
- Client-provided roles
- Client-provided permissions
- Client-provided ownership claims

---

# 40. Error and State Handling

Every major feature must support:

- Loading state
- Empty state
- Error state
- Success state
- Disabled state
- Validation state
- Permission-denied state
- Not-found state

Examples:

- No projects available
- Workspace has no members
- Translation unavailable
- Unauthorized project access
- Invalid locale
- Database error
- Failed form submission
- Expired invitation

These states must be designed, not left to browser defaults.

---

# 41. Docker Requirements

Docker is mandatory for local development.

## Required Files

```text
Dockerfile
Dockerfile.dev
docker-compose.yml
.dockerignore
.env.example
```

## Docker Compose Services

At minimum:

```text
app
postgres
```

Optional services may be added only if genuinely necessary.

## Requirements

- Application runs inside Docker.
- PostgreSQL runs inside Docker.
- Database data persists through a named volume.
- Environment variables are configurable.
- Hot reload works during development.
- Prisma commands can run inside the container.
- New developers can start the project with a small number of commands.

Expected workflow:

```bash
docker compose up --build
```

Database migration example:

```bash
docker compose exec app npx prisma migrate dev
```

Seed example:

```bash
docker compose exec app npx prisma db seed
```

The Docker setup must be documented clearly.

---

# 42. Vercel Deployment Requirements

The application must be deployable to Vercel without major architectural changes.

Production database should use a managed PostgreSQL provider such as:

- Neon
- Supabase
- Another compatible PostgreSQL provider

Requirements:

- Production environment variables documented.
- Prisma generation handled correctly.
- Build command documented.
- Database migration strategy documented.
- No dependency on Docker in Vercel production.
- No local filesystem persistence assumptions.
- No long-running server process assumptions.
- No hardcoded localhost URLs.

---

# 43. Environment Variables

Create:

```text
.env.example
```

Document variables such as:

```env
DATABASE_URL=
AUTH_SECRET=
NEXT_PUBLIC_APP_URL=
AUTH_URL=
```

Add other variables only when required.

Never commit real secrets.

---

# 44. Seed Data

Provide realistic seed data for local development.

Seed should include:

- Demo user
- Demo workspace
- Multiple workspace members
- Projects
- Project translations in all supported locales
- Notifications
- User preferences

Seed data should help reviewers immediately see:

- English content
- Spanish content
- Arabic content
- RTL behavior
- Multiple projects
- Role-based behavior

Do not use meaningless placeholder text everywhere.

---

# 45. Testing Requirements

At minimum, include testing for:

## Unit Tests

- Locale configuration
- Currency formatting
- Date formatting
- Permission checks
- Translation fallback
- Validation schemas

## Integration Tests

- Authentication
- Workspace isolation
- Project CRUD
- Role restrictions
- Language switching
- Dynamic translation retrieval

## End-to-End Tests

Critical flows:

1. Register user.
2. Login.
3. Create workspace.
4. Create project.
5. Switch language.
6. View translated project.
7. Switch to Arabic.
8. Verify RTL layout.
9. Invite member.
10. Verify permission restrictions.

---

# 46. Observability and Logging

Implement a simple, maintainable approach for:

- Server errors
- Authentication failures
- Database errors
- Failed actions
- Important user actions

Avoid adding a complex observability platform unless necessary.

The code should be structured so tools such as Sentry or PostHog can be added later.

---

# 47. Documentation Requirements

Create a strong `README.md` containing:

- Product overview
- Feature list
- Technology stack
- Architecture overview
- Supported locales
- Screenshots section placeholder
- Local Docker setup
- Environment setup
- Database migration instructions
- Seed instructions
- Test instructions
- Vercel deployment instructions
- Project structure
- Design decisions
- Known limitations
- Future improvements

Also document:

- Translation workflow
- Adding a new locale
- Database translation strategy
- Permission model
- RTL implementation
- Deployment process

---

# 48. GitHub Requirements

The repository should include:

```text
README.md
PRD.md
.env.example
.gitignore
Dockerfile
Dockerfile.dev
docker-compose.yml
```

Use meaningful commits.

Recommended commit progression:

```text
chore: initialize Next.js project
feat: configure Docker development environment
feat: configure PostgreSQL and Prisma
feat: implement authentication
feat: implement workspace tenancy
feat: implement internationalization
feat: implement RTL support
feat: implement project management
feat: implement team management
feat: implement premium design system
feat: add motion and scroll interactions
test: add critical application tests
docs: add setup and deployment documentation
```

---

# 49. Development Milestones

## Milestone 1 — Foundation

- Initialize Next.js
- Configure TypeScript
- Configure Tailwind
- Configure Prisma
- Configure PostgreSQL
- Configure Docker
- Configure environment variables
- Establish folder structure

## Milestone 2 — Authentication

- Registration
- Login
- Logout
- Protected routes
- Session handling

## Milestone 3 — Multi-Tenancy

- Workspace model
- Workspace membership
- Active workspace
- Tenant isolation
- Role permissions

## Milestone 4 — Internationalization

- Locale routing
- Static translations
- Language switcher
- Locale persistence
- Regional formatting
- RTL support

## Milestone 5 — Core Product

- Dashboard
- Projects
- Dynamic project translations
- Team management
- Notifications
- Settings

## Milestone 6 — Premium UI

- Design tokens
- Marketing page
- Dashboard polish
- Responsive layouts
- Empty/loading/error states
- Motion system
- Scroll reveals
- Locale preview experience

## Milestone 7 — Quality

- Testing
- Security review
- Performance review
- Accessibility review
- RTL review
- SEO review
- Docker verification
- Vercel deployment

## Milestone 8 — Documentation

- README
- Architecture notes
- Setup instructions
- Deployment instructions
- Screenshots
- Demo credentials if applicable

---

# 50. Definition of Done

The project is complete only when:

## Functional

- Authentication works.
- Workspace creation works.
- Workspace switching works.
- Tenant isolation is enforced.
- Roles and permissions work.
- Projects can be created and managed.
- Dynamic translations work.
- Language switching works.
- Arabic RTL works correctly.
- Currency and date formatting work.
- Notifications work.
- Settings work.

## Technical

- TypeScript has no avoidable errors.
- Database schema is clean.
- Prisma migrations work.
- Docker setup works from a clean machine.
- Production build succeeds.
- Vercel deployment is possible.
- No secrets are committed.
- Server-side authorization is enforced.

## Design

- UI feels premium.
- Marketing website is visually impressive.
- Dashboard is polished.
- Mobile experience works.
- RTL experience is intentional.
- Animations are smooth and meaningful.
- Reduced-motion behavior works.
- Loading and empty states are designed.

## Documentation

- README is complete.
- Docker instructions are clear.
- Environment variables are documented.
- Database setup is documented.
- Deployment is documented.
- Architecture decisions are explained.

---

# 51. Instructions to the Implementing Engineer

Before writing implementation code:

1. Read this entire PRD carefully.
2. Analyze the requirements as a Principal Engineer and Solution Architect.
3. Identify architectural risks, ambiguities, and potential conflicts.
4. Propose the final technology versions.
5. Propose the final folder structure.
6. Propose the Prisma schema.
7. Propose the Docker architecture.
8. Propose the authentication approach.
9. Propose the internationalization architecture.
10. Propose the RTL implementation strategy.
11. Propose the permission and tenant-isolation strategy.
12. Propose the motion and UI architecture.
13. Identify which libraries are genuinely necessary.
14. Avoid unnecessary dependencies.
15. Explain any recommended deviations from this PRD before implementing them.

Do not begin large-scale implementation before the design is settled.

First provide:

```text
1. Architecture Review
2. Technical Decisions
3. Potential Risks
4. Proposed Folder Structure
5. Database Schema Plan
6. Docker Plan
7. Internationalization Plan
8. Authentication and Authorization Plan
9. UI/UX and Motion Plan
10. Phased Implementation Plan
```

Once the plan is approved or sufficiently validated, implement incrementally.

---

# 52. Quality Expectations

The implementation must be:

- Production-minded
- Clean
- Maintainable
- Type-safe
- Responsive
- Accessible
- Secure
- Internationalization-first
- RTL-aware
- Performance-conscious
- Visually polished
- Easy to extend

Do not produce a basic tutorial application.

Do not over-engineer the project into microservices.

Do not add libraries only because they are popular.

Do not use animations everywhere.

Do not treat Arabic as merely another translation file.

Do not implement tenant isolation only in the UI.

Do not leave loading, empty, error, or permission states unfinished.

Do not hardcode locale-specific behavior across random components.

---

# 53. Final Product Quality Bar

The finished application should communicate the following impression:

> This developer understands modern full-stack architecture, international SaaS design, localization, RTL systems, multi-tenancy, deployment, product UX, and production-quality engineering.

The product should look suitable for:

- A serious SaaS startup
- A technical portfolio
- A client demo
- A product engineering interview
- A solution architecture discussion

The final result should balance:

```text
Technical depth
+
Product usability
+
Internationalization quality
+
Visual polish
+
Performance
+
Maintainability
```

The goal is not to build the largest application.

The goal is to build a small but exceptionally well-engineered and visually impressive SaaS platform.