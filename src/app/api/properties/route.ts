// app/api/properties/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Tumia prisma singleton
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getServerSession } from 'next-auth';
import * as z from 'zod';

// Weka Zod schema hapa ili kuhakikisha data inayoingia ni sahihi
const propertyCreateSchema = z.object({
    name: z.string().min(3),
    location: z.string().min(3),
    description: z.string().optional(),
    images: z.array(z.string().url()).min(1),
    amenities: z.array(z.string()).optional(),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

// GET all properties (hii ilikuwa sawa, lakini hebu tumie prisma singleton)
export async function GET() {
    try {
        const properties = await prisma.property.findMany({
            include: { _count: { select: { rooms: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return NextResponse.json(properties);
    } catch (error) {
        console.error("API GET /properties Error:", error);
        return NextResponse.json({ message: 'Failed to fetch properties' }, { status: 500 });
    }
}

// CREATE a new property (building) - IMEBORESHWA KIKAMILIFU
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        // 1. Thibitisha data kwa kutumia Zod
        const validation = propertyCreateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        // 2. Tumia data iliyothibitishwa
        const { name, location, description, images, amenities, latitude, longitude } = validation.data;
        
        const newProperty = await prisma.property.create({
            data: {
                name,
                location,
                description,
                images, // <-- Sasa tunahifadhi 'images'
                amenities,
                latitude, // <-- na 'latitude'
                longitude, // <-- na 'longitude'
                
                ownerId: session.user.id,
            },
        });

        return NextResponse.json(newProperty, { status: 201 });
    } catch (error) {
        console.error("API POST /properties Error:", error);
        return NextResponse.json({ message: 'Failed to create property' }, { status: 500 });
    }
}