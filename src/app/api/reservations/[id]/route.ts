// app/[locale]/api/reservations/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { ReservationStatus } from '@prisma/client'; // Import enum

// Hii inaiambia Next.js i-treat route hii kama dynamic kila wakati
export const dynamic = 'force-dynamic';

export async function PATCH(
    request: NextRequest,
) {
    // Ulinzi: Hakikisha ni admin pekee anayeweza kubadilisha status
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Pata ID kutoka kwenye URL
        const reservationId = request.nextUrl.pathname.split('/').pop();
        if (!reservationId) {
            return NextResponse.json({ message: 'Reservation ID is missing' }, { status: 400 });
        }
        
        const { status } = await request.json();

        // Thibitisha 'status' ni halali
        if (!status || !Object.values(ReservationStatus).includes(status as ReservationStatus)) {
            return NextResponse.json({ message: 'Invalid status provided.' }, { status: 400 });
        }

        const updatedReservation = await prisma.reservation.update({
            where: { id: reservationId },
            data: { status: status as ReservationStatus },
        });
        
        return NextResponse.json({ message: 'Reservation status updated.', reservation: updatedReservation });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error("Failed to update reservation:", error);
        return NextResponse.json({ message: 'Failed to update reservation', error: errorMessage }, { status: 500 });
    }
}