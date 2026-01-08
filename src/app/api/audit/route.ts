import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN")
    return NextResponse.json([], { status: 401 });

  const logs = await prisma.auditLog.findMany({
    take: 50, // Limit to last 50
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true, image: true, email: true } } },
  });
  return NextResponse.json(logs);
}
