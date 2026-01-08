// app/api/payments/webhook/paychangu/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendNotification } from "@/lib/notifications";

export async function POST(req: Request) {
  const signature = req.headers.get("x-paychangu-signature");
  const rawBody = await req.text();

  if (!signature) {
    return NextResponse.json({ message: "Missing signature" }, { status: 400 });
  }

  try {
    const gateway = await prisma.paymentGateway.findUnique({
      where: { provider: "PAYCHANGU" },
    });
    if (!gateway || !gateway.apiKey) {
      throw new Error("PayChangu public key not configured");
    }

    const verifier = crypto.createVerify("sha256");
    verifier.update(rawBody);
    const isVerified = verifier.verify(
      `-----BEGIN PUBLIC KEY-----\n${gateway.apiKey}\n-----END PUBLIC KEY-----`,
      signature,
      "base64"
    );

    if (!isVerified) {
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    const payload = JSON.parse(rawBody);
    const { status, tx_ref } = payload.data;

    if (status === "success") {
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
            method: "PAYCHANGU",
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
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: unknown) {
    console.error("PayChangu Webhook Error:", error);
    return NextResponse.json(
      { message: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
