// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

// 'declare' inapanua 'global namespace' ya TypeScript.
declare global {
  // Tunatangaza variable 'prisma' kwenye 'globalThis' namespace.
  // 'globalThis' inafanya kazi kwenye mazingira yote (Node, Edge, Browser).
  var prisma: PrismaClient | undefined;
}

// 'singleton' pattern inahakikisha tuna 'instance' moja tu ya PrismaClient.
export const prisma = globalThis.prisma || new PrismaClient();

// Kwenye 'development', tunahifadhi 'instance' kwenye 'globalThis' ili isipotee
// wakati wa 'hot-reloading'.
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}