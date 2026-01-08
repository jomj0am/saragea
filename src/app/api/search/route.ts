// app/[locale]/api/search/route.ts
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([]); // Rudisha tupu kama 'query' ni fupi sana
  }

  try {
    // Fanya 'queries' zote kwa pamoja kwa kutumia Promise.all
    const [properties, rooms] = await Promise.all([
      prisma.property.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { location: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true, name: true, location: true },
        take: 5,
      }),
      prisma.room.findMany({
        where: {
          OR: [
            { roomNumber: { contains: query, mode: "insensitive" } },
            { type: { contains: query, mode: "insensitive" } },
            { description: { contains: query, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          roomNumber: true,
          type: true,
          property: { select: { name: true } },
        },
        take: 5,
      }),
    ]);

    // Panga matokeo kwa ajili ya UI
    const results = [
      ...properties.map((p) => ({ type: "Property", ...p })),
      ...rooms.map(({ type: _, ...r }) => ({ type: "Room", ...r })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error("Global Search Error:", error);
    return NextResponse.json({ message: "Search failed" }, { status: 500 });
  }
}
