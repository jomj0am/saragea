// app/(admin)/admin/vendors/page.tsx
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MailPlus, MoreHorizontal,   PhoneForwarded, TrendingUp, UserPen } from "lucide-react";
import NewVendorDialog from "@/components/admin/vendor/NewVendorDialog";
import DeleteVendorButton from "@/components/admin/vendor/DeleteVendorButton"; 
import { Toaster } from "sonner";
import { Nodata } from "../../../../../components/shared/Nodata";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { IconButton } from "@/components/admin/shared/IconButton";

async function getVendors() {
    return prisma.vendor.findMany({ orderBy: { name: 'asc' } });
}

export default async function VendorsPage() {
    const vendors = await getVendors();

    return (
        <div>
            <Toaster />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Manage Vendors</h1>
                <NewVendorDialog />
            </div>
            <div className="shadow-md  border bg-background">
                <Table>
                    <TableHeader className="bg-gray-100 dark:bg-gray-800">
                        <TableRow>
                            <TableHead className="">
                               <div className="flex items-center gap-2">
                                 <div className="h-8 w-12 my-2 relative flex bg-gradient-to-br from-slate-400 dark:from-slate-700 to-slate-900 dark:border-slate-700/30 border  rounded-full justify-center items-center"><UserPen className="text-pink-500 fill-pink-100"/> </div>Name
                              </div>
                            </TableHead>
                            <TableHead>
                                
                               <div className="flex items-center gap-1">
                                  <TrendingUp className="w-4 drop-shadow-sm dark:shadow-md fill-green-200 text-green-400 drop-shadow-black"/>    Trade
                              </div>
                             
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                  <PhoneForwarded className="w-4 drop-shadow-sm dark:shadow-md fill-indigo-100 text-indigo-400 drop-shadow-black"/>    Phone
                              </div>
                               
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-1">
                                  <MailPlus className="w-4 drop-shadow-sm dark:shadow-md fill-red-100 text-red-400 drop-shadow-black"/>   Email
                                </div>
                                
                            </TableHead>
                            <TableHead className="text-right"  >
                                <div className="flex gap-1 items-center justify-end">
                                  <MoreHorizontal className="w-4 drop-shadow-sm dark:shadow-md fill-orange-300 text-orange-500 drop-shadow-black"/>    Actions
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {vendors.length > 0 ? vendors.map(vendor => (
                            <TableRow key={vendor.id}>
                                <TableCell className="font-medium">
                                   <div className="flex items-center gap-2">
                                      <Avatar className="h-12 w-12">
                                          <AvatarFallback>{vendor.name?.charAt(0).toUpperCase()}</AvatarFallback>
                                      </Avatar>
                                      {vendor.name}

                                    </div>
                                </TableCell>
                                <TableCell>{vendor.trade}</TableCell>
                                <TableCell>{vendor.phone || 'N/A'}</TableCell>
                                <TableCell>{vendor.email || 'N/A'}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0 text-white"><IconButton > <MoreHorizontal className="h-4 w-4" /> </IconButton></Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <NewVendorDialog vendor={vendor} />
                                            <DeleteVendorButton vendorId={vendor.id} />
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        )) : (
                            <TableRow><TableCell colSpan={5} className="p-0 text-center">
                                                        <div className="text-center p-10 text-muted-foreground bg-gradient-to-br from-bg-slate-50 via-white to-slate-200 dark:from-gray-800/50 dark:via-gray-400/10 dark:to-gray-700/50">
                                                             <Nodata />
                                                             No vendors found. Add one to get started.
                                                        </div>
                                
                                </TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}