import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import DashboardClient from "@/components/tenant/DashboardClient"; // We will create this

async function getTenantData(userId: string) {
  const activeLease = await prisma.lease.findFirst({
    where: { tenantId: userId, isActive: true },
    include: { room: { include: { property: true } } },
  });

  const tickets = await prisma.maintenanceTicket.findMany({
    where: { tenantId: userId },
    orderBy: { createdAt: "desc" },
  });

  const invoices = await prisma.invoice.findMany({
    where: { lease: { tenantId: userId } },
    include: { lease: { include: { room: true } } },
    orderBy: { dueDate: "desc" },
  });

  return {
    activeLease,
    tickets,
    invoices: JSON.parse(JSON.stringify(invoices)), // Serializable date fix if needed
  };
}

// Accept searchParams for payment success/fail messages
export default async function TenantDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ payment_status?: string }>;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect(`/login?callbackUrl=/dashboard`);
  }

  const data = await getTenantData(session.user.id);
  const params = await searchParams;

  return (
    <DashboardClient
      user={session.user}
      data={data}
      paymentStatus={params.payment_status}
    />
  );
}
