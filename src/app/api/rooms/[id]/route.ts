import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

const roomUpdateSchema = z.object({
  roomNumber: z.string().min(1).optional(),
  type: z.string().min(3).optional(),
  price: z.coerce.number().positive().optional(),
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  isOccupied: z.boolean().optional(),
});

// UPDATE a room
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ await params

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const validation = roomUpdateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updatedRoom = await prisma.room.update({
      where: { id },
      data: validation.data,
    });

    return NextResponse.json(updatedRoom);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Update failed';
    console.error(`API PATCH /rooms/${id} Error:`, error);
    return NextResponse.json({ message: `Failed to update room: ${errorMessage}` }, { status: 500 });
  }
}

// DELETE a room
export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params; // ✅ await params

  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Room deleted successfully' });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Delete failed';
    console.error(`API DELETE /rooms/${id} Error:`, error);
    return NextResponse.json({ message: `Failed to delete room: ${errorMessage}` }, { status: 500 });
  }
}
