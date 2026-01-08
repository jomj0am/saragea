// app/[locale]/api/properties/locations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const locations = await prisma.property.findMany({
      where: { latitude: { not: null }, longitude: { not: null } },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        images: true,
      },
    });
    return NextResponse.json(locations);
  } catch {
    return NextResponse.json(
      { message: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}
