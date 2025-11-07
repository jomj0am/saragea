'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, type SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Vendor, type MaintenanceTicket, type User, type Room, type Property } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LoadingButton } from '@/components/ui/loading-button';
import { toast } from 'sonner';
import { UserCheck, Wrench } from 'lucide-react';

// --- REKEBISHO #1: Schema Sahihi ---
// vendorId inaweza kuwa CUID, au 'unassign', au string tupu (ambayo tutaishughulikia)
const formSchema = z.object({
  vendorId: z.string(), // Tunathibitisha tu ni string, logic itafanywa baadaye
});

type AssignVendorFormValues = z.infer<typeof formSchema>;

// --- REKEBISHO #2: Type Kamili ya 'FullTicket' ---
// Sasa 'vendor' object itakuwa na 'id' na 'name'
type FullTicket = MaintenanceTicket & {
  tenant: Pick<User, 'name' | 'image'>;
  room: Room & { property: Pick<Property, 'name'> };
  vendor: Pick<Vendor, 'id' | 'name'> | null; // Sasa ina 'id' na 'name'
};

export default function AssignVendorDialog({ ticket }: { ticket: FullTicket }) {
  const [isOpen, setIsOpen] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [isLoadingVendors, setIsLoadingVendors] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const form = useForm<AssignVendorFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      vendorId: ticket.vendor?.id || 'unassign', // Tumia 'id' hapa, na 'unassign' kama default
    },
  });

  useEffect(() => {
    if (isOpen) {
      setIsLoadingVendors(true);
      fetch('/api/vendors')
        .then(res => res.json())
        .then((data: Vendor[]) => {
          setVendors(data);
        })
        .finally(() => setIsLoadingVendors(false));
    }
  }, [isOpen]);

  // --- REKEBISHO #3: onSubmit Sasa ni Sahihi na Type-Safe ---
  const onSubmit: SubmitHandler<AssignVendorFormValues> = async (values) => {
    try {
      const vendorIdToAssign = values.vendorId === 'unassign' ? null : values.vendorId;
      
      const response = await fetch(`/api/tickets/${ticket.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId: vendorIdToAssign }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to assign vendor');
      }

      toast.success(vendorIdToAssign ? "Vendor Assigned Successfully!" : "Vendor Unassigned Successfully!");
      
      startTransition(() => {
          setIsOpen(false);
          router.refresh();
      });

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong';
      toast.error("Operation Failed", { description: message });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <UserCheck className="h-4 w-4" />
          {ticket.vendor ? 'Change Vendor' : 'Assign Vendor'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            {ticket.vendor ? 'Change Vendor' : 'Assign Vendor'}
          </DialogTitle>
          <DialogDescription>
            {ticket.vendor 
              ? `Change the vendor assigned to maintenance ticket: "${ticket.title}"`
              : `Assign a vendor to maintenance ticket: "${ticket.title}"`
            }
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
            <FormField
              name="vendorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Select a Vendor</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger disabled={isLoadingVendors}>
                        <SelectValue placeholder={isLoadingVendors ? "Loading vendors..." : "Select a vendor..."} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Unassign Vendor</SelectItem>
                      {vendors.map(vendor => (
                        <SelectItem key={vendor.id} value={vendor.id}>
                          {vendor.name} {vendor.trade && `- ${vendor.trade}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex gap-3 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <LoadingButton 
                type="submit" 
                loading={form.formState.isSubmitting}
              >
                {ticket.vendor ? 'Update Vendor' : 'Assign Vendor'}
              </LoadingButton>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}