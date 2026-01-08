// app/admin/tenants/page.tsx
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import AssignPropertyDialog from "@/components/admin/poperties/AssignPropertyDialog";
import { Toaster } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Eye,
  MailPlus,
  MoreHorizontal,
  TrendingUp,
  UserPen,
  UserPenIcon,
  UserPlus,
} from "lucide-react";
import { Nodata } from "../../../../../components/shared/Nodata";
import { Link } from "@/i18n/navigation";
import { Prisma } from "@prisma/client";
import TableToolbar from "@/components/admin/shared/TableToolbar";

// ============================
// Helpers
// ============================

// Helper types
type TenantWithDetails = Prisma.UserGetPayload<{
  include: {
    leases: {
      where: { isActive: true };
      include: { room: { include: { property: true } }; invoices: true };
    };
  };
}>;
type LeaseWithInvoices = TenantWithDetails["leases"];

// Fetch tenants
async function getTenants(query: string) {
  const where: Prisma.UserWhereInput = { role: "TENANT" };
  if (query) {
    where.OR = [
      { name: { contains: query, mode: "insensitive" } },
      { email: { contains: query, mode: "insensitive" } },
    ];
  }

  return prisma.user.findMany({
    where,
    include: {
      leases: {
        where: { isActive: true },
        include: { room: { include: { property: true } }, invoices: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

// Tenant status
function getTenantStatus(leases: LeaseWithInvoices) {
  if (!leases || leases.length === 0)
    return { text: "No Active Lease", variant: "secondary" as const };

  const invoices = leases.flatMap((l) => l.invoices || []);
  if (invoices.some((inv) => inv.status === "OVERDUE"))
    return { text: "Overdue", variant: "destructive" as const };
  if (invoices.some((inv) => inv.status === "DUE"))
    return { text: "Payment Due", variant: "default" as const };
  return { text: "All Paid", variant: "success" as const };
}

interface SearchParams {
  q?: string | string[];
}

// Page component
export default async function AdminTenantsPage(props: {
  searchParams: Promise<SearchParams> | undefined;
}) {
  const searchParams = await props.searchParams;
  const query = Array.isArray(searchParams?.q)
    ? searchParams.q[0]
    : (searchParams?.q ?? "");

  const tenants = await getTenants(query);

  return (
    <div className="md:p-8 xl:p-12 space-y-6">
      <Toaster richColors position="top-right" />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
          <div className="relative bg-pink-100/80 rounded-sm shadow-lg shadow-red-500/80 dark:shadow-red-700/80 p-1">
            <UserPenIcon className="h-9 w-9 text-red-600 dark:text-red-400" />
          </div>
          <span>
            <h1>Tenant Management</h1>
            <p className="text-[17px] font-light text-muted-foreground">
              Manage tenants, leases, and invoices all in one place.
            </p>
          </span>
        </div>
        <div className="justify-end flex sm:w-auto w-full ">
          <Button className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Tenant
          </Button>
        </div>
      </div>

      {/* Search + Filter Bar */}
      <TableToolbar searchPlaceholder="Search tenants by name or email..." />

      {/* Table */}
      <div className="overflow-hidden  border bg-background shadow-lg dark:shadow-blue-950/30">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow className="bg-muted/50">
              <TableHead>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 my-2 relative flex bg-gradient-to-br from-slate-400 dark:from-slate-700 to-slate-900 dark:border-slate-700/30 border  rounded-full justify-center items-center">
                    <UserPen className="text-pink-500 fill-pink-100" />{" "}
                  </div>
                  Name
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <div className="flex items-center gap-1">
                  <MailPlus className="w-4 drop-shadow-sm dark:shadow-md fill-red-100 text-red-400 drop-shadow-black" />{" "}
                  Email
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                Active Lease
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 drop-shadow-sm dark:shadow-md fill-green-200 text-green-400 drop-shadow-black" />{" "}
                  Status
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex gap-1 items-center justify-end">
                  <MoreHorizontal className="w-4 drop-shadow-sm dark:shadow-md fill-orange-300 text-orange-500 drop-shadow-black" />{" "}
                  Actions
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tenants.map((tenant, i) => {
              const status = getTenantStatus(tenant.leases);

              return (
                <TableRow
                  key={tenant.id}
                  className={
                    i % 2 === 0
                      ? "bg-background"
                      : "bg-muted/30 hover:bg-muted/50"
                  }
                >
                  {/* Tenant */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={tenant.image || undefined}
                          alt={tenant.name?.charAt(0).toUpperCase()}
                        />
                        <AvatarFallback>
                          {tenant.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{tenant.name}</span>
                    </div>
                  </TableCell>

                  {/* Email */}
                  <TableCell className="text-muted-foreground hidden md:table-cell">
                    {tenant.email}
                  </TableCell>

                  {/* Lease Info */}
                  <TableCell className="hidden md:table-cell">
                    {tenant.leases?.length > 0 ? (
                      tenant.leases.map((lease) => (
                        <div key={lease.id} className="text-sm">
                          <span className="font-semibold">
                            {lease.room.roomNumber}
                          </span>{" "}
                          <span className="text-muted-foreground">
                            at {lease.room.property.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-muted-foreground">
                        No active lease
                      </span>
                    )}
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <Badge variant={status.variant}>{status.text}</Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right gap-2 ">
                    <div className="items-center flex gap-2 justify-end">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/admin/tenants/${tenant.id}`}>
                          <Eye className="mr-1 h-4 w-4" /> Manage
                        </Link>
                      </Button>
                      <div className="hidden md:block">
                        <AssignPropertyDialog tenant={tenant} />
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        {tenants.length === 0 && (
          <div className="text-center p-10 text-muted-foreground bg-gradient-to-br from-bg-slate-50 via-white to-slate-200 dark:from-gray-800/50 dark:via-gray-400/10 dark:to-gray-700/50">
            <Nodata />
            No Tenants have Registed yet.
          </div>
        )}
      </div>
    </div>
  );
}
