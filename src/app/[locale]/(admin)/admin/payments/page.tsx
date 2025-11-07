// app/[locale]/(admin)/admin/payments/page.tsx
import { prisma } from "@/lib/prisma";
import { InvoiceStatus, Prisma } from "@prisma/client";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import RecordPaymentDialog from "@/components/admin/RecordPaymentDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TableToolbar from "@/components/admin/shared/TableToolbar";
import { Toaster } from "sonner";
import { Nodata } from "../../../../../components/shared/Nodata";
import {
  Calendar,
  Receipt,
  TrendingUp,
  UserPen,
  Wallet,
} from "lucide-react";

// Types
type InvoiceWithDetails = Prisma.InvoiceGetPayload<{
  include: {
    lease: { include: { tenant: true; room: { include: { property: true } } } };
    payment: true;
  };
}>;

interface PaymentsPageProps {
  searchParams?: Promise<{ q?: string; status?: string }>;
}

// Utility to map status → badge variant
const getStatusVariant = (status: string) => {
  switch (status) {
    case "PAID":
      return "success";
    case "OVERDUE":
      return "destructive";
    case "DUE":
      return "default";
    default:
      return "secondary";
  }
};

// Fetch invoices
async function getInvoices(
  searchParams: { q?: string; status?: string }
): Promise<InvoiceWithDetails[]> {
  const query = searchParams.q ?? "";
  const statusParam = searchParams.status ?? "";

  const where: Prisma.InvoiceWhereInput = {};
  const andConditions: Prisma.InvoiceWhereInput[] = [];

  if (query) {
    andConditions.push({
      lease: {
        tenant: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
      },
    });
  }

  if (statusParam && statusParam !== "all") {
    const isValidStatus = Object.values(InvoiceStatus).includes(
      statusParam as InvoiceStatus
    );
    if (isValidStatus) {
      andConditions.push({ status: statusParam as InvoiceStatus });
    }
  }

  if (andConditions.length > 0) {
    where.AND = andConditions;
  }

  return prisma.invoice.findMany({
    where,
    include: {
      lease: {
        include: { tenant: true, room: { include: { property: true } } },
      },
      payment: true,
    },
    orderBy: { dueDate: "desc" },
  });
}

// ✅ Main page component
export default async function AdminPaymentsPage({ searchParams }: PaymentsPageProps) {
  // Await searchParams first
  const awaitedParams = await searchParams ?? {};
  const invoices = await getInvoices(awaitedParams);

  const unpaidInvoices = await prisma.invoice.findMany({
    where: { status: { in: ["DUE", "OVERDUE"] } },
    include: { lease: { include: { tenant: true } } },
  });

  return (
    <div>
      <Toaster />
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
          <div className="relative bg-cyan-100/90 rounded-sm shadow-lg shadow-blue-500 dark:shadow-blue-700 p-1">
            <Wallet className="h-9 w-9 text-indigo-600 dark:text-indigo-400" />
          </div>
          <span>
            <h1>Financials & Invoices</h1>
            <p className="text-sm font-light text-muted-foreground">
              Manage all Payments and Invoices
            </p>
          </span>
        </div>
        <div className="justify-end flex sm:w-auto w-full ">
          <RecordPaymentDialog unpaidInvoices={unpaidInvoices} />
        </div>
      </div>

      {/* Filters */}
      <TableToolbar
        searchPlaceholder="Search by tenant name or email..."
        filterOptions={{
          placeholder: "Filter by status...",
          paramName: "status",
          options: [
            { value: "DUE", label: "Due" },
            { value: "PAID", label: "Paid" },
            { value: "OVERDUE", label: "Overdue" },
          ],
        }}
      />

      {/* Table */}
      <div className="border bg-background shadow-md">
        <Table>
          <TableHeader className="bg-gray-100 dark:bg-gray-800">
            <TableRow>
              <TableHead>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-12 my-2 relative flex bg-gradient-to-br from-slate-400 dark:from-slate-700 to-slate-900 dark:border-slate-700/30 border rounded-full justify-center items-center">
                    <UserPen className="text-pink-500 fill-pink-100" />
                  </div>
                  tenant
                </div>
              </TableHead>
              <TableHead>Property / Room</TableHead>
              <TableHead>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 text-red-500 fill-red-100" />
                  Due Date
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 fill-green-200 text-green-400" />
                  Status
                </div>
              </TableHead>
              <TableHead className="text-right">
                <div className="flex items-center gap-1">
                  <Receipt className="w-4 fill-yellow-100 text-yellow-500" />
                  Amount
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2 justify-end pr-2">
                  <Calendar className="w-4 text-emerald-500 fill-emerald-100" />
                  Payment Date
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.lease.tenant.name}
                </TableCell>
                <TableCell>
                  {invoice.lease.room.property.name} /{" "}
                  {invoice.lease.room.roomNumber}
                </TableCell>
                <TableCell>{format(invoice.dueDate, "PPP")}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  {formatCurrency(invoice.amount)}
                </TableCell>
                <TableCell>
                  {invoice.payment
                    ? format(invoice.payment.paymentDate, "PPP")
                    : "N/A"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {invoices.length === 0 && (
          <div className="text-center p-10 text-muted-foreground bg-gradient-to-br from-slate-50 via-white to-slate-200 dark:from-gray-800/50 dark:via-gray-400/10 dark:to-gray-700/50">
            <Nodata />
            No Payment Record Found.
          </div>
        )}
      </div>
    </div>
  );
}
