// app/api/tenants/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET() {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const tenants = await prisma.user.findMany({
            where: { role: 'TENANT' },
            select: { id: true, name: true, email: true },
            orderBy: { name: 'asc' },
        });
        return NextResponse.json(tenants);
    } catch (error) {
        return NextResponse.json({ message: 'Failed to fetch tenants' }, { status: 500 });
    }
}