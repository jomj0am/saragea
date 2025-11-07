// components/admin/tenants/MaintenanceTab.tsx
import { type FullTenantDetails } from "@/app/[locale]/(admin)/admin/tenants/[id]/page";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { formatDistanceToNowStrict } from "date-fns";
import { type VariantProps } from "class-variance-authority";
import { Nodata } from "@/components/shared/Nodata";

type MaintenanceTabProps = {
    tickets: FullTenantDetails['maintenanceTickets'];
}

// Function ya ku-map status na variant ya Badge
function statusVariant(status: string): VariantProps<typeof badgeVariants>["variant"] {
  switch (status) {
    case "OPEN": return "destructive";
    case "IN_PROGRESS": return "default";
    case "RESOLVED": return "success";
    default: return "secondary";
  }
}

function formatDate(date: Date): string {
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

export default function MaintenanceTab({ tickets }: MaintenanceTabProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Maintenance History</CardTitle>
                <CardDescription>
                    A log of all maintenance requests submitted by this tenant.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-lg border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Issue / Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Reported</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tickets.length > 0 ? (
                                tickets.map(ticket => (
                                    <TableRow key={ticket.id}>
                                        <TableCell className="font-medium max-w-sm truncate">{ticket.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={statusVariant(ticket.status)} className="capitalize">
                                                {ticket.status.replace('_', ' ').toLowerCase()}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{formatDate(new Date(ticket.createdAt))}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="h-48 text-center">
                                        <Nodata />
                                        <p className="mt-4 font-semibold">No Maintenance History</p>
                                        <p className="text-sm text-muted-foreground">This tenant has not submitted any maintenance tickets.</p>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}