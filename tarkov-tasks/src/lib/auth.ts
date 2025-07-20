// src/lib/auth.ts
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import { NextAuthOptions, User } from "next-auth";
import { verifyPassword } from "./password";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Email",
            credentials: {
                email: { label: "Email", type: "text" },
                password: { label: "Password", type: "password" },
            },
            // <-- annotate return as Promise<User|null>
            async authorize(
                credentials,
                req
            ): Promise<User | null> {
                if (!credentials) return null;

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });
                if (!user) return null;

                const isValid = await verifyPassword(
                    credentials.password,
                    user.password
                );
                if (!isValid) return null;

                // Return `id` as a number
                return {
                    id: user.id,
                    email: user.email,
                    name: user.email,
                };
            },
        }),
    ],

    session: { strategy: "jwt" },
    secret: process.env.NEXTAUTH_SECRET,

    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id;
            return token;
        },
        async session({ session, token }) {
            if (!session.user) return session;

            if (typeof token.id === "string") {
                session.user.id = parseInt(token.id, 10);
            } else if (typeof token.id === "number") {
                session.user.id = token.id;
            }
            return session;
        },
    },
};
