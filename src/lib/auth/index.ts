import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db/client";
import { loginSchema } from "@/lib/validations/auth";

/**
 * JWT sessions, deliberately.
 *
 * The token carries the user id and nothing else. Workspace membership and
 * role are re-read from the database on every request (see lib/db/context.ts)
 * because a role baked into a token goes stale the moment an admin demotes
 * someone — that is a privilege-escalation bug, not a caching trade-off.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  // Unprefixed paths; the next-intl middleware sends them to the user's locale.
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: { id: true, name: true, email: true, image: true, passwordHash: true },
        });

        // Compare even when the user is missing, so response time does not
        // reveal which emails are registered.
        const hash = user?.passwordHash ?? "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinv";
        const ok = await bcrypt.compare(parsed.data.password, hash);
        if (!user || !user.passwordHash || !ok) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
