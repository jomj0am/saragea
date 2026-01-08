import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ Fix: Properly type the params
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // ✅ Fix: Await the params to get the correct ID
    const { id: conversationId } = await context.params;

    if (!conversationId) {
      return NextResponse.json(
        { message: "Conversation ID is missing" },
        { status: 400 }
      );
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: conversationId },
      include: {
        sender: {
          select: { id: true, name: true, image: true },
        },
      },
      orderBy: { createdAt: "asc" }, // Oldest first for chat history
    });

    // Mark messages as read (optional, good UX)
    await prisma.message.updateMany({
      where: {
        conversationId: conversationId,
        senderId: { not: session.user.id },
        isRead: false,
      },
      data: { isRead: true },
    });

    return NextResponse.json(messages);
  } catch (error: unknown) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { message: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
