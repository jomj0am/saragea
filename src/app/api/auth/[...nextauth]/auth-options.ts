import { AuthOptions } from "next-auth";
import { PrismaClient } from "@prisma/client";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import AppleProvider from "next-auth/providers/apple";
import GoogleProvider from "next-auth/providers/google";
import FacebookProvider from "next-auth/providers/facebook";
import EmailProvider from "next-auth/providers/email";
import { sendVerificationRequest } from "@/lib/auth-emails"; 
import { PrismaAdapter } from '@next-auth/prisma-adapter';

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),

    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        FacebookProvider({
            clientId: process.env.FACEBOOK_CLIENT_ID!,
            clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
        }),
        EmailProvider({
            server: {}, 
            from: process.env.EMAIL_FROM,
            sendVerificationRequest,
        }),

        AppleProvider({
            clientId: process.env.APPLE_ID!,
            clientSecret: process.env.APPLE_CLIENT_SECRET!,

        }),
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email }
                });

                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                const isPasswordCorrect = await bcrypt.compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordCorrect) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role, 
                };
            }
        })
    ],

    session: {
        strategy: "jwt",
    },

    secret: process.env.NEXTAUTH_SECRET,

    pages: {
        signIn: '/login',
        error: '/login', 
    },
    
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                
                token.id = user.id;
                
                token.role = user.role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
               
                session.user.id = token.id;
                
                session.user.role = token.role;
            }
            return session;
        }
    },
};