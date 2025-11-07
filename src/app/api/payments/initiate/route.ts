// app/[locale]/api/payments/initiate/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import * as z from 'zod';
import { GatewayProvider } from '@prisma/client';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";

// Zod schema for incoming request
const initiatePaymentSchema = z.object({
  invoiceId: z.string().cuid(),
  amount: z.number().positive(),
  gatewayProvider: z.nativeEnum(GatewayProvider),
});

interface PaymentGatewayMeta {
  ipn_id?: string;
  [key: string]: unknown; // allows for other optional fields
}

type InitiatePaymentBody = z.infer<typeof initiatePaymentSchema>;

const errorResponse = (message: string, status = 500) => {
  console.error(`Payment Initiation Error: ${message}`);
  return NextResponse.json({ message }, { status });
};

/**
 * POST /api/payments/initiate
 * Body: { invoiceId, amount, gatewayProvider }
 */
export async function POST(req: Request) {
  // auth
  const session = await getServerSession(authOptions);

  if (!session?.user?.id || !session.user?.email) {
    return errorResponse('Unauthorized', 401);
  }

  // parse + validate
  let body: unknown;
  try {
    body = await req.json();
  } catch  {
    return errorResponse('Invalid JSON body', 400);
  }

  const parsed = initiatePaymentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }
  const { invoiceId, amount, gatewayProvider } = parsed.data as InitiatePaymentBody;

  // find configured gateway
  const gateway = await prisma.paymentGateway.findUnique({
    where: { provider: gatewayProvider },
  });

  if (
    !gateway ||
    gateway.isEnabled === false ||
    !gateway.apiKey ||
    !gateway.apiSecret
  ) {
    return errorResponse(
      `Gateway ${gatewayProvider} is not enabled or missing credentials.`,
      400
    );
  }

  // generate transaction reference & urls
  const transactionRef = `SARAGEA-${invoiceId.slice(0, 6)}-${Date.now()}`;
  const baseAppUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? '';
  if (!baseAppUrl) {
    return errorResponse('Server not configured with NEXTAUTH_URL / NEXT_PUBLIC_APP_URL', 500);
  }
  const callbackBaseUrl = `${baseAppUrl}/api/payments/webhook`;

  try {
    // ensure invoice exists and isn't paid
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      return errorResponse('Invoice not found.', 404);
    }

    if (invoice.status === 'PAID') {
      return errorResponse('Invoice already paid.', 400);
    }

    // persist the transactionRef on the invoice (so webhook/records can match)
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { transactionRef },
    });

    // Handle providers
    switch (gateway.provider) {
      case 'FLUTTERWAVE': {
        const url = 'https://api.flutterwave.com/v3/payments';
        const payload = {
          tx_ref: transactionRef,
          amount,
          currency: 'TZS',
          redirect_url: `${baseAppUrl}/dashboard?payment_status=success`,
          customer: {
            email: session.user.email,
            name: session.user.name ?? undefined,
          },
          meta: { invoice_id: invoiceId },
        };

        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${gateway.apiSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await resp.json().catch(() => null);
        if (!data || data.status !== 'success' || !data.data?.link) {
          const msg =
            (data && (data.message ?? data.status)) ||
            'Flutterwave initiation failed';
          throw new Error(String(msg));
        }

        return NextResponse.json({ redirectUrl: String(data.data.link) });
      }

      case 'SELCOM': {
        // Selcom expects signed parameters usually — this example builds a checkout URL
        // const timestamp = new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14);
        const order_id = transactionRef;

        const selcomUrl = new URL('https://checkout.selcommobile.com/v2/checkout');
        selcomUrl.searchParams.append('order_id', order_id);
        if (gateway.vendor) selcomUrl.searchParams.append('vendor', gateway.vendor);
        if (gateway.apiKey) selcomUrl.searchParams.append('api_key', gateway.apiKey);
        selcomUrl.searchParams.append('amount', String(amount));
        selcomUrl.searchParams.append('currency', 'TZS');
        selcomUrl.searchParams.append('redirect_url', `${baseAppUrl}/dashboard`);
        selcomUrl.searchParams.append('webhook_url', `${callbackBaseUrl}/selcom`);
        // NOTE: real integration may require signed params/digest using gateway.apiSecret

        return NextResponse.json({ redirectUrl: selcomUrl.toString() });
      }

      case 'PESAPAL': {
        // Pesapal v3 flow (example sandbox). Acquire token, submit order, return redirect url.
        const tokenUrl = 'https://cybqa.pesapal.com/pesapalv3/api/Auth/RequestToken';
        const tokenResp = await fetch(tokenUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            consumer_key: gateway.apiKey,
            consumer_secret: gateway.apiSecret,
          }),
        });

        const tokenData = await tokenResp.json().catch(() => null);
        const token = tokenData?.token;
        if (!token) {
          throw new Error(tokenData?.error?.message ?? 'Failed to obtain Pesapal token');
        }

        // NOTE: notification/ipn id should come from DB or gateway config
// Safely cast meta to object
        const meta: PaymentGatewayMeta = 
           typeof gateway.meta === 'object' && gateway.meta !== null
         ? (gateway.meta as PaymentGatewayMeta)
         : {};
        const ipn_id = meta.ipn_id ?? gateway.apiKey ?? 'IPN_ID_PLACEHOLDER';

        const pesapalPayload = {
          id: transactionRef,
          currency: 'TZS',
          amount,
          description: `Payment for Invoice #${invoiceId.slice(0, 6)}`,
          callback_url: `${baseAppUrl}/dashboard?pesapal_trx=${transactionRef}`,
          notification_id: ipn_id,
        };

        const orderResp = await fetch(
          'https://cybqa.pesapal.com/pesapalv3/api/SubmitOrderRequest',
          {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(pesapalPayload),
          }
        );

        const orderData = await orderResp.json().catch(() => null);
        // Pesapal returns status '1' for success in this example
        if (!orderData || (orderData.status !== '1' && !orderData.redirect_url)) {
          throw new Error(orderData?.error?.message ?? 'Pesapal order submission failed');
        }

        const redirectUrl = orderData.redirect_url ?? orderData?.data?.redirect_url;
        if (!redirectUrl) throw new Error('Pesapal did not return a redirect URL');

        return NextResponse.json({ redirectUrl: String(redirectUrl) });
      }

      case 'PAYCHANGU': {
        const url = 'https://api.paychangu.com/v1/checkout/create';
        const payload = {
          amount,
          currency: 'TZS',
          email: session.user.email,
          first_name: session.user.name?.split(' ')[0] ?? '',
          last_name: session.user.name?.split(' ').slice(1).join(' ') ?? '',
          tx_ref: transactionRef,
          webhook_url: `${callbackBaseUrl}/paychangu`,
          redirect_url: `${baseAppUrl}/dashboard?payment_status=success`,
        };

        const resp = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${gateway.apiSecret}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });

        const data = await resp.json().catch(() => null);
        if (!data || Number(data.status_code) !== 200) {
          throw new Error(data?.message ?? 'PayChangu payment initiation failed');
        }

        const checkoutUrl = data.data?.checkout_url ?? data.checkout_url;
        if (!checkoutUrl) throw new Error('PayChangu did not return a checkout URL');

        return NextResponse.json({ redirectUrl: String(checkoutUrl) });
      }

      default:
        return errorResponse('Payment provider not implemented', 501);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return errorResponse(message, 500);
  }
}
