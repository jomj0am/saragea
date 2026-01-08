"use client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export default function DeleteRoomButton({ roomId }: { roomId: string }) {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await fetch(`/api/rooms/${roomId}`, { method: "DELETE" });
      toast({ title: "Room deleted." });
      router.refresh();
    } catch {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not delete room.",
      });
    }
  };

  return (
    <DropdownMenuItem
      onSelect={(e) => e.preventDefault()}
      onClick={handleDelete}
      className="text-destructive"
    >
      <Trash2 className="mr-2 h-4 w-4" /> Delete
    </DropdownMenuItem>
  );
}
