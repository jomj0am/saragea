// components/admin/AssignPropertyDialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type User, type Room, type Property, type Lease } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '../../ui/loading-button';
import { toast } from 'sonner';

// Fixed schema - use number directly instead of string
const formSchema = z.object({
  roomId: z.string().min(1, { message: "Please select a room." }),
  startDate: z.string().min(1, { message: "Start date is required." }),
  endDate: z.string().min(1, { message: "End date is required." }),
  amount: z.number().positive({ message: "Initial payment amount is required." }),
  paymentMethod: z.string().min(1, { message: "Payment method is required." }),
});

type FormValues = z.infer<typeof formSchema>;

type TenantWithLeases = User & {
    leases: Lease[]; // Fixed: should be Lease[], not Room[]
}

type VacantRoomWithProperty = Room & { property: Property };

export default function AssignPropertyDialog({ tenant }: { tenant: TenantWithLeases }) {
    const [isOpen, setIsOpen] = useState(false);
    const [vacantRooms, setVacantRooms] = useState<VacantRoomWithProperty[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            roomId: '',
            startDate: new Date().toISOString().split('T')[0],
            endDate: '',
            amount: 0,
            paymentMethod: 'Cash',
        },
    });

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            fetch('/api/rooms/vacant') 
                .then(res => res.json())
                .then(data => {
                    setVacantRooms(data);
                    setIsLoading(false);
                })
                .catch(() => {
                    setIsLoading(false);
                });
        }
    }, [isOpen]);

    const onSubmit = async (values: FormValues) => {
        try {
            const response = await fetch('/api/leases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    tenantId: tenant.id,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create lease');
            }

            toast.success("Lease Created Successfully!", {
                description: `${tenant.name} is now a tenant of the selected room.`,
            });
            setIsOpen(false);
            form.reset();
            router.refresh();
        } catch (error: unknown) {
            let message = 'Something went wrong';
            if (error instanceof Error) {
                message = error.message;
            } else if (typeof error === 'string') {
                message = error;
            }
            toast.error("Operation Failed", { description: message });
        }
    };
    
    if (tenant.leases.some(lease => lease.isActive)) {
        return (
            <Button variant="outline" size="sm" disabled>
                Lease Active
            </Button>
        );
    }
    
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm">Create Lease</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Lease</DialogTitle>
                    <DialogDescription>
                        Assign a vacant room to {tenant.name} and record the first payment.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            name="roomId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Select a Vacant Room</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger disabled={isLoading}>
                                                <SelectValue placeholder={isLoading ? "Loading rooms..." : "Select a room..."} />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {vacantRooms.map(room => (
                                                <SelectItem key={room.id} value={room.id}>
                                                    {room.roomNumber} - {room.property.name} (TSh {room.price.toLocaleString()})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField 
                                name="startDate"  
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                            <FormField 
                                name="endDate"  
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Date</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} 
                            />
                        </div>
                        <FormField 
                            name="amount"  
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>First Payment Amount</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            placeholder="Enter amount" 
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        <FormField 
                            name="paymentMethod" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Cash">Cash</SelectItem>
                                            <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                            <SelectItem value="Mobile Money">Mobile Money</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )} 
                        />
                        <LoadingButton 
                            type="submit" 
                            className="w-full" 
                            loading={form.formState.isSubmitting}
                        >
                            Confirm & Create Lease
                        </LoadingButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}