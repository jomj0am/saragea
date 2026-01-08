// app/api/payments/webhook/selcom/route.ts
import { sendNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { XMLParser } from "fast-xml-parser";

export async function POST(req: Request) {
  const textPayload = await req.text();
  const parser = new XMLParser();
  const payload = parser.parse(textPayload)["selcom-callback"];

  const { result, "utility-ref": transactionRef } = payload;

  if (result === "SUCCESS") {
    try {
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
            method: "SELCOM",
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
      console.error("Failed to process Selcom webhook:", error);
    }
  }

  return new Response("OK", { status: 200 });
}
