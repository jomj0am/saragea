"use client";

import { useState, useMemo } from "react";
import {
  Property,
  Room,
  User,
  Vendor,
  type MaintenanceTicket,
} from "@prisma/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import TicketStatusChanger from "@/components/admin/naintainance/TicketStatusChanger";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Wrench,
  Search,
  Filter,
  Calendar,
  Building2,
  Info,
  UserPen,
  MoreHorizontal,
  TrendingUp,
  PenTool,
  Pin,
} from "lucide-react";
import AssignVendorDialog from "@/components/admin/vendor/AssignVendorDialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Nodata } from "../../../../../components/shared/Nodata";

// ✅ FIX: Added "id" to Vendor Pick
type FullTicket = MaintenanceTicket & {
  tenant: Pick<User, "name" | "image">;
  room: Room & { property: Pick<Property, "name"> };
  vendor: Pick<Vendor, "name" | "id"> | null;
};

function statusVariant(status: string) {
  switch (status) {
    case "OPEN":
      return "destructive";
    case "IN_PROGRESS":
      return "default";
    case "RESOLVED":
      return "success";
    default:
      return "secondary";
  }
}

function formatDate(date: Date) {
  const now = new Date();
  const diff = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  if (diff < 7) return `${diff} days ago`;
  return date.toLocaleDateString();
}

export default function MaintenanceClient({
  initialTickets,
}: {
  initialTickets: FullTicket[];
}) {
  const [tickets] = useState(initialTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    if (!searchTerm) return tickets;
    return tickets.filter(
      (ticket) =>
        ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.tenant.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tickets]);

  return (
    <section className="  md:px-8 xl:p-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
          <div className="relative bg-yellow-50/90 rounded-sm shadow-lg shadow-orange-500/80 dark:shadow-orange-700 p-1">
            <Wrench className="h-9 w-9 text-amber-600 dark:text-amber-500" />
          </div>
          <span>
            <h1>Maintenance Tickets</h1>
            <p className="text-[16px] font-light text-muted-foreground">
              Track and manage all tenant-reported issues in real time.
            </p>
          </span>
        </div>
        <div className="justify-end flex sm:w-auto w-full ">
          <Button className="gap-2 w-fit md:w-auto">
            <Wrench className="h-4 w-4" /> New Ticket
          </Button>
        </div>
      </header>

      {/* Search + Filter */}
      <div className="flex  sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative  flex-1 max-w-md">
          <Search className="absolute drop-shadow-sm drop-shadow-black left-2.5 top-2.5 h-4 w-4  text-cyan-400/60 fill-cyan-100" />
          <Input
            placeholder="Search tickets..."
            className="pl-8 w-full rounded-full shadow-sm dark:border-slate-700/30"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          className="gap-2 dark:border-slate-700/30 rounded-full shadow-sm bg-gradient-to-br from-slate-200/20 to-slate-300 dark:from-slate-400 dark:to-slate-700"
        >
          <Filter className="h-4 w-4 fill-emerald-100 text-emerald-400" />{" "}
          Filter
        </Button>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block border  overflow-x-auto bg-white/90 dark:bg-gray-900/80 shadow-lg">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-100 dark:bg-gray-800">
              <TableHead>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-12 my-2 relative flex bg-gradient-to-br from-slate-400 dark:from-slate-700 to-slate-900 dark:border-slate-700/30 border  rounded-full justify-center items-center">
                    <UserPen className="text-pink-500 fill-pink-100" />{" "}
                  </div>
                  Tenant
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-indigo-500 fill-indigo-100" />
                  Room / Property
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  <PenTool className="w-4 drop-shadow-sm dark:shadow-md fill-fuchsia-200 text-fuchsia-400 drop-shadow-black" />{" "}
                  Title
                </div>
              </TableHead>
              <TableHead>Vendor</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-4 drop-shadow-sm dark:shadow-md fill-green-200 text-green-400 drop-shadow-black" />{" "}
                  Status
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-2  pr-2">
                  <Calendar className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-yellow-500 fill-yellow-100" />
                  Date
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
            {filteredTickets.map((ticket, i) => (
              <TableRow
                key={ticket.id}
                className={`transition-colors ${i % 2 === 0 ? "bg-background" : "bg-muted/20"} hover:bg-muted/40`}
              >
                <TableCell className="font-medium flex gap-2 items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={ticket.tenant.image || undefined}
                        alt={ticket.tenant.name?.charAt(0).toUpperCase()}
                      />
                      <AvatarFallback>
                        {ticket.tenant.name?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  {ticket.tenant.name}
                </TableCell>
                <TableCell>
                  <span className="mr-1">{ticket.room.roomNumber}</span>
                </TableCell>
                <TableCell className="max-w-[20rem] truncate">
                  {ticket.title}
                </TableCell>
                <TableCell>
                  {ticket.vendor?.name ?? (
                    <span className="text-muted-foreground italic">
                      Unassigned
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={statusVariant(ticket.status)}
                    className="capitalize"
                  >
                    {ticket.status.replace("_", " ").toLowerCase()}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {formatDate(new Date(ticket.createdAt))}
                </TableCell>
                <TableCell className="flex gap-2 justify-end">
                  <AssignVendorDialog ticket={ticket} />
                  <TicketStatusChanger ticket={ticket} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {filteredTickets.length === 0 && (
          <div className="text-center p-10 text-muted-foreground bg-gradient-to-br from-bg-slate-50 via-white to-slate-200 dark:from-gray-800/50 dark:via-gray-400/10 dark:to-gray-700/50">
            <Nodata />
            No Maintainance ticket Found
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {filteredTickets.map((ticket) => {
          const isOpen = expanded === ticket.id;
          return (
            <div
              key={ticket.id}
              className=" border shadow-md p-4 bg-white/90 dark:bg-gray-900/80"
            >
              <div className="flex justify-between items-start">
                <div className="flex flex-col w-full gap-1">
                  <div className="text-sm text-muted-foreground justify-between w-full  flex items-center ">
                    <div className="flex gap-2">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={ticket.tenant.image || undefined}
                          alt={ticket.tenant.name?.charAt(0).toUpperCase()}
                        />
                        <AvatarFallback>
                          {ticket.tenant.name?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className=" ">
                        {ticket.tenant.name}
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="w-3 h-3" />{" "}
                          {formatDate(new Date(ticket.createdAt))}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={statusVariant(ticket.status)}
                      className="capitalize w-max mr-2"
                    >
                      {ticket.status.replace("_", " ").toLowerCase()}
                    </Badge>
                  </div>
                  <h2 className="font-semibold mt-1 border-t pt-2 line-clamp-2 flex items-center">
                    <Pin className="w-5 h-5 text-red-200 fill-red-500 mr-2" />
                    {ticket.title}
                  </h2>
                </div>
                <button
                  onClick={() => setExpanded(isOpen ? null : ticket.id)}
                  className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 self-start"
                >
                  {isOpen ? "▲" : "▼"}
                </button>
              </div>

              {isOpen && (
                <div className="mt-3 space-y-2 border-t p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg ">
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="w-4 h-4" /> Room{" "}
                    {ticket.room.roomNumber}
                  </p>

                  <p className="text-sm text-muted-foreground flex items-center  gap-1">
                    <Wrench className="w-4 h-4" />
                    Vendor: {ticket.vendor?.name ?? "Unassigned"}
                  </p>
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-pink-500" />
                    <p className="line-clamp-3 text-muted-foreground">
                      {ticket.description ?? "No additional info"}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <AssignVendorDialog ticket={ticket} />
                    <TicketStatusChanger ticket={ticket} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filteredTickets.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            No tickets yet. Tap &quot;New Ticket&quot; to get started.
          </div>
        )}
      </div>
    </section>
  );
}
