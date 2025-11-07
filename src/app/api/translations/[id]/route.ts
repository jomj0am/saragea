// app/[locale]/api/translations/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { type Translation } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// 'POST' handler itashughulikia batch updates/creates
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const translationsToUpdate = await req.json() as Translation[];

        if (!Array.isArray(translationsToUpdate)) {
            return NextResponse.json({ message: 'Invalid payload. Expected an array of translations.' }, { status: 400 });
        }
        
        const transactionPromises = translationsToUpdate.map(t =>
            prisma.translation.upsert({
                // Tunatumia composite key yetu ya kipekee hapa
                where: { locale_key: { locale: t.locale, key: t.key } },
                update: { value: t.value },
                create: { key: t.key, locale: t.locale, value: t.value },
            })
        );
        
        await prisma.$transaction(transactionPromises);

        return NextResponse.json({ message: 'Translations updated successfully' });

    } catch (error) {
        console.error("Failed to update translations:", error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}


// Tunaweza kuacha 'PATCH' handler ya [id] kama tunataka kuitumia sehemu nyingine,
// lakini kwa sasa, 'POST' ndiyo itakayotumiwa na HomepageEditor yetu.

// Pia, hakikisha faili la `app/[locale]/api/translations/[id]/route.ts` bado lipo
// kama ulilitengeneza, au ulihamishe logic yake hapa kama inahitajika.