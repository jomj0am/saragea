// app/api/rooms/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { propertyId, roomNumber, type, price, description, images } = body;

    if (!propertyId || !roomNumber || !type || !price) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    const newRoom = await prisma.room.create({
      data: {
        propertyId,
        roomNumber,
        type,
        price: parseFloat(price),
        description: description || null,
        images: Array.isArray(images) ? images : [],
        isOccupied: false, // Default
      },
    });

    return NextResponse.json(newRoom, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to create room" },
      { status: 500 }
    );
  }
}
