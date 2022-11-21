import NextAuth, { type NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "../../../server/db/client";

import { env } from "../../../env/server.mjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  /*callbacks: {
    async jwt(props) {
      if (props.user) {
        props.token.id_token = props.user.id;
      }

      return props.token;
    },
    async session({ session, token, user }) {
      session.user_id = token.id_token;
      return session;
    },
  },*/
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      idToken: true,
    }),
  ],
  secret: env.JWT_SECRET,
};

export default NextAuth(authOptions);
