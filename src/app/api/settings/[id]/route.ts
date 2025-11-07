// app/[locale]/api/settings/[id]/route.ts
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { Prisma } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// --- REKEBISHO #1: Tumia 'z.any()' kwa 'jsonContent' ---
// Hii inaiambia Zod ikubali 'object' yoyote ya JSON bila kuichunguza kwa undani.
const settingsUpdateSchema = z.object({
    jsonContent: z.any(),
});

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await request.json();
        
        const validation = settingsUpdateSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }
        
        // --- REKEBISHO #2: Pitisha data kwa Prisma kwa usalama ---
        // 'validation.data.jsonContent' sasa ni 'any'.
        // Prisma inatarajia 'InputJsonValue' kwa 'jsonContent'.
        // Kwa bahati nzuri, 'any' inakubalika na Prisma hapa.
        const updatedSetting = await prisma.setting.update({
            where: { id: id },
            data: { 
                jsonContent: validation.data.jsonContent,
            },
        });

        return NextResponse.json({ message: 'Settings updated successfully', setting: updatedSetting });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        console.error(`API PATCH /api/settings/${id} Error:`, error);
        return NextResponse.json({ message: `Failed to update settings: ${errorMessage}` }, { status: 500 });
    }
}