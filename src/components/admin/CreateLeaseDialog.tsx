// components/admin/CreateLeaseDialog.tsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '../ui/loading-button';
import { type ReservationWithDetails } from '@/types/messaging'; // Import type yetu mpya

// --- REKEBISHO #1: Schema Iliyoboreshwa ---
const formSchema = z.object({
  startDate: z.string().refine(d => !isNaN(Date.parse(d)), { message: "Start date required" }),
  endDate: z.string().refine(d => !isNaN(Date.parse(d)), { message: "End date required" }),
  amount: z.string().min(1, "Amount is required"), // keep string
  paymentMethod: z.string().min(1, "Payment method is required"),
});

type CreateLeaseValues = z.infer<typeof formSchema>;

interface CreateLeaseDialogProps {
    reservation: ReservationWithDetails;
}

export default function CreateLeaseDialog({ reservation }: CreateLeaseDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<CreateLeaseValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        amount: String(reservation.room.price), // use string
        startDate: new Date().toISOString().split('T')[0],
        endDate: "", 
        paymentMethod: "",
    },
});

    // --- REKEBISHO #2: onSubmit Sasa ni Type-Safe na Kamili ---
    const onSubmit: SubmitHandler<CreateLeaseValues> = async (values) => {
        try {
            // 1. Unda Lease
            const leaseResponse = await fetch('/api/leases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    amount: Number(values.amount), // convert to number here
                    tenantId: reservation.userId,
                    roomId: reservation.roomId,
                }),
            });
            if (!leaseResponse.ok) {
                const err = await leaseResponse.json();
                throw new Error(err.message || 'Failed to create lease.');
            }
            
            // 2. Sasisha status ya Reservation
            await fetch(`/api/reservations/${reservation.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'CONFIRMED' }),
            });
            
            toast({ title: "Lease Created!", description: "The room is now officially occupied and the reservation is confirmed." });
            setIsOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong';
            toast({ variant: 'destructive', title: 'Error', description: message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild><Button size="sm">Create Lease</Button></DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Finalize Lease for {reservation.user.name}</DialogTitle>
                    <DialogDescription>Confirm the lease details and record the first payment.</DialogDescription>
                </DialogHeader>
                <div className="text-sm space-y-2 mb-4 p-4 bg-secondary rounded-md">
                    <p><strong>Room:</strong> {reservation.room.roomNumber}</p>
                    <p><strong>Property:</strong> {reservation.room.property.name}</p>
                    <p><strong>Monthly Rent:</strong> {formatCurrency(reservation.room.price)}</p>
                </div>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField name="startDate"  render={({ field }) => (
                                <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField name="endDate"  render={({ field }) => (
                                <FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                        </div>
                         <FormField name="amount"  render={({ field }) => (
                            <FormItem><FormLabel>First Payment Amount</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField name="paymentMethod"  render={({ field }) => (
                            <FormItem><FormLabel>Payment Method</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select method..." /></SelectTrigger></FormControl><SelectContent>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                            </SelectContent></Select><FormMessage /></FormItem>
                        )} />
                        <LoadingButton type="submit" className="w-full" loading={form.formState.isSubmitting}>
                           Create Lease & Record Payment
                        </LoadingButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}