// app/[locale]/api/payments/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

const paymentSchema = z.object({
    invoiceId: z.string().cuid(),
    amount: z.coerce.number().positive(),
    paymentDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "Invalid date format" }),
    method: z.string().min(2),
});

// GET all payments (Hii sasa haitumiwi sana, data inapakiwa na Server Component)
export async function GET() {
    // ... admin protection logic ...
    const payments = await prisma.payment.findMany({ /* ... includes ... */ });
    return NextResponse.json(payments);
}

// POST a new MANUAL payment record
export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validation = paymentSchema.safeParse(body);
        if (!validation.success) {
            return NextResponse.json({ errors: validation.error.flatten().fieldErrors }, { status: 400 });
        }

        const { invoiceId, amount, paymentDate, method } = validation.data;
        
        // Tumia Prisma Transaction kwa usalama
        const result = await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { id: invoiceId } });
            if (!invoice) throw new Error("Invoice not found.");
            if (invoice.status === 'PAID') throw new Error("This invoice has already been paid.");
            
            // 1. Rekodi malipo
            const newPayment = await tx.payment.create({
                data: {
                    leaseId: invoice.leaseId,
                    amount,
                    paymentDate: new Date(paymentDate),
                    method,
                    status: 'Completed',
                },
            });

            // 2. Sasisha ankara iwe 'PAID' na iunganishe na malipo
            await tx.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: 'PAID',
                    paymentId: newPayment.id,
                },
            });
            
            return newPayment;
        });

        return NextResponse.json(result, { status: 201 });

    } catch (error: unknown) {
            let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
        console.error('Manual Payment Recording Error:', error);
        return NextResponse.json({ message: message || 'Failed to record payment' }, { status: 500 });
    }
}