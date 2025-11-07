// components/tenant/NewTicketDialog.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle } from 'lucide-react';
import { type Lease, type Room, type Property } from '@prisma/client';
import { LoadingButton } from '../ui/loading-button';

const formSchema = z.object({
  title: z.string().min(5, { message: 'Please provide a short, clear title.' }),
  description: z.string().min(20, { message: 'Please describe the issue in more detail (at least 20 characters).' }),
  priority: z.enum(['Low', 'Medium', 'High']),
});

// Tunahitaji kupanua type ya Lease ili ijumuishe taarifa za chumba na jengo
type LeaseWithDetails = Lease & {
    room: Room & {
        property: Property;
    };
};

export default function NewTicketDialog({ lease }: { lease: LeaseWithDetails }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { title: '', description: '', priority: 'Medium' },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await fetch('/api/tickets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    roomId: lease.roomId,
                }),
            });
            if (!response.ok) throw new Error('Failed to submit ticket');

            toast({ title: "Request Submitted!", description: "We have received your maintenance request." });
            setIsOpen(false);
            form.reset();
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not submit your request. Please try again.' });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Submit New Request</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>New Maintenance Request</DialogTitle>
                    <DialogDescription>
                        Reporting an issue for Room {lease.room.roomNumber} at {lease.room.property.name}.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField control={form.control} name="title" render={({ field }) => (
                            <FormItem><FormLabel>Title</FormLabel><FormControl><Input placeholder="e.g., Leaking Kitchen Sink" {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="description" render={({ field }) => (
                            <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Please describe the problem in detail..." {...field} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={form.control} name="priority" render={({ field }) => (
                            <FormItem><FormLabel>Priority</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl><SelectTrigger><SelectValue placeholder="Select priority" /></SelectTrigger></FormControl>
                                    <SelectContent>
                                        <SelectItem value="Low">Low (Not urgent)</SelectItem>
                                        <SelectItem value="Medium">Medium (Needs attention)</SelectItem>
                                        <SelectItem value="High">High (Urgent)</SelectItem>
                                    </SelectContent>
                                </Select>
                            <FormMessage /></FormItem>
                        )} />
                        <LoadingButton type="submit" className="w-full" disabled={form.formState.isSubmitting}>
                            {form.formState.isSubmitting ? "Submitting..." : "Submit Request"}
                        </LoadingButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}