// app/api/payments/webhook/pesapal/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const payload = await req.json();
  const { orderTrackingId, orderMerchantReference } = payload;

  try {
    const transactionRef = orderMerchantReference;

    await prisma.$transaction(async (tx) => {
      // ✅ FIX: Added include: { lease: true }
      const invoice = await tx.invoice.findUnique({
        where: { transactionRef },
        include: { lease: true },
      });

      if (!invoice || invoice.status === "PAID") return;

      const payment = await tx.payment.create({
        data: {
          leaseId: invoice.leaseId,
          amount: invoice.amount,
          paymentDate: new Date(),
          method: "PESAPAL",
          status: "Completed",
        },
      });

      await sendNotification({
        userId: invoice.lease.tenantId,
        title: "Payment Received",
        message: `We received ${invoice.amount} via ${payment.method}. Thank you!`,
        type: "SUCCESS",
        link: "/dashboard?tab=payments",
        sendEmail: true,
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { status: "PAID", paymentId: payment.id },
      });
    });
  } catch (error) {
    console.error("Failed to process Pesapal webhook:", error);
  }

  const responsePayload = {
    orderNotificationType: "IPN",
    orderTrackingId: orderTrackingId,
    orderMerchantReference: orderMerchantReference,
    status: "200",
  };
  return NextResponse.json(responsePayload);
}
