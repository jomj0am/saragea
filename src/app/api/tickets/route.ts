// app/api/tickets/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Tenant creates a new ticket
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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
        return NextResponse.json(newTicket, { status: 201 });
    } catch (error) {
        return NextResponse.json({ message: 'Failed to create ticket' }, { status: 500 });
    }
}