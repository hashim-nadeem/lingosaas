import { loadEnvFile } from "node:process";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, type ProjectStatus, type Role } from "@prisma/client";
import bcrypt from "bcryptjs";

try {
  loadEnvFile(".env");
} catch {
  // CI / Vercel already have the environment
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PASSWORD = "demo1234";

/**
 * Realistic trilingual data. A reviewer should be able to sign in, switch to
 * Arabic, and immediately see translated content in an RTL layout — not
 * "Project 1", "Project 2".
 */
const PEOPLE = [
  { name: "Amira Haddad", email: "demo@lingosaas.dev", role: "OWNER", locale: "en-US" },
  { name: "Diego Ramírez", email: "diego@lingosaas.dev", role: "ADMIN", locale: "es-MX" },
  { name: "Layla Al-Mansouri", email: "layla@lingosaas.dev", role: "MEMBER", locale: "ar-AE" },
  { name: "Sarah Chen", email: "sarah@lingosaas.dev", role: "MEMBER", locale: "en-US" },
] as const;

const PROJECTS: {
  status: ProjectStatus;
  createdDaysAgo: number;
  translations: { locale: string; name: string; description: string }[];
}[] = [
  {
    status: "IN_PROGRESS",
    createdDaysAgo: 34,
    translations: [
      {
        locale: "en-US",
        name: "Website Redesign",
        description:
          "Rebuild the marketing site with a locale-aware component library and a shared design token set.",
      },
      {
        locale: "es-MX",
        name: "Rediseño del sitio web",
        description:
          "Reconstruir el sitio de marketing con una biblioteca de componentes adaptada a cada región y tokens de diseño compartidos.",
      },
      {
        locale: "ar-AE",
        name: "إعادة تصميم الموقع",
        description:
          "إعادة بناء الموقع التسويقي باستخدام مكتبة مكوّنات تراعي اللغة والمنطقة مع مجموعة موحّدة من رموز التصميم.",
      },
    ],
  },
  {
    status: "IN_PROGRESS",
    createdDaysAgo: 21,
    translations: [
      {
        locale: "en-US",
        name: "Gulf Market Launch",
        description:
          "Prepare pricing, invoicing and support hours for the UAE launch, including full right-to-left review.",
      },
      {
        locale: "es-MX",
        name: "Lanzamiento en el Golfo",
        description:
          "Preparar precios, facturación y horarios de soporte para el lanzamiento en los Emiratos, con una revisión completa de derecha a izquierda.",
      },
      {
        locale: "ar-AE",
        name: "إطلاق سوق الخليج",
        description:
          "إعداد التسعير والفوترة وساعات الدعم لإطلاق الخدمة في الإمارات، مع مراجعة كاملة لتخطيط الكتابة من اليمين إلى اليسار.",
      },
    ],
  },
  {
    status: "PLANNING",
    createdDaysAgo: 9,
    translations: [
      {
        locale: "en-US",
        name: "Billing Localization",
        description:
          "Render invoices in the customer's currency and regional date format, with tax labels per market.",
      },
      {
        locale: "es-MX",
        name: "Localización de facturación",
        description:
          "Generar facturas en la moneda del cliente y el formato de fecha regional, con etiquetas fiscales por mercado.",
      },
      {
        locale: "ar-AE",
        name: "توطين الفوترة",
        description:
          "إصدار الفواتير بعملة العميل وبتنسيق التاريخ الإقليمي، مع بيان الضرائب لكل سوق.",
      },
    ],
  },
  {
    status: "PLANNING",
    createdDaysAgo: 5,
    // Deliberately untranslated beyond English: this is what exercises the
    // fallback chain and the "not yet translated" notice in the UI.
    translations: [
      {
        locale: "en-US",
        name: "Support Handbook",
        description:
          "Write the escalation playbook for support agents across the three time zones we now cover.",
      },
    ],
  },
  {
    status: "COMPLETED",
    createdDaysAgo: 72,
    translations: [
      {
        locale: "en-US",
        name: "Mobile Navigation Overhaul",
        description: "Replaced the drawer with a bottom bar and fixed the RTL mirroring on iOS Safari.",
      },
      {
        locale: "es-MX",
        name: "Renovación de la navegación móvil",
        description:
          "Se reemplazó el menú lateral por una barra inferior y se corrigió el reflejo de derecha a izquierda en iOS Safari.",
      },
      {
        locale: "ar-AE",
        name: "تحديث التنقّل على الجوال",
        description:
          "استُبدلت القائمة الجانبية بشريط سفلي، وصُحّح انعكاس الاتجاه من اليمين إلى اليسار في متصفح سفاري على iOS.",
      },
    ],
  },
  {
    status: "COMPLETED",
    createdDaysAgo: 96,
    translations: [
      {
        locale: "en-US",
        name: "Design Token Migration",
        description: "Moved every hardcoded color and spacing value onto the shared token scale.",
      },
      {
        locale: "es-MX",
        name: "Migración de tokens de diseño",
        description:
          "Se trasladaron todos los colores y espaciados fijos a la escala de tokens compartida.",
      },
      {
        locale: "ar-AE",
        name: "ترحيل رموز التصميم",
        description: "نُقلت جميع قيم الألوان والمسافات الثابتة إلى مقياس الرموز الموحّد.",
      },
    ],
  },
  {
    status: "ARCHIVED",
    createdDaysAgo: 140,
    translations: [
      {
        locale: "en-US",
        name: "Legacy Dashboard",
        description: "Retired after the workspace rewrite. Kept for reference only.",
      },
      {
        locale: "es-MX",
        name: "Panel heredado",
        description: "Retirado tras la reescritura del espacio de trabajo. Se conserva solo como referencia.",
      },
      {
        locale: "ar-AE",
        name: "لوحة التحكم القديمة",
        description: "أُوقفت بعد إعادة كتابة مساحة العمل، ويُحتفظ بها للرجوع إليها فقط.",
      },
    ],
  },
];

function daysAgo(n: number) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  console.log("Seeding…");

  // Idempotent: re-running replaces the demo tenant rather than duplicating it.
  await prisma.workspace.deleteMany({ where: { slug: { in: ["northwind-global", "atlas-labs"] } } });
  await prisma.user.deleteMany({ where: { email: { in: PEOPLE.map((p) => p.email) } } });

  const passwordHash = await bcrypt.hash(PASSWORD, 12);

  const users = await Promise.all(
    PEOPLE.map((person) =>
      prisma.user.create({
        data: {
          name: person.name,
          email: person.email,
          passwordHash,
          preference: {
            create: {
              locale: person.locale,
              timezone:
                person.locale === "es-MX"
                  ? "America/Mexico_City"
                  : person.locale === "ar-AE"
                    ? "Asia/Dubai"
                    : "America/New_York",
              theme: "SYSTEM",
            },
          },
        },
        select: { id: true, name: true, email: true },
      }),
    ),
  );

  const owner = users[0];

  const workspace = await prisma.workspace.create({
    data: {
      name: "Northwind Global",
      slug: "northwind-global",
      description: "A retail brand serving the United States, Mexico and the UAE from one platform.",
      ownerId: owner.id,
      members: {
        create: users.map((user, i) => ({
          userId: user.id,
          role: PEOPLE[i].role as Role,
          createdAt: daysAgo(120 - i * 18),
        })),
      },
    },
    select: { id: true },
  });

  // A second workspace so the switcher has something to switch to, and so
  // tenant isolation is visibly demonstrable rather than merely claimed.
  const secondary = await prisma.workspace.create({
    data: {
      name: "Atlas Labs",
      slug: "atlas-labs",
      description: "A side venture — used to demonstrate workspace isolation.",
      ownerId: owner.id,
      members: { create: { userId: owner.id, role: "OWNER" } },
      projects: {
        create: {
          status: "PLANNING",
          createdById: owner.id,
          translations: {
            create: [
              {
                locale: "en-US",
                name: "Atlas Onboarding",
                description: "Projects here must never appear under Northwind Global.",
              },
              {
                locale: "es-MX",
                name: "Incorporación de Atlas",
                description: "Los proyectos aquí nunca deben aparecer en Northwind Global.",
              },
              {
                locale: "ar-AE",
                name: "تهيئة أطلس",
                description: "يجب ألّا تظهر مشاريع هذه المساحة ضمن Northwind Global إطلاقًا.",
              },
            ],
          },
        },
      },
    },
    select: { id: true },
  });

  for (const project of PROJECTS) {
    await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        status: project.status,
        createdById: users[Math.floor(Math.random() * users.length)].id,
        createdAt: daysAgo(project.createdDaysAgo),
        translations: { create: project.translations },
      },
    });
  }

  await prisma.notification.createMany({
    data: [
      {
        userId: owner.id,
        workspaceId: workspace.id,
        type: "WELCOME",
        messageKey: "WELCOME",
        params: { name: owner.name },
        readAt: daysAgo(30),
        createdAt: daysAgo(30),
      },
      {
        userId: owner.id,
        workspaceId: workspace.id,
        type: "PROJECT_CREATED",
        messageKey: "PROJECT_CREATED",
        params: { actor: "Diego Ramírez", project: "Gulf Market Launch" },
        createdAt: daysAgo(21),
      },
      {
        userId: owner.id,
        workspaceId: workspace.id,
        type: "MEMBER_JOINED",
        messageKey: "MEMBER_JOINED",
        params: { name: "Layla Al-Mansouri" },
        createdAt: daysAgo(14),
      },
      {
        userId: owner.id,
        workspaceId: workspace.id,
        type: "PROJECT_UPDATED",
        messageKey: "PROJECT_UPDATED",
        params: { actor: "Sarah Chen", project: "Website Redesign" },
        createdAt: daysAgo(2),
      },
      {
        userId: owner.id,
        workspaceId: workspace.id,
        type: "WORKSPACE_UPDATED",
        messageKey: "WORKSPACE_UPDATED",
        params: { actor: "Amira Haddad" },
        createdAt: daysAgo(1),
      },
    ],
  });

  await prisma.invitation.create({
    data: {
      workspaceId: workspace.id,
      email: "priya@lingosaas.dev",
      role: "MEMBER",
      token: "seed-demo-invitation-token",
      invitedById: owner.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✔ Seeded 2 workspaces, ${users.length} users, ${PROJECTS.length + 1} projects.`);
  console.log(`  Sign in as ${owner.email} / ${PASSWORD}`);
  console.log(`  Workspaces: northwind-global (${workspace.id}), atlas-labs (${secondary.id})`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
