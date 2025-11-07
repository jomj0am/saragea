// components/admin/TicketStatusChanger.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { type MaintenanceTicket } from '@prisma/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

// Tunabainisha hali zote zinazowezekana kulingana na schema yetu ya Prisma
const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const;

interface TicketStatusChangerProps {
    ticket: MaintenanceTicket;
}

export default function TicketStatusChanger({ ticket }: TicketStatusChangerProps) {
    const [isUpdating, setIsUpdating] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const handleStatusChange = async (newStatus: typeof TICKET_STATUSES[number]) => {
        // Zuia mabadiliko kama hali ni ileile au ikiwa tayari inasasishwa
        if (newStatus === ticket.status || isUpdating) {
            return;
        }

        setIsUpdating(true);
        try {
            const response = await fetch(`/api/tickets/${ticket.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update ticket status');
            }

            toast({
                title: 'Status Updated!',
                description: `Ticket status changed to ${newStatus.replace('_', ' ').toLowerCase()}.`,
            });
            
            // Hii ni amri muhimu ya Next.js App Router.
            // Inasababisha server component (ukurasa wetu) i-re-fetch data na ku-render upya
            // bila kupoteza state ya client-side.
            router.refresh();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Update Failed',
                description: 'Could not update the ticket status. Please try again.',
            });
        } finally {
            // Hakikisha hii inaitwa hata kama kuna kosa
            setIsUpdating(false);
        }
    };

    return (
        <Select
            defaultValue={ticket.status}
            onValueChange={handleStatusChange}
            disabled={isUpdating}
        >
            <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Change status..." />
            </SelectTrigger>
            <SelectContent>
                {TICKET_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                        {/* Tunafanya jina lionekane vizuri kwa mtumiaji */}
                        {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1).toLowerCase()}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}