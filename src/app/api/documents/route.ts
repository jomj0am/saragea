// app/api/documents/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { name, type, url, publicId } = body;

        if (!name || !type || !url || !publicId) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const newDocument = await prisma.document.create({
            data: {
                tenantId: session.user.id,
                name,
                type,
                url,
                publicId,
            },
        });

        return NextResponse.json(newDocument, { status: 201 });
    } catch (error) {
        console.error("Failed to save document record:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}