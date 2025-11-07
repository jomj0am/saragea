// app/[locale]/api/conversations/[id]/messages/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Sasa tunatumia signature rahisi zaidi
export async function GET(request: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        // --- REKEBISHO MUHIMU LIKO HAPA ---
        // Pata 'id' kutoka kwenye URL
        const conversationId = request.nextUrl.pathname.split('/').pop();
        
        if (!conversationId) {
            return NextResponse.json({ message: 'Conversation ID is missing' }, { status: 400 });
        }
        
        // Pata meseji
        const messages = await prisma.message.findMany({
            where: { conversationId: conversationId },
            include: { sender: { select: { id: true, name: true, image: true } } },
            orderBy: { createdAt: 'asc' },
        });

        // Weka meseji zote ambazo si za mtumiaji huyu kuwa 'read'
        await prisma.message.updateMany({
            where: {
                conversationId: conversationId,
                senderId: { not: session.user.id },
            },
            data: { isRead: true },
        });

        return NextResponse.json(messages);
    } catch (error: unknown) {
        console.error("Failed to fetch messages:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return NextResponse.json({ message: 'Failed to fetch messages', error: errorMessage }, { status: 500 });
    }
}