// app/[locale]/api/receipts/[paymentId]/route.tsx
import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { renderToStream } from '@react-pdf/renderer';
import ReceiptTemplate, { type ReceiptData } from '@/components/receipts/ReceiptTemplate';

// Hii inaiambia Next.js i-treat route hii kama dynamic kila wakati
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest, // Tumia NextRequest na uondoe 'context'
) {
  try {
    // Pata 'ID' kutoka kwenye URL
    const paymentId = request.nextUrl.pathname.split('/').pop();
    if (!paymentId) {
        return NextResponse.json({ message: 'Payment ID is missing' }, { status: 400 });
    }

    const paymentData = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        invoice: {
          include: {
            lease: {
              include: { tenant: true, room: { include: { property: true } } },
            },
          },
        },
      },
    });

    if (!paymentData || !paymentData.invoice) {
      return NextResponse.json({ message: 'Payment or associated invoice not found' }, { status: 404 });
    }

    const pdfStream = await renderToStream(
        <ReceiptTemplate data={paymentData as ReceiptData} />
    );
    
    return new NextResponse(pdfStream as unknown as ReadableStream, { 
  status: 200,
  headers: {
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="receipt-${paymentId}.pdf"`,
  },
});

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    console.error('Failed to generate receipt:', { error: errorMessage, stack: (error as Error).stack });
    
    return NextResponse.json(
      { message: 'Failed to generate receipt', error: errorMessage },
      { status: 500 },
    );
  }
}