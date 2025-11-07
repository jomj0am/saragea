// app/api/messages/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { pusherServer } from '@/lib/pusher';

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { conversationId, content, recipientId } = await req.json();
    const senderId = session.user.id;
    
    let convId = conversationId;

    // Kama hakuna conversationId, inamaanisha ni ujumbe wa kwanza. Tunahitaji kuunda mazungumzo kwanza.
    if (!convId && recipientId) {
        const newConversation = await prisma.conversation.upsert({
            where: { tenantId_adminId: { tenantId: senderId, adminId: recipientId } }, // Hii inategemea mpangaji ndiye anayeanzisha
            update: {},
            create: { tenantId: senderId, adminId: recipientId },
        });
        convId = newConversation.id;
    }

    const newMessage = await prisma.message.create({
        data: {
            conversationId: convId,
            senderId,
            content,
        },
    });
    
    // Pia, sasisha 'updatedAt' ya mazungumzo ili ionekane juu
    await prisma.conversation.update({
        where: { id: convId },
        data: { updatedAt: new Date() },
    });

    await pusherServer.trigger(
        convId,           // Channel name (conversation ID)
        'messages:new',   // Event name
        newMessage        // Data to send
    );


    return NextResponse.json(newMessage, { status: 201 });
}