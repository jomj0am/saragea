import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/profile");
  }

  // 1. Fetch User and basic counts
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      leases: {
        where: { isActive: true },
        include: { room: { include: { property: true } } },
      },
      _count: {
        select: {
          maintenanceTickets: true,
          // Removed 'invoices' from here because it's not a direct relation
        },
      },
    },
  });

  if (!user) {
    redirect("/api/auth/signout");
  }

  // 2. Fetch Invoice Count Separately (Correct way)
  // We count invoices where the invoice's lease belongs to this tenant
  const invoiceCount = await prisma.invoice.count({
    where: {
      lease: {
        tenantId: user.id,
      },
    },
  });

  // 3. Construct the data object for the client
  // We attach the invoice count manually to match the expected prop structure
  const userWithCounts = {
    ...user,
    _count: {
      ...user._count,
      invoices: invoiceCount,
    },
  };

  return <ProfileClient user={userWithCounts} />;
}
