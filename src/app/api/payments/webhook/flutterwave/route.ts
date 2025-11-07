// app/api/payments/webhook/flutterwave/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    // 1. Thibitisha request ni ya kweli (Signature Verification)
    const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
    const signature = req.headers.get('verif-hash');
    if (!signature || signature !== secretHash) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const payload = await req.json();

    // 2. Angalia kama malipo yalifanikiwa
    if (payload.status === 'successful') {
        const tx_ref = payload.txRef;

        // 3. Tumia Prisma Transaction kusasisha database
        await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { transactionRef: tx_ref } });
            if (!invoice || invoice.status === 'PAID') return;

            const payment = await tx.payment.create({
                data: {
                    leaseId: invoice.leaseId,
                    amount: invoice.amount,
                    paymentDate: new Date(),
                    method: 'FLUTTERWAVE',
                    status: 'Completed',
                },
            });

            await tx.invoice.update({
                where: { id: invoice.id },
                data: { status: 'PAID', paymentId: payment.id },
            });
        });
    }

    return NextResponse.json({ status: 'success' });
}