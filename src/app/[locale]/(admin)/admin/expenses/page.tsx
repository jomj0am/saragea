// app/(admin)/admin/expenses/page.tsx
import { prisma } from "@/lib/prisma";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import NewExpenseDialog from "@/components/admin/NewExpenseDialog"; 
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { Calendar, File, ImageIcon,  Layers2, Receipt,  } from "lucide-react";
import { Nodata } from "../../../../../components/shared/Nodata";

async function getExpenses() {
    return prisma.expense.findMany({
        include: { property: { select: { name: true,images: true } } },
        orderBy: { expenseDate: 'desc' },
    });
}

export default async function ExpensesPage() {
    const expenses = await getExpenses();

    return (
        <div>
            <Toaster />
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold">Manage Expenses</h1>
                <NewExpenseDialog />
            </div>
            <div className="shadow-lg border bg-background">
                <Table>
                    <TableHeader className="bg-gray-100 dark:bg-gray-800">
                        <TableRow>
                            <TableHead className="flex items-center gap-2">
                                <div className="w-20 h-8 bg-gray-600 to-gray-300/50 dark:bg-gray-950 bg-gradient-to-br dark:from-gray-600/40  relative rounded-sm items-center justify-center text-center">
                                        <ImageIcon className="mx-auto pt-1 text-cyan-300 fill-emerald-500/20"/>
                                 </div>
                                Property
                                </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-emerald-500 fill-emerald-100"/>Date
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <Layers2 className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-yellow-500 fill-yellow-100"/>Category
                                </div>
                            </TableHead>
                            <TableHead>
                                <div className="flex items-center gap-2">
                                    <File className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-blue-500 fill-blue-100"/> Description
                                </div>
                            </TableHead>
                            <TableHead className="text-right">
                                <div className="flex items-center gap-2 justify-end">
                                    <Receipt className="w-4 drop-shadow-sm dark:drop-shadow-md drop-shadow-black/80 text-red-500 fill-red-100"/>Amount
                                </div>
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {expenses.map(expense => (
                            <TableRow key={expense.id}>
                                <TableCell className="flex gap-2">
                                    <div className="w-20 h-14 bg-gray-800 rounded-sm">
                                        {/* <Image src={expense.property?.images.[0]}  fill alt={expense.property?.name || 'undefined'} /> */}
                                    </div>
                                    {expense.property?.name || 'General'}
                                </TableCell>
                                <TableCell>{format(expense.expenseDate, 'PPP')}</TableCell>
                                <TableCell>{expense.category}</TableCell>
                                <TableCell>{expense.description}</TableCell>
                                <TableCell className="text-right font-medium">{formatCurrency(expense.amount)}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                        {expenses.length === 0 && (
                                        <div className="text-center p-10 text-muted-foreground bg-gradient-to-br from-bg-slate-50 via-white to-slate-200 dark:from-gray-800/50 dark:via-gray-400/10 dark:to-gray-700/50">
                                             <Nodata />
                                             No Expenses Record Found
                                        </div>
                                      )}
            </div>
        </div>
    );
}