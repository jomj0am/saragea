// app/[locale]/(admin)/admin/maintenance/page.tsx
import { prisma } from "@/lib/prisma";
import MaintenanceClient from "./MaintenanceClient";
import { setRequestLocale } from "next-intl/server";

// Hii 'server-side' function sasa itaomba data yote inayohitajika na Client Component
async function getTickets() {
  return prisma.maintenanceTicket.findMany({
    include: {
      tenant: {
        select: {
          name: true,
          image: true, // Ni lazima tuombe 'image' hapa
        },
      },
      room: {
        include: {
          property: {
            select: { name: true }, // Tunahitaji 'name' tu
          },
        },
      },
      vendor: {
        select: {
          id: true, // Tunahitaji 'id' kwa 'defaultValues' za fomu
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function MaintenancePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  setRequestLocale(locale);
  const tickets = await getTickets();

  return <MaintenanceClient initialTickets={tickets} />;
}
