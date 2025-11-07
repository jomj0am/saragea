// components/admin/tenants/LeaseDetailsTab.tsx
import { type FullTenantDetails } from "@/app/[locale]/(admin)/admin/tenants/[id]/page";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { formatCurrency } from "@/lib/utils";

type LeaseDetailsTabProps = {
    leases: FullTenantDetails['leases'];
}

export default function LeaseDetailsTab({ leases }: LeaseDetailsTabProps) {
    if (leases.length === 0) return <p>This tenant has no lease history.</p>;

    const activeLease = leases.find(l => l.isActive);

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader><CardTitle>Active Lease Details</CardTitle></CardHeader>
                {activeLease ? (
                    <CardContent>
                        <p><strong>Start Date:</strong> {format(activeLease.startDate, 'PPP')}</p>
                        <p><strong>End Date:</strong> {format(activeLease.endDate, 'PPP')}</p>
                    </CardContent>
                ) : <CardContent><p>No active lease.</p></CardContent>}
            </Card>

            <Card>
                <CardHeader><CardTitle>Invoice History</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Paid On</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {leases.flatMap(l => l.invoices).map(invoice => (
                                <TableRow key={invoice.id}>
                                    <TableCell>{format(invoice.dueDate, 'PPP')}</TableCell>
                                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                                    <TableCell><Badge>{invoice.status}</Badge></TableCell>
                                    <TableCell>{invoice.payment ? format(invoice.payment.paymentDate, 'PPP') : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}