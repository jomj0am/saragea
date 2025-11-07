// app/[locale]/api/users/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { Role } from '@prisma/client'; // Import 'Role' enum
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// GET users, with optional filtering by role
export async function GET(req: NextRequest) {
    // --- REKEBISHO #1: Ongeza Ulinzi ---
    // Hakikisha ni admin pekee anayeweza kupata orodha ya watumiaji
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const roleParam = searchParams.get('role');

        // --- REKEBISHO #2: Jenga 'Prisma query' ---
        const whereClause: { role?: Role } = {};

        // Thibitisha kama 'role' iliyotolewa ni halali
        if (roleParam && Object.values(Role).includes(roleParam as Role)) {
            whereClause.role = roleParam as Role;
        }

        const users = await prisma.user.findMany({
            where: whereClause,
            // --- REKEBISHO #3: Chagua 'fields' za kurudisha ---
            // Usirudishe kamwe password hash!
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json(users);

    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}