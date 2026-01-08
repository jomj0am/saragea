import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { getPusherServer } from "@/lib/pusher";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { conversationId, content, recipientId } = await req.json();
  const senderId = session.user.id;
  const senderName = session.user.name || "User";

  let convId = conversationId;
  let finalRecipientId = recipientId;

  // 1. Handle New Conversation Creation
  if (!convId && recipientId) {
    // If it's a new chat, we assume the structure based on roles.
    // Ideally, check session.user.role to know which ID is which.
    const isTenant = session.user.role === "TENANT";

    // If sender is Tenant, they are contacting Admin (recipient)
    // If sender is Admin, they are contacting Tenant (recipient)
    const conversationData = isTenant
      ? { tenantId: senderId, adminId: recipientId }
      : { tenantId: recipientId, adminId: senderId };

    const newConversation = await prisma.conversation.upsert({
      where: { tenantId_adminId: conversationData },
      update: {},
      create: conversationData,
    });
    convId = newConversation.id;
  }

  // 2. Handle Existing Conversation (Find Recipient if missing)
  if (convId && !finalRecipientId) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: convId },
      select: { tenantId: true, adminId: true },
    });

    if (conversation) {
      // The recipient is whoever is NOT the sender
      finalRecipientId =
        conversation.tenantId === senderId
          ? conversation.adminId
          : conversation.tenantId;
    }
  }

  // 3. Create Message in Database
  const newMessage = await prisma.message.create({
    data: {
      conversationId: convId,
      senderId,
      content,
    },
  });

  // 4. Update Conversation Timestamp (Moves it to top of list)
  await prisma.conversation.update({
    where: { id: convId },
    data: { updatedAt: new Date() },
  });

  // 5. Trigger Real-time Chat Update (Pusher)
  const pusherServer = getPusherServer();
  if (pusherServer) {
    await pusherServer.trigger(convId, "messages:new", newMessage);
  }

  // 6. Smart Notification
  if (finalRecipientId) {
    // Check for an existing unread message notification
    const existingNotification = await prisma.notification.findFirst({
      where: {
        userId: finalRecipientId,
        type: "MESSAGE",
        isRead: false,
        title: "New Message",
      },
    });

    if (existingNotification) {
      // --- SCENARIO A: Conversation is active (User hasn't read previous alerts) ---
      // Just update the dashboard bell, DO NOT send another email (Prevent Spam)
      const updatedNotification = await prisma.notification.update({
        where: { id: existingNotification.id },
        data: {
          message: `You have new messages from ${senderName}`,
          createdAt: new Date(),
        },
      });

      if (pusherServer) {
        await pusherServer.trigger(
          `user-${finalRecipientId}`,
          "notification:new",
          updatedNotification
        );
      }
    } else {
      // --- SCENARIO B: First message in a while ---
      // CREATE new notification AND send an Email to wake them up
      await sendNotification({
        userId: finalRecipientId,
        title: "New Message",
        message: `You have a new message from ${senderName}`,
        type: "MESSAGE",
        link: "/dashboard/messages",
        sendEmail: true, // ✅ CHANGED TO TRUE: Send email only for the start of a conversation
      });
    }
  }

  return NextResponse.json(newMessage, { status: 201 });
}
