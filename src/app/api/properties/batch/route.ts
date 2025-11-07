// app/[locale]/api/properties/batch/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const ids = searchParams.get('ids');

    if (!ids) {
        return NextResponse.json([]);
    }
    
    const idArray = ids.split(',');

    try {
        const properties = await prisma.property.findMany({
            where: { id: { in: idArray } },
            include: { rooms: { where: { isOccupied: false } }, _count: { select: { rooms: true } } },
        });
        // Panga matokeo kulingana na mpangilio wa IDs
        const sortedProperties = idArray.map(id => properties.find(p => p.id === id)).filter(Boolean);
        return NextResponse.json(sortedProperties);
    } catch (error) {
        return NextResponse.json({ message: "Failed to fetch properties" }, { status: 500 });
    }
}