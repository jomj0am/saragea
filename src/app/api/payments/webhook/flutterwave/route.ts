// app/api/payments/webhook/flutterwave/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const secretHash = process.env.FLUTTERWAVE_SECRET_HASH;
  const signature = req.headers.get("verif-hash");
  if (!signature || signature !== secretHash) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const payload = await req.json();

  if (payload.status === "successful") {
    const tx_ref = payload.txRef;

    await prisma.$transaction(async (tx) => {
      // ✅ FIX: Added include: { lease: true }
      const invoice = await tx.invoice.findUnique({
        where: { transactionRef: tx_ref },
        include: { lease: true },
      });

      if (!invoice || invoice.status === "PAID") return;

      const payment = await tx.payment.create({
        data: {
          leaseId: invoice.leaseId,
          amount: invoice.amount,
          paymentDate: new Date(),
          method: "FLUTTERWAVE",
          status: "Completed",
        },
      });

      await sendNotification({
        userId: invoice.lease.tenantId, // Now safe to access
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
  }

  return NextResponse.json({ status: "success" });
}
