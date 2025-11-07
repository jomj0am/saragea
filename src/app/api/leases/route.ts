// app/api/leases/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { tenantId, roomId, startDate, endDate, amount, paymentMethod } = await req.json();

        // Transaction: Hizi operations zote zitafanikiwa au zitashindwa zote kwa pamoja
        const newLease = await prisma.$transaction(async (tx) => {
            // 1. Hakikisha chumba bado kiko wazi
            const room = await tx.room.findUnique({ where: { id: roomId } });
            if (!room || room.isOccupied) {
                throw new Error('Room is not available');
            }

            // 2. Unda Mkataba (Lease)
            const lease = await tx.lease.create({
                data: {
                    tenantId,
                    roomId,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    isActive: true,
                },
            });

            // 3. Rekodi Malipo ya Kwanza
            await tx.payment.create({
                data: {
                    leaseId: lease.id,
                    amount: parseFloat(amount),
                    paymentDate: new Date(),
                    method: paymentMethod,
                    status: 'Completed',
                },
            });

            // 4. Sasisha Chumba kuwa 'Occupied'
            await tx.room.update({
                where: { id: roomId },
                data: { isOccupied: true },
            });

            return lease;
        });

        // Hapa unaweza kuongeza logiki ya kufuta chumba kutoka kwenye cart zote za watumiaji
        
        return NextResponse.json(newLease, { status: 201 });

    } catch (error: unknown) {
            let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
        console.error('Lease creation failed:', error);
        return NextResponse.json({ message: message || 'Failed to create lease' }, { status: 500 });
    }
}