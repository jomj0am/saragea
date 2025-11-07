// app/api/rooms/vacant/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const vacantRooms = await prisma.room.findMany({
            where: {
                isOccupied: false, // Pata tu vyumba vilivyo wazi
            },
            include: {
                property: true, // Jumuisha taarifa za jengo
            },
            orderBy: {
                property: {
                    name: 'asc'
                }
            }
        });
        return NextResponse.json(vacantRooms);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Failed to fetch vacant rooms' }, { status: 500 });
    }
}