import NextAuth, { User } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import authConfig from "@/auth.config";
import { dbGetUserById } from "@/data/user";

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
  unstable_update,
} = NextAuth({
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
  events: {
    //   async linkAccount({ user }) {
    //     await db.user.update({
    //       where: { id: user.id },
    //       data: { emailVerified: new Date() },
    //     });
    //   },
  },
  callbacks: {
    async signIn({ user }) {
      const existingUser = user.id ? await dbGetUserById(parseInt(user.id)) : null;
      if (!existingUser) return false;
      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) session.user.id = token.sub;
      if (token.role && session.user) session.user.role = token.role;
      // console.log(JSON.stringify(session, null, 2));
      return session;
    },
    async jwt({ token, trigger, session }) {
      if (!token.sub) return token;
      const existingUser = await dbGetUserById(parseInt(token.sub));
      if (!existingUser) return token;
      if (trigger === "update" && session) {
        const { name, email, image } = session;
        if (name) token.name = name;
        if (email) token.email = email;
        if (image) token.picture = image;
      }
      token.role = existingUser.role;
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});
