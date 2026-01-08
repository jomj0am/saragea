// app/[locale]/api/settings/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import * as z from "zod";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { logAction } from "@/lib/audit";

export const dynamic = "force-dynamic";
// Zod schema kwa ajili ya 'array' ya 'settings' tunayoipokea
const settingsArraySchema = z.array(
  z.object({
    id: z.string(),
    isEnabled: z.boolean(),
    // 'jsonContent' inaweza kuwa 'null' au 'object' yoyote
    jsonContent: z.any().nullable(),
  })
);

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Thibitisha 'body' ni 'array' ya 'settings' sahihi
    const validation = settingsArraySchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        {
          message: "Invalid payload format.",
          errors: validation.error.flatten(),
        },
        { status: 400 }
      );
    }

    const settingsToUpdate = validation.data;

    // Tumia Prisma Transaction
    const transactionPromises = settingsToUpdate.map((setting) =>
      prisma.setting.upsert({
        where: { id: setting.id },
        // --- REKEBISHO MUHIMU LIKO HAPA ---
        update: {
          isEnabled: setting.isEnabled,
          jsonContent: setting.jsonContent, // Sasisha fields sahihi
        },
        create: {
          id: setting.id,
          isEnabled: setting.isEnabled,
          jsonContent: setting.jsonContent, // Unda na fields sahihi
        },
      })
    );

    await prisma.$transaction(transactionPromises);
    await logAction(
      session.user.id,
      "SETTINGS_CHANGE",
      "SYSTEM",
      "Updated system configuration variables"
    );

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred.";
    console.error("Failed to update settings:", error);
    return NextResponse.json(
      { message: "Failed to update settings", error: errorMessage },
      { status: 500 }
    );
  }
}
