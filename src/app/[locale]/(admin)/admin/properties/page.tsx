// app/admin/properties/page.tsx
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import PropertyActions from "@/components/admin/poperties/PropertyActions";

// Lucide icons
import {
  MapPin,
  DoorClosed,
  Eye,
  Building2,
  MoreHorizontal,
} from "lucide-react";
import { Nodata } from "@/components/shared/Nodata";

// DB fetch
async function getProperties() {
  return prisma.property.findMany({
    include: { _count: { select: { rooms: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export default async function AdminPropertiesPage() {
  const properties = await getProperties();

  return (
    <section className="space-y-6 md:px-8">
      <Toaster />

           <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2 text-2xl md:text-3xl font-bold tracking-tight">
            <div className="relative bg-pink-100/90 rounded-sm shadow-lg shadow-indigo-500/80 dark:shadow-indigo-700 p-1">
                          <Building2 className="h-9 w-9 text-fuchsia-600 dark:text-fuchsia-500" />

            </div>
              <span>
                <h1>Manage Properties</h1>
                <p className="text-[16px] font-light text-muted-foreground">Track and manage all tenant-reported issues in real time.</p>

              </span>
        </div>
        <div className="justify-end flex sm:w-auto w-full ">
                         <PropertyActions />

        </div>
       
      </header>

      {/* Header */}


      {/* Table */}
      <div className="overflow-hidden rounded-x border border-border bg-gradient-to-b from-background to-muted/20 shadow-md dark:border-gray-700">
        <Table className="min-w-full">
          <TableHeader>
            <TableRow className="bg-muted/40 dark:bg-gray-800/60">
              <TableHead className=" flex items-center gap-4">
                <div className="w-20 h-6 rounded-md bg-gradient-to-br from-slate-600 to-slate-900"></div>
                <div className="flex items-center gap-2 font-semibold">
                  Property
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell w-1/4">
                <div className="flex items-center gap-2 font-semibold">
                  <MapPin className="h-4 w-4 drop-shadow-sm dark:shadow-md drop-shadow-black text-rose-500 fill-red-100" />
                  Location
                </div>
              </TableHead>
              <TableHead className="hidden md:table-cell text-center w-1/6">
                <div className="flex items-center justify-center gap-2 font-semibold">
                  <DoorClosed className="h-4 w-4 drop-shadow-sm dark:shadow-md drop-shadow-black text-emerald-500 fill-emerald-100" />
                  Rooms
                </div>
              </TableHead>
              <TableHead className="text-right w-1/4">
                                <div className="flex gap-1 items-center font-semibold justify-end">
                                  <MoreHorizontal className="w-4 drop-shadow-sm dark:shadow-md fill-orange-300 text-orange-500 drop-shadow-black"/>    Actions
                                </div>

              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {properties.map((prop) => (
              <TableRow
                key={prop.id}
                className="hover:bg-muted/20 dark:hover:bg-gray-800/60 transition-colors"
              >
                {/* Property preview + name */}
                <TableCell className="flex items-center gap-4">
                  <div className="relative h-14 w-20 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 dark:border-gray-700 shadow-sm">
                    <Image
                      src={prop.images?.[0] || "/placeholder.svg"}
                      alt={prop.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-medium truncate">{prop.name}</span>
                <span
    className="
      text-sm text-muted-foreground line-clamp-2
      max-w-20
      md:max-w-70 lg:max-w-80   /* remove limit once ≥ md */
    "
  >
    {prop.description || "—"}
  </span>
                  </div>
                </TableCell>

                {/* Location */}
                <TableCell className="hidden md:table-cell align-middle">
                  {prop.location}
                </TableCell>

                {/* Rooms */}
                <TableCell className="hidden md:table-cell text-center align-middle font-semibold text-emerald-600 dark:text-emerald-400">
                  {prop._count.rooms}
                </TableCell>

                {/* Actions */}
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/properties/${prop.id}`}>
                        <Eye className="mr-1 h-4 w-4" /> Manage
                      </Link>
                    </Button>
                    <PropertyActions property={prop} />
                  </div>
                </TableCell>
              </TableRow>
            ))}

            {/* Empty state */}
            {properties.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-muted-foreground"
                >
                  <Nodata/>
                  No properties yet. Click
                  <span className="mx-1 font-medium">“Add New Property”</span>
                  to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </section>
  );
}
