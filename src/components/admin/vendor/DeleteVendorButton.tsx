// components/admin/DeleteVendorButton.tsx
'use client';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteVendorButton({ vendorId }: { vendorId: string }) {
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this vendor? This action cannot be undone.')) return;
        
        try {
            const response = await fetch(`/api/vendors/${vendorId}`, { method: 'DELETE' });
            if (!response.ok) {
                 const errorData = await response.json();
                throw new Error(errorData.message);
            }
            toast({ title: "Vendor deleted successfully." });
            router.refresh();
        } catch (error: unknown) {
                let message = 'Something went wrong';

    if (error instanceof Error) {
        message = error.message;
    } else if (typeof error === 'string') {
        message = error;
    }
            toast({ variant: 'destructive', title: "Error", description: message });
        }
    };

    return (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4 fill-red-100/70 text-red-400" /> Delete
        </DropdownMenuItem>
    );
}