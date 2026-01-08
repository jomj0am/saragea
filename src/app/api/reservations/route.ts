import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json(
      { message: "Unauthorized. Please log in." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { message: "Room ID is required" },
        { status: 400 }
      );
    }

    // 1. Check if room exists
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return NextResponse.json({ message: "Room not found" }, { status: 404 });
    }

    // 2. Check if room is already occupied
    if (room.isOccupied) {
      return NextResponse.json(
        { message: "This room is currently occupied." },
        { status: 409 }
      );
    }

    // 3. Check if user already has a reservation for this room
    // Note: We use findFirst because findUnique requires the compound key input structure,
    // but checking logic is simpler this way or using the unique constraint catch.
    const existingReservation = await prisma.reservation.findUnique({
      where: {
        userId_roomId: {
          userId: session.user.id,
          roomId: roomId,
        },
      },
    });

    if (existingReservation) {
      return NextResponse.json(
        { message: "You have already reserved this room." },
        { status: 409 }
      );
    }

    // 4. Create the reservation
    const reservation = await prisma.reservation.create({
      data: {
        userId: session.user.id,
        roomId: roomId,
        status: "PENDING",
      },
    });

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    console.error("Reservation API Error:", error);
    return NextResponse.json(
      { message: "Failed to place reservation" },
      { status: 500 }
    );
  }
}
