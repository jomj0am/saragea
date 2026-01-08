// src/app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { getAuthOptions } from "./auth-options";
import { NextRequest } from "next/server";

async function handler(req: NextRequest, context: unknown) {
  // 1. Fetch dynamic options
  const options = await getAuthOptions();
  return NextAuth(options)(req, context);
}

export { handler as GET, handler as POST };
