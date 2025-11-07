// app/api/payments/webhook/pesapal/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
    const payload = await req.json();
    const { orderTrackingId, orderNotificationType, orderMerchantReference } = payload;
    
    // Katika production, unapaswa kuthibitisha request hii ni ya kweli kutoka Pesapal.
    // Hii inahusisha kuangalia status ya malipo kwa kutumia 'orderTrackingId'
    // kupitia API endpoint ya 'GetTransactionStatus'. Hii ni hatua muhimu ya usalama.

    try {
        // Hapa tuna-assume malipo yamefanikiwa kwa ajili ya mfano.
        const transactionRef = orderMerchantReference;

        await prisma.$transaction(async (tx) => {
            const invoice = await tx.invoice.findUnique({ where: { transactionRef } });
            if (!invoice || invoice.status === 'PAID') return;
            
            const payment = await tx.payment.create({
                data: { leaseId: invoice.leaseId, amount: invoice.amount, paymentDate: new Date(), method: 'PESAPAL', status: 'Completed' },
            });
            await tx.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID', paymentId: payment.id } });
        });
    } catch (error) {
         console.error('Failed to process Pesapal webhook:', error);
    }
    
    // Jibu Pesapal kuonyesha tumepokea
    const responsePayload = {
        orderNotificationType: "IPN",
        orderTrackingId: orderTrackingId,
        orderMerchantReference: orderMerchantReference,
        status: "200"
    };
    return NextResponse.json(responsePayload);
}