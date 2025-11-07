
// app/[locale]/api/properties/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Hii inaiambia Next.js i-treat route hii kama dynamic kila wakati
export const dynamic = 'force-dynamic';

// Zod schema (inabaki kama ilivyo)
const propertyUpdateSchema = z.object({
    name: z.string().min(3).optional(),
    location: z.string().min(3).optional(),
    description: z.string().optional(),
    images: z.array(z.string().url()).min(1).optional(),
    amenities: z.array(z.string()).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});
/**
 * GET a single property with its rooms
 */
export async function GET(request: NextRequest) {
    try {
        const id = request.nextUrl.pathname.split('/').pop();
        if (!id) return NextResponse.json({ message: 'Property ID is missing' }, { status: 400 });

        const property = await prisma.property.findUnique({
            where: { id },
            include: { rooms: { orderBy: { roomNumber: 'asc' } } },
        });

        if (!property) {
            return NextResponse.json({ message: 'Property not found' }, { status: 404 });
        }
        
        return NextResponse.json(property);
    } catch (error: unknown) {
        console.error(`API GET /properties/[id] Error:`, error);
        return NextResponse.json({ message: 'Failed to fetch property' }, { status: 500 });
    }
}

/**
 * UPDATE an existing property
 */
export async function PATCH(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    try {
        const id = request.nextUrl.pathname.split('/').pop();
        if (!id) return NextResponse.json({ message: 'Property ID is missing' }, { status: 400 });

        const body = await request.json();
        const validation = propertyUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const dataToUpdate = validation.data;
        
        const updatedProperty = await prisma.property.update({
            where: { id },
            data: dataToUpdate,
        });
        
        return NextResponse.json(updatedProperty);
    } catch (error: unknown) {
        console.error(`API PATCH /properties/[id] Error:`, error);
        return NextResponse.json({ message: 'Failed to update property' }, { status: 500 });
    }
}

/**
 * DELETE a property and all its associated data
 */
export async function DELETE(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const id = request.nextUrl.pathname.split('/').pop();
        if (!id) return NextResponse.json({ message: 'Property ID is missing' }, { status: 400 });

        await prisma.property.delete({ where: { id } });
        
        return NextResponse.json({ message: 'Property deleted successfully' });

    } catch (error: unknown) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
            return NextResponse.json({ message: 'Property to delete was not found.' }, { status: 404 });
        }
        console.error(`API DELETE /properties/[id] Error:`, error);
        return NextResponse.json({ message: 'Failed to delete property' }, { status: 500 });
    }
}