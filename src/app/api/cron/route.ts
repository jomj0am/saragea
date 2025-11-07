// app/api/cron/route.ts
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  addMonths,
  startOfMonth,
  isBefore,
  isSameDay,
  subDays,
  startOfDay,
  format,
} from 'date-fns';
import { Resend } from 'resend';

// ----------------- AUTOMATION TASKS -----------------

// KAZI 1: Kutengeneza Ankara Mpya
async function generateMonthlyInvoices() {
  console.log("CRON: Running 'generateMonthlyInvoices' task...");
  const today = new Date();
  const nextMonth = startOfMonth(addMonths(today, 1));

  const activeLeases = await prisma.lease.findMany({
    where: { isActive: true, endDate: { gte: today } },
    include: {
      room: true,
      invoices: { where: { dueDate: { gte: startOfMonth(today) } } },
    },
  });

  for (const lease of activeLeases) {
    const hasNextMonthInvoice = lease.invoices.some((inv) =>
      isSameDay(inv.dueDate, nextMonth),
    );

    if (!hasNextMonthInvoice && isBefore(lease.startDate, nextMonth)) {
      await prisma.invoice.create({
        data: {
          leaseId: lease.id,
          amount: lease.room.price,
          dueDate: nextMonth,
          status: 'DUE',
        },
      });
      console.log(`CRON: Generated invoice for lease ${lease.id}`);
    }
  }
}

// KAZI 2: Kusasisha Ankara Zilizochelewa na Kutuma Notisi
async function handleOverdueInvoicesAndReminders(resend: Resend) {
  console.log("CRON: Running 'handleOverdueInvoicesAndReminders' task...");
  const today = startOfDay(new Date());

  const dueInvoices = await prisma.invoice.findMany({
    where: { status: 'DUE' },
    include: { lease: { include: { tenant: true, room: true } } },
  });

  for (const invoice of dueInvoices) {
    const dueDate = startOfDay(invoice.dueDate);
    const fiveDaysBefore = subDays(dueDate, 5);

    // A. Tuma kikumbusho siku 5 kabla
    if (isSameDay(today, fiveDaysBefore)) {
      if (invoice.lease.tenant.email) {
        await resend.emails.send({
          from: 'SARAGEA APARTMENTS <noreply@saragea.com>', // swap for your verified domain
          to: [invoice.lease.tenant.email],
          subject: 'Gentle Rent Reminder',
          html: `<p>Hi ${invoice.lease.tenant.name}, this is a reminder that your rent of ${invoice.amount} for room ${invoice.lease.room.roomNumber} is due on ${format(
            invoice.dueDate,
            'PPP',
          )}.</p>`,
        });
        console.log(`CRON: Sent reminder to ${invoice.lease.tenant.name}`);
      }
    }

    // B. Weka status ya 'OVERDUE'
    if (isBefore(dueDate, today)) {
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' },
      });

      if (invoice.lease.tenant.email) {
        await resend.emails.send({
          from: 'SARAGEA APARTMENTS <noreply@saragea.com>',
          to: [invoice.lease.tenant.email],
          subject: 'URGENT: Your Rent is Overdue',
          html: `<p>Hi ${invoice.lease.tenant.name}, your rent payment is now overdue. Please make a payment as soon as possible to avoid further action.</p>`,
        });
        console.log(`CRON: Sent overdue notice to ${invoice.lease.tenant.name}`);
      }
    }
  }
}

// KAZI 3: Kufunga Mikataba Iliyoisha Muda
async function deactivateExpiredLeases() {
  console.log("CRON: Running 'deactivateExpiredLeases' task...");
  const today = new Date();
  await prisma.lease.updateMany({
    where: { isActive: true, endDate: { lt: today } },
    data: { isActive: false },
  });
  // Optional: Unaweza pia kubadilisha status ya chumba kuwa 'vacant' hapa
}

// ----------------- MAIN CRON JOB HANDLER -----------------
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  // ✅ Lazy-load the Resend client so we don't need the key at build time
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('CRON: Missing RESEND_API_KEY env variable');
    return NextResponse.json(
      { success: false, error: 'Missing RESEND_API_KEY' },
      { status: 500 },
    );
  }
  const resend = new Resend(apiKey);

  try {
    console.log('CRON: Job started at', new Date().toISOString());
    await generateMonthlyInvoices();
    await handleOverdueInvoicesAndReminders(resend);
    await deactivateExpiredLeases();
    console.log('CRON: Job finished successfully.');
    return NextResponse.json({
      success: true,
      message: 'Cron jobs completed.',
    });
  } catch (error) {
    console.error('CRON: A task failed:', error);
    return NextResponse.json(
      { success: false, error: 'A cron task failed' },
      { status: 500 },
    );
  }
}
