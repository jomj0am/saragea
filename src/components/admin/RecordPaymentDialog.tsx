// components/admin/RecordPaymentDialog.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Invoice, type User } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { PlusCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { LoadingButton } from '../ui/loading-button';
import { Input } from '../ui/input';
import { format } from 'date-fns';

// Fixed schema - amount should be number from the start
const formSchema = z.object({
    invoiceId: z.string().cuid({ message: "Please select an unpaid invoice." }),
    amount: z.number().min(1, 'Amount must be greater than 0'),
    paymentDate: z.string().refine((d) => !isNaN(Date.parse(d)), { message: "Invalid date" }),
    method: z.string().min(2, "Please select a payment method."),
});

type PaymentFormValues = z.infer<typeof formSchema>;

type UnpaidInvoice = Invoice & { lease: { tenant: User } };

export default function RecordPaymentDialog({ unpaidInvoices }: { unpaidInvoices: UnpaidInvoice[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<PaymentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            invoiceId: '',
            amount: 0,
            paymentDate: new Date().toISOString().split('T')[0],
            method: 'Mobile Money',
        },
    });

    const selectedInvoiceId = form.watch('invoiceId');
    
    // Update amount automatically when invoice is selected
    useEffect(() => {
        if (selectedInvoiceId) {
            const selectedInvoice = unpaidInvoices.find(inv => inv.id === selectedInvoiceId);
            if (selectedInvoice) {
                form.setValue('amount', selectedInvoice.amount);
            }
        }
    }, [selectedInvoiceId, form, unpaidInvoices]);

    const onSubmit: SubmitHandler<PaymentFormValues> = async (values) => {
        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.message);
            }
            
            toast({ title: "Success!", description: "Payment has been recorded." });
            setIsOpen(false);
            form.reset();
            router.refresh();
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: 'Error', description: message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><PlusCircle className="mr-2 h-4 w-4" /> Record Manual Payment</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Record a New Manual Payment</DialogTitle>
                    <DialogDescription>
                        Select an unpaid invoice to mark it as paid. This is for payments made outside the system (e.g., cash).
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField 
                            name="invoiceId" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Unpaid Invoice</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an invoice..." />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {unpaidInvoices.map(inv => (
                                                <SelectItem key={inv.id} value={inv.id}>
                                                    {inv.lease.tenant.name} - {formatCurrency(inv.amount)} (Due: {format(new Date(inv.dueDate), 'PPP')})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="amount" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amount</FormLabel>
                                    <FormControl>
                                        <Input 
                                            type="number" 
                                            value={field.value}
                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                            readOnly 
                                            className="bg-muted" 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="paymentDate" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Date</FormLabel>
                                    <FormControl>
                                        <Input type="date" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            name="method" 
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Payment Method</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            Record Payment
                        </LoadingButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}