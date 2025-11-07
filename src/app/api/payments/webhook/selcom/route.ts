// app/api/payments/webhook/selcom/route.ts
import { prisma } from '@/lib/prisma';
import { XMLParser } from 'fast-xml-parser';

export async function POST(req: Request) {
    const textPayload = await req.text();
    const parser = new XMLParser();
    const payload = parser.parse(textPayload)['selcom-callback'];
    
    const { result, 'utility-ref': transactionRef, message } = payload;

    // '000' ni code ya mafanikio kwa Selcom
    if (result === 'SUCCESS') {
        try {
            await prisma.$transaction(async (tx) => {
                const invoice = await tx.invoice.findUnique({ where: { transactionRef } });
                if (!invoice || invoice.status === 'PAID') return;

                const payment = await tx.payment.create({
                    data: { leaseId: invoice.leaseId, amount: invoice.amount, paymentDate: new Date(), method: 'SELCOM', status: 'Completed' },
                });
                await tx.invoice.update({ where: { id: invoice.id }, data: { status: 'PAID', paymentId: payment.id } });
            });
        } catch (error) {
            console.error('Failed to process Selcom webhook:', error);
        }
    }
    
    // Jibu Selcom kuonyesha tumepokea
    return new Response('OK', { status: 200 });
}