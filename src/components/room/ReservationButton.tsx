// components/room/ReservationButton.tsx
"use client";
import { Button } from "@/components/ui/button";
import { type Room } from "@prisma/client";
import { CalendarCheck, Loader2, Lock } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useAuthModalStore } from "@/store/auth-modal-store";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

export default function ReservationButton({ room }: { room: Room }) {
  const { data: session } = useSession();
  const { openModal } = useAuthModalStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReservation = async () => {
    if (!session) {
      openModal("login");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: room.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to make reservation.");
      }

      toast.success("Application Submitted! 🎉", {
        description:
          "We've received your reservation request. Check your dashboard for status updates.",
        action: {
          label: "Go to Dashboard",
          onClick: () => router.push("/dashboard"),
        },
        duration: 5000,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong.";
      toast.error("Reservation Failed", { description: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (room.isOccupied) {
    return (
      <Button
        className="w-full py-6 text-lg bg-muted text-muted-foreground cursor-not-allowed hover:bg-muted"
        disabled
      >
        <Lock className="mr-2 h-5 w-5" /> Currently Occupied
      </Button>
    );
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <Button
        className="w-full text-lg py-7 rounded-xl font-bold bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        disabled={isLoading}
        onClick={handleReservation}
      >
        {isLoading ? (
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <CalendarCheck className="mr-2 h-5 w-5" />
        )}
        {isLoading ? "Processing..." : "Reserve Now"}
      </Button>
    </>
  );
}
