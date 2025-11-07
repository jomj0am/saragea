// app/(main)/dashboard/page.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/auth-options";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import TicketList from "@/components/tenant/TicketList"; // Tutatengeneza hii
import NewTicketDialog from "@/components/tenant/NewTicketDialog"; // Na hii
import PaymentDialog from "@/components/tenant/PaymentDialog"; // Tutatengeneza hii
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Download } from "lucide-react";
import ContactAdminButton from "@/components/tenant/ContactAdminButton"; // Komponenti mpya
import { redirect } from "next/navigation";

async function getTenantData(userId: string) {
    // Pata mkataba unaoendelea wa mpangaji
    const activeLease = await prisma.lease.findFirst({
        where: { tenantId: userId, isActive: true },
        include: { room: { include: { property: true } } },
    });

    // Pata tiketi zake zote
    const tickets = await prisma.maintenanceTicket.findMany({
        where: { tenantId: userId },
        orderBy: { createdAt: 'desc' },
    });

    const invoices = await prisma.invoice.findMany({
        where: { lease: { tenantId: userId } },
        include: { lease: { include: { room: true } } },
        orderBy: { dueDate: 'desc' },
    });

    const dueInvoices = invoices.filter(inv => inv.status === 'DUE' || inv.status === 'OVERDUE');
    const paidInvoices = invoices.filter(inv => inv.status === 'PAID');


    return { activeLease, tickets, dueInvoices, paidInvoices  };
}

export default async function TenantDashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
        redirect(`/login?callbackUrl=/dashboard`); // Itachukua 'locale' kiotomatiki
    }
    
    
    const { activeLease, tickets,dueInvoices, paidInvoices } = await getTenantData(session.user.id);

    
    return (
        <div className="container mx-auto px-4 py-12 space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold">Welcome, {session?.user?.name}!</h1>
                    <p className="text-muted-foreground">Manage your lease, payments, and maintenance requests.</p>
                </div>
                {/* Kitufe kipya hapa */}
                <ContactAdminButton />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold">My Maintenance Requests</h2>
                        {activeLease && <NewTicketDialog lease={activeLease} />}
                    </div>
                    <TicketList tickets={tickets} />
                </div>
                <div>
                    {activeLease ? (
                        <div className="p-6 rounded-lg bg-secondary">
                            <h3 className="text-xl font-semibold">My Current Residence</h3>
                            <p className="mt-2 font-bold">{activeLease.room.property.name}</p>
                            <p className="text-muted-foreground">Room: {activeLease.room.roomNumber}</p>
                            <Button className="w-full mt-4">Pay Rent</Button>
                        </div>
                    ) : (
                         <p>You have no active lease.</p>
                    )}
                </div>
            </div>

                        {/* Sehemu ya Ankara Zinazodaiwa */}
            <Card>
                <CardHeader>
                    <CardTitle>Invoices Due</CardTitle>
                    <CardDescription>Please pay for the following invoices to keep your account in good standing.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Due Date</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {dueInvoices.length > 0 ? dueInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{format(invoice.dueDate, 'PPP')}</TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell><Badge variant={invoice.status === 'OVERDUE' ? 'destructive' : 'default'}>{invoice.status}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <PaymentDialog invoice={invoice} />
                                    </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={4} className="text-center">You have no pending invoices. Well done!</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

                        {/* Sehemu ya Historia ya Malipo */}
            <Card>
                <CardHeader><CardTitle>Payment History</CardTitle><CardDescription>A record of all your past payments.</CardDescription></CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader><TableRow><TableHead>Paid Date</TableHead><TableHead>Amount</TableHead><TableHead>For Invoice Due</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {paidInvoices.length > 0 ? paidInvoices.map(invoice => (
                                <TableRow key={invoice.id}>
                                    {/* Hapa tungepata tarehe halisi ya malipo kutoka 'payment' relation */}
                                    <TableCell>{/* {format(invoice.payment.paymentDate, 'PPP')} */}</TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell>{format(invoice.dueDate, 'PPP')}</TableCell>
                        <TableCell className="text-right">
                            <Button asChild variant="outline" size="sm">
                                {/* Hii ndiyo link itakayoita API yetu */}
                                <Link href={`/api/receipts/${invoice.paymentId}`} target="_blank">
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Receipt
                                </Link>
                            </Button>
                        </TableCell>
                                </TableRow>
                            )) : <TableRow><TableCell colSpan={3} className="text-center">No payment history found.</TableCell></TableRow>}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}