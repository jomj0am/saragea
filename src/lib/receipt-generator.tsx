// lib/receipt-generator.ts
import ReactDOMServer from 'react-dom/server';
import ReceiptTemplate from '@/components/receipts/ReceiptTemplate';
import { type Prisma } from '@prisma/client';

// 'Type' yetu inakaa hapa sasa
export type ReceiptData = Prisma.PaymentGetPayload<{
    include: {
        invoice: {
            include: {
                lease: {
                    include: {
                        tenant: true,
                        room: { include: { property: true } },
                    },
                },
            },
        },
    };
}>;

// 'Function' hii itachukua data na kurudisha HTML string
export function generateReceiptHtml(data: ReceiptData): string {
    const html = ReactDOMServer.renderToString(
        <ReceiptTemplate data={data} />
    );
    return html;
}