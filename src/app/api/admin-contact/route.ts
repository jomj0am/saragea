import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Find the first user with ROLE 'ADMIN'
    // In a complex app, you might have a specific 'SUPPORT' role,
    // but for now, the first Admin acts as the dispatcher.
    const admin = await prisma.user.findFirst({
      where: { role: "ADMIN" },
      select: { id: true, name: true, image: true },
    });

    if (!admin) {
      return NextResponse.json(
        { message: "No administrators found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ adminId: admin.id, admin });
  } catch {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
