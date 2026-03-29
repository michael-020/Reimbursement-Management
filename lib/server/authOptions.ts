import { prisma } from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google"
import bcrypt from "bcrypt"
import { AuthOptions } from "next-auth";
import { AUTHOPTIONS } from "@/app/generated/prisma/enums";


export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if(!credentials?.email || !credentials?.password)
          return null

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email 
          }
        })

        if(!user || !user.password)
          return null

        const checkPassword = await bcrypt.compare(credentials.password, user.password);
        if(!checkPassword)
          return null

        return { id: user.id, email: user.email }
      }
    }),
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    session: ({ session, token }) => {
      if (session?.user && token.id) {
        session.user.id = token.id as string 
      }

      return session
    },
    jwt: async ({trigger, token, user, account, session}) => {
      if (user) {
        token.id = user.id;
        token.email = user.email;
      }

      if (trigger === "update" && session) {

        const dbUser = await prisma.user.findUnique({
          where: { id: token.id},
        });
        
        if (dbUser) {
          return token
        }
      }
      
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true }
          });
          if (dbUser) {
            token.id = dbUser.id;
            
          }
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
      
      return token;
    }, 
    async signIn({ account, profile }) {
      try {
        if (account?.provider === "google") {
          if (!profile?.email) {
            console.error("No email provided by Google");
            return false;
          }
          await prisma.user.upsert({
            where: {
              email: profile.email,
            },
            update: {
              provider: AUTHOPTIONS.GOOGLE,
            },
            create: {
              email: profile.email,
              provider: AUTHOPTIONS.GOOGLE,
            },
          });
          return true
        }

        return true;
      } catch (error) {
        console.error("Error in signIn callback:", error);
        if (error instanceof Error) {
          console.error(`Error type: ${error.name}, Message: ${error.message}`);
        }
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith(baseUrl)) {
        return `${baseUrl}/home`;
      }
      return baseUrl;
    },
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/signin"
  },
  secret: process.env.AUTH_SECRET
};
