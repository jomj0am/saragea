import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Mail,
  Home,
  MessageSquare,
  Calendar,
  Shield,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import LeaseDetailsTab from "@/components/admin/tenants/LeaseDetailsTab";
import DocumentsTab from "@/components/admin/tenants/DocumentsTab";
import MaintenanceTab from "@/components/admin/tenants/MaintenanceTab";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { ComponentType } from "react";

export type FullTenantDetails = Prisma.UserGetPayload<{
  include: {
    leases: {
      include: {
        room: { include: { property: true } };
        invoices: {
          orderBy: { dueDate: "desc" };
          include: { payment: true };
        };
      };
      orderBy: { startDate: "desc" };
    };
    documents: { orderBy: { createdAt: "desc" } };
    maintenanceTickets: { orderBy: { createdAt: "desc" } };
  };
}>;

async function getTenantDetails(id: string): Promise<FullTenantDetails | null> {
  return prisma.user.findUnique({
    where: { id, role: "TENANT" },
    include: {
      leases: {
        include: {
          room: { include: { property: true } },
          invoices: {
            orderBy: { dueDate: "desc" },
            include: { payment: true },
          },
        },
        orderBy: { startDate: "desc" },
      },
      documents: { orderBy: { createdAt: "desc" } },
      maintenanceTickets: { orderBy: { createdAt: "desc" } },
    },
  });
}

interface LocaleLayoutProps {
  params: Promise<{ id: string }>;
}

export default async function TenantProfilePage({ params }: LocaleLayoutProps) {
  const awaitedParams = await params;

  const [tenant] = await Promise.all([
    getTenantDetails(awaitedParams.id),
    getServerSession(authOptions),
  ]);

  if (!tenant) {
    notFound();
  }

  const activeLease = tenant.leases.find((l) => l.isActive);

  // Calculate Financial Health
  const allInvoices = tenant.leases.flatMap((l) => l.invoices);
  const overdueInvoices = allInvoices.filter(
    (i) => i.status === "OVERDUE"
  ).length;
  const totalPaid = allInvoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.amount, 0);

  const accountStatus = overdueInvoices > 0 ? "Overdue" : "Good Standing";
  const statusColor = overdueInvoices > 0 ? "bg-red-500" : "bg-emerald-500";

  return (
    <div className="space-y-8 pb-10 xl:p-12 md:p-8">
      {/* 1. Immersive Hero Profile Header */}
      <div className="relative rounded-3xl overflow-hidden bg-zinc-900 shadow-2xl">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 opacity-90" />
        <div className="absolute inset-0 bg-[url('/assets/patterns/grid.jpg')] opacity-10 mix-blend-overlay" />

        {/* Content Container */}
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-end">
          {/* Avatar Group */}
          <div className="relative">
            <div
              className={`absolute -inset-1 rounded-full blur opacity-50 ${statusColor}`}
            />
            <Avatar className="h-32 w-32 border-4 border-white/10 shadow-2xl relative">
              <AvatarImage
                src={tenant.image || undefined}
                className="object-cover"
              />
              <AvatarFallback className="text-4xl font-bold bg-white text-indigo-900">
                {tenant.name?.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div
              className={`absolute bottom-2 right-2 h-6 w-6 rounded-full border-4 border-zinc-900 ${statusColor}`}
              title={accountStatus}
            />
          </div>

          {/* Text Info */}
          <div className="flex-grow text-white space-y-3 mb-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-4xl font-black tracking-tight">
                {tenant.name}
              </h1>
              <Badge
                variant="secondary"
                className="bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md"
              >
                {accountStatus}
              </Badge>
            </div>

            <div className="flex flex-wrap gap-x-6 gap-y-2 text-indigo-100/80 text-sm font-medium">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" /> {tenant.email}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" /> Joined{" "}
                {format(tenant.createdAt, "MMM yyyy")}
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4" /> Tenant ID:{" "}
                {tenant.id.slice(-6).toUpperCase()}
              </div>
            </div>

            {/* Current Residence Pill */}
            {activeLease && (
              <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 rounded-full px-4 py-1.5 mt-2 backdrop-blur-sm">
                <Home className="h-3.5 w-3.5 text-indigo-300" />
                <span className="text-sm font-semibold text-indigo-100">
                  <Link
                    href={`/admin/properties/${activeLease.room.property.id}`}
                    className="hover:underline hover:text-white transition-colors"
                  >
                    {activeLease.room.property.name}
                  </Link>
                  <span className="opacity-60 mx-1">•</span>
                  Room {activeLease.room.roomNumber}
                </span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 w-full md:w-auto">
            {/* We use a simple link to messages with query param, reused logic */}
            <Button
              asChild
              className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-lg font-bold rounded-full flex-1 md:flex-none"
            >
              <Link href={`/admin/messages?startWith=${tenant.id}`}>
                <MessageSquare className="mr-2 h-4 w-4" /> Message
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* 2. Key Statistics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Lifetime Value"
          value={formatCurrency(totalPaid)}
          icon={CreditCard}
          color="text-emerald-500"
          bg="bg-emerald-500/10"
        />
        <StatCard
          label="Active Issues"
          value={String(
            tenant.maintenanceTickets.filter(
              (t) => t.status !== "RESOLVED" && t.status !== "CLOSED"
            ).length
          )}
          icon={AlertTriangle}
          color="text-orange-500"
          bg="bg-orange-500/10"
        />
        <StatCard
          label="Total Leases"
          value={String(tenant.leases.length)}
          icon={Home}
          color="text-blue-500"
          bg="bg-blue-500/10"
        />
        <StatCard
          label="Standing"
          value={overdueInvoices > 0 ? "Action Needed" : "Excellent"}
          icon={CheckCircle2}
          color={overdueInvoices > 0 ? "text-red-500" : "text-indigo-500"}
          bg={overdueInvoices > 0 ? "bg-red-500/10" : "bg-indigo-500/10"}
        />
      </div>

      {/* 3. Main Content Tabs */}
      <div className="bg-card rounded-3xl border shadow-sm overflow-hidden">
        <Tabs defaultValue="lease" className="w-full">
          <div className="border-b px-6 py-4 bg-muted/30">
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="lease" className="px-6 rounded-md">
                Lease & Financials
              </TabsTrigger>
              <TabsTrigger value="documents" className="px-6 rounded-md">
                Documents ({tenant.documents.length})
              </TabsTrigger>
              <TabsTrigger value="maintenance" className="px-6 rounded-md">
                Maintenance ({tenant.maintenanceTickets.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 md:p-8">
            <TabsContent value="lease" className="mt-0 focus-visible:ring-0">
              <LeaseDetailsTab leases={tenant.leases} />
            </TabsContent>

            <TabsContent
              value="documents"
              className="mt-0 focus-visible:ring-0"
            >
              <DocumentsTab documents={tenant.documents} />
            </TabsContent>

            <TabsContent
              value="maintenance"
              className="mt-0 focus-visible:ring-0"
            >
              <MaintenanceTab tickets={tenant.maintenanceTickets} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}

type StatCardProps = {
  label: string;
  value: string;
  icon: ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};

function StatCard({ label, value, icon: Icon, color, bg }: StatCardProps) {
  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${bg}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
