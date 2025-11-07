// components/tenant/TicketList.tsx
import { type MaintenanceTicket } from "@prisma/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface TicketListProps {
    tickets: MaintenanceTicket[];
}

// Function to map status to badge variant
const getStatusVariant = (status: string) => {
    switch (status) {
        case 'OPEN':
            return 'default';
        case 'IN_PROGRESS':
            return 'secondary';
        case 'RESOLVED':
            return 'outline';
        case 'CLOSED':
            return 'destructive';
        default:
            return 'default';
    }
};

export default function TicketList({ tickets }: TicketListProps) {
    if (tickets.length === 0) {
        return (
            <div className="text-center p-10 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">You have not submitted any maintenance requests yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {tickets.map((ticket) => (
                <Card key={ticket.id}>
                    <CardHeader>
                        <div className="flex justify-between items-start">
                            <div>
                                <CardTitle>{ticket.title}</CardTitle>
                                <CardDescription>
                                    Submitted on: {format(new Date(ticket.createdAt), 'PPP')} {/* e.g., Sep 15, 2025 */}
                                </CardDescription>
                            </div>
                            <Badge variant={getStatusVariant(ticket.status)} className="capitalize">
                                {ticket.status.replace('_', ' ').toLowerCase()}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">{ticket.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}