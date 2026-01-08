// app/api/conversations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export const dynamic = "force-dynamic";
// GET mazungumzo yote ya mtumiaji aliyeingia
export async function GET() {
  // 1. Pata session ya mtumiaji
  const session = await getServerSession(authOptions);

  // Angalia kama mtumiaji ameingia na ana taarifa zote muhimu

  if (!session?.user?.id || !session.user?.role) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userId: string = session.user.id;

    const userRole: string = session.user.role;

    // 2. Pata mazungumzo yote ambapo mtumiaji huyu anahusika
    const conversations = await prisma.conversation.findMany({
      where: {
        // Tumia OR ili kupata mazungumzo ambapo yeye ni mpangaji AU admin
        OR: [{ tenantId: userId }, { adminId: userId }],
      },
      include: {
        // 3. Jumuisha taarifa za ziada tunazozihitaji kwenye UI
        tenant: {
          select: { id: true, name: true, image: true },
        },
        admin: {
          select: { id: true, name: true, image: true },
        },
        // Pata ujumbe mmoja tu, ule wa mwisho, kwa ajili ya kuonyesha preview
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        // Hesabu meseji ambazo hazijasomwa na mtumiaji huyu
        _count: {
          select: {
            messages: {
              where: {
                isRead: false,
                // Chagua meseji ambazo SI yeye aliyetuma
                senderId: {
                  not: userId,
                },
              },
            },
          },
        },
      },
      orderBy: {
        // Panga mazungumzo kulingana na ujumbe wa mwisho uliotumwa
        updatedAt: "desc",
      },
    });

    // 4. Rekebisha data kidogo ili iwe rahisi kutumia kwenye frontend
    // Hii inahakikisha frontend inapata 'otherParty' moja kwa moja
    const conversationsWithOtherParty = conversations.map((conv) => {
      const otherParty = userRole === "TENANT" ? conv.admin : conv.tenant;
      return {
        ...conv,
        otherParty: {
          id: otherParty.id,
          name: otherParty.name,
          image: otherParty.image,
        },
      };
    });

    // 5. Rudisha orodha ya mazungumzo
    return NextResponse.json(conversationsWithOtherParty);
  } catch (error) {
    console.error("Failed to fetch conversations:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
