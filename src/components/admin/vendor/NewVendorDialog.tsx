// components/admin/vendor/NewVendorDialog.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Vendor } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast'; 
import { PlusCircle, Edit } from 'lucide-react';
import { LoadingButton } from '../../ui/loading-button';

// Schema inabaki kama ilivyo, ni sahihi
const formSchema = z.object({
    name: z.string().min(3, 'Name must be at least 3 characters'),
    trade: z.string().min(3, 'Trade is required (e.g., Plumber, Electrician)'),
    phone: z.string().optional(),
    email: z.string().email('Invalid email address').optional().or(z.literal('')),
});

type VendorFormValues = z.infer<typeof formSchema>;

interface NewVendorDialogProps {
    vendor?: Vendor; // Kama 'vendor' ipo, basi ni 'edit mode'
}

export default function NewVendorDialog({ vendor }: NewVendorDialogProps) {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { toast } = useToast();
    const isEditMode = !!vendor;

    // --- REKEBISHO KUU LIKO HAPA ---
    // Andaa 'default values' kwa usahihi
    const defaultValues = {
        name: vendor?.name || '',
        trade: vendor?.trade || '',
        phone: vendor?.phone || '',
        email: vendor?.email || '',
    };

    const form = useForm<VendorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: defaultValues,
    });

    const onSubmit: SubmitHandler<VendorFormValues> = async (values) => {
        try {
            const url = isEditMode ? `/api/vendors/${vendor.id}` : '/api/vendors';
            const method = isEditMode ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to save vendor');
            }

            toast({ title: `Vendor ${isEditMode ? 'updated' : 'added'} successfully!` });
            setIsOpen(false);
            // Hatu-reset tena hapa, 'key' itafanya kazi hiyo
            router.refresh();

        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : 'Something went wrong';
            toast({ variant: 'destructive', title: 'Error', description: message });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {isEditMode ? (
                    // DropdownMenuItem haikubali Button, tumia div au Fragment
                    <div className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground">
                        <Edit className="h-4 w-4 mr-2" /> Edit
                    </div>
                ) : (
                    <Button><PlusCircle className="mr-2 h-4 w-4"/> Add New Vendor</Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
                    <DialogDescription>{isEditMode ? `Update details for ${vendor.name}.` : 'Add a new service provider to your list.'}</DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField control={form.control} name="name" render={({ field }) => ( <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="John Doe" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="trade" render={({ field }) => ( <FormItem><FormLabel>Trade / Profession</FormLabel><FormControl><Input placeholder="Plumber" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="phone" render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="07XX XXX XXX" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <FormField control={form.control} name="email" render={({ field }) => ( <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" placeholder="john.doe@email.com" {...field} /></FormControl><FormMessage /></FormItem> )}/>
                        <LoadingButton type="submit" className="w-full" loading={form.formState.isSubmitting}>
                            {isEditMode ? 'Save Changes' : 'Add Vendor'}
                        </LoadingButton>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}