'use client';
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeletePropertyButton({ propertyId }: { propertyId: string }) {
    const router = useRouter();
    const { toast } = useToast();

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this property and all its associated rooms?')) return;
        try {
            await fetch(`/api/properties/${propertyId}`, { method: 'DELETE' });
            toast({ title: "Property deleted." });
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: "Error", description: "Could not delete property." });
        }
    };

    return (
        <DropdownMenuItem onSelect={(e) => e.preventDefault()} onClick={handleDelete} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4 text-red-500 fill-red-200/20" /> Delete
        </DropdownMenuItem>
    );
}