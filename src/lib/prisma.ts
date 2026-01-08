// src/lib/prisma.ts
import { PrismaClient } from "@prisma/client";

// 'declare' inapanua 'global namespace' ya TypeScript.
declare global {
  // Tunatangaza variable 'prisma' kwenye 'globalThis' namespace.
  // 'globalThis' inafanya kazi kwenye mazingira yote (Node, Edge, Browser).
  var prisma: PrismaClient | undefined;
}

// 'singleton' pattern inahakikisha tuna 'instance' moja tu ya PrismaClient.
export const prisma =
  globalThis.prisma ||
  new PrismaClient({
    // This helps prevent the build from hanging/crashing immediately if DB is missing
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = prisma;
}
