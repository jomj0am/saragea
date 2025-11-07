// app/[locale]/api/tickets/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { TicketStatus } from '@prisma/client'; // Import enum
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Zod schema kwa ajili ya validation
const ticketUpdateSchema = z.object({
    status: z.nativeEnum(TicketStatus).optional(),
    vendorId: z.string().cuid().nullable().optional(),
});

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: ticketId } = await context.params;

    // Ulinzi wa Admin
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    } 
    
    try {
        const body = await request.json();
        const validation = ticketUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const dataToUpdate = validation.data;

        // Hakikisha angalau field moja inasasishwa
        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json({ message: 'No update data provided' }, { status: 400 });
        }
        
        // Hapa tunashughulikia kesi ya 'unassigning'
        if (dataToUpdate.vendorId === null) {
            // Prisma inahitaji 'null' iwekwe kwa njia maalum kwenye 'update'
            // Tutai-handle hapa kwa kuiweka 'null'
        }

        const updatedTicket = await prisma.maintenanceTicket.update({
            where: { id: ticketId },
            data: {
                status: dataToUpdate.status,
                vendorId: dataToUpdate.vendorId, // Prisma inakubali 'null' hapa
            },
        });

        // (Optional) Logic ya kutuma notisi kwa fundi
        // if (dataToUpdate.vendorId) { ... }

        return NextResponse.json(updatedTicket);
        
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Update failed";
        console.error(`API PATCH /tickets/${ticketId} Error:`, error);
        return NextResponse.json({ message: `Failed to update ticket: ${errorMessage}` }, { status: 500 });
    }
}