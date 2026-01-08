// app/api/tickets/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { sendNotification } from "@/lib/notifications";

export const dynamic = "force-dynamic";
// Tenant creates a new ticket
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { title, description, roomId, priority } = await req.json();

    const newTicket = await prisma.maintenanceTicket.create({
      data: {
        title,
        description,
        roomId,
        priority,

        tenantId: session.user.id,
      },
    });

    const admins = await prisma.user.findMany({ where: { role: "ADMIN" } });

    for (const admin of admins) {
      await sendNotification({
        userId: admin.id,
        title: "New Maintenance Request",
        message: `Ticket #${newTicket.id.slice(-4)}: ${title}`,
        type: "WARNING", // Use warning color (yellow/orange) for maintenance
        link: "/admin/maintenance",
        sendEmail: true,
      });
    }
    return NextResponse.json(newTicket, { status: 201 });
  } catch {
    return NextResponse.json(
      { message: "Failed to create ticket" },
      { status: 500 }
    );
  }
}
