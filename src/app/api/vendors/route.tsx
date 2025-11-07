// app/api/vendors/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import * as z from 'zod';

// Schema ya uthibitishaji wa data kwa kutumia Zod
const vendorSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    trade: z.string().min(3, 'Trade is required'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

// GET all vendors
export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const vendors = await prisma.vendor.findMany({
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(vendors);
    } catch  {
        return NextResponse.json({ message: 'Failed to fetch vendors' }, { status: 500 });
    }
}

// CREATE a new vendor
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validation = vendorSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { name, trade, phone, email } = validation.data;

        const newVendor = await prisma.vendor.create({
            data: {
                name,
                trade,
                phone,
                email: email || null, // Hakikisha email inakuwa null kama ni string tupu
            },
        });
        return NextResponse.json(newVendor, { status: 201 });
    } catch  {
        return NextResponse.json({ message: 'Failed to create vendor' }, { status: 500 });
    }
}