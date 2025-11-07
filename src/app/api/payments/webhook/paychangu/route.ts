// app/api/payments/webhook/paychangu/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: Request) {
    // 1. Pata signature kutoka kwenye headers
    const signature = req.headers.get('x-paychangu-signature');
    const rawBody = await req.text(); // Tunahitaji text ghafi kwa ajili ya uthibitisho

    if (!signature) {
        return NextResponse.json({ message: 'Missing signature' }, { status: 400 });
    }

    try {
        // 2. Pata Public Key ya PayChangu kutoka kwenye database
        const gateway = await prisma.paymentGateway.findUnique({ where: { provider: 'PAYCHANGU' } });
        if (!gateway || !gateway.apiKey) {
            throw new Error('PayChangu public key not configured');
        }
        
        // 3. Thibitisha Signature
        const verifier = crypto.createVerify('sha256');
        verifier.update(rawBody);
        const isVerified = verifier.verify(
            `-----BEGIN PUBLIC KEY-----\n${gateway.apiKey}\n-----END PUBLIC KEY-----`,
            signature,
            'base64'
        );

        if (!isVerified) {
            console.error('Webhook Error: Invalid PayChangu signature.');
            return NextResponse.json({ message: 'Invalid signature' }, { status: 401 });
        }

        // 4. Kama signature ni sahihi, endelea na logiki
        const payload = JSON.parse(rawBody);
        const { status, tx_ref } = payload.data;

        if (status === 'success') {
            await prisma.$transaction(async (tx) => {
                const invoice = await tx.invoice.findUnique({ where: { transactionRef: tx_ref } });
                if (!invoice || invoice.status === 'PAID') return;

                const payment = await tx.payment.create({
                    data: {
                        leaseId: invoice.leaseId,
                        amount: invoice.amount,
                        paymentDate: new Date(),
                        method: 'PAYCHANGU',
                        status: 'Completed',
                    },
                });
                await tx.invoice.update({
                    where: { id: invoice.id },
                    data: { status: 'PAID', paymentId: payment.id },
                });
            });
        }
        
        // 5. Jibu PayChangu kuonyesha tumepokea
        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error: unknown) {
            let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
        console.error('PayChangu Webhook Error:', message);
        return NextResponse.json({ message: 'Webhook processing failed' }, { status: 500 });
    }
}