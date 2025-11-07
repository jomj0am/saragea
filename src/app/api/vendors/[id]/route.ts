// app/[locale]/api/vendors/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Zod schema kwa ajili ya validation
const vendorUpdateSchema = z.object({
    name: z.string().min(3).optional(),
    trade: z.string().min(3).optional(),
    phone: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
});

// UPDATE a vendor
export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: vendorId } = await context.params;
    
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const validation = vendorUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        const dataToUpdate = {
            ...validation.data,
            email: validation.data.email || null, // Hakikisha email tupu inakuwa null
        };

        const updatedVendor = await prisma.vendor.update({
            where: { id: vendorId },
            data: dataToUpdate,
        });
        return NextResponse.json(updatedVendor);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Update failed";
        console.error(`API PATCH /vendors/${vendorId} Error:`, error);
        return NextResponse.json({ message: `Failed to update vendor: ${errorMessage}` }, { status: 500 });
    }
}

// DELETE a vendor
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id: vendorId } = await context.params;

    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Angalia kama fundi ana tiketi zozote alizogawiwa
        const assignedTickets = await prisma.maintenanceTicket.count({
            where: { vendorId: vendorId },
        });

        if (assignedTickets > 0) {
            return NextResponse.json({ message: 'Cannot delete vendor with assigned tickets. Please unassign them first.' }, { status: 409 });
        }

        await prisma.vendor.delete({
            where: { id: vendorId },
        });
        
        return NextResponse.json({ message: 'Vendor deleted successfully' });

    } catch (error: unknown) {
         if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ message: 'Vendor to delete was not found.' }, { status: 404 });
        }
        const errorMessage = error instanceof Error ? error.message : "Delete failed";
        console.error(`API DELETE /vendors/${vendorId} Error:`, error);
        return NextResponse.json({ message: `Failed to delete vendor: ${errorMessage}` }, { status: 500 });
    }
}