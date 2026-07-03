import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function isAdminEmail(email: string): boolean {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return adminEmails.includes(email.toLowerCase());
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/signin",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (rawCredentials) => {
        const parsed = credentialsSchema.safeParse(rawCredentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.passwordHash || user.isBlocked) return null;

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) return null;

        return { id: user.id, name: user.name, email: user.email, image: user.image };
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      if (!user.email) return true;

      // Only a blocking check here — the adapter may not have persisted the
      // new user row yet at this point in the OAuth flow, so anything that
      // depends on the row already existing (like the ADMIN_EMAILS
      // promotion) belongs in the `session` callback instead, which only
      // ever runs for an already-persisted, already-authenticated user.
      const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
      if (dbUser?.isBlocked) return false;

      return true;
    },
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    async session({ session, token }) {
      if (!session.user) return session;
      session.user.id = token.id as string;

      let dbUser = await prisma.user.findUnique({
        where: { id: token.id as string },
        select: { id: true, email: true, role: true, isBlocked: true, avatarId: true },
      });

      if (dbUser && dbUser.role !== "ADMIN" && dbUser.email && isAdminEmail(dbUser.email)) {
        dbUser = await prisma.user.update({
          where: { id: dbUser.id },
          data: { role: "ADMIN" },
          select: { id: true, email: true, role: true, isBlocked: true, avatarId: true },
        });
      }

      if (dbUser) {
        session.user.role = dbUser.role;
        session.user.isBlocked = dbUser.isBlocked;
        session.user.avatarId = dbUser.avatarId;
      }

      return session;
    },
  },
});
