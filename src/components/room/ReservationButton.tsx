// components/room/ReservationButton.tsx
'use client';
import { Button } from '@/components/ui/button';
import { type Room } from '@prisma/client';
import { ShoppingCart, Loader2 } from 'lucide-react';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useAuthModalStore } from '@/store/auth-modal-store';
import { useRouter } from '@/i18n/navigation';
import { useState } from 'react';

export default function ReservationButton({ room }: { room: Room }) {
    const { data: session } = useSession();
    const { openModal } = useAuthModalStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

    const handleReservation = async () => {
        // 1. Kama mtumiaji hajaingia, fungua login modal
        if (!session) {
            openModal('login');
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/reservations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ roomId: room.id }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to make reservation.');
            }
            
            toast.success("Room Reserved!", {
                description: "Your reservation has been sent to the admin for review.",
                action: {
                    label: "View Dashboard",
                    onClick: () => router.push('/dashboard'),
                },
            });
            // Unaweza ku-disable kitufe au kubadilisha text baada ya mafanikio
            
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Something went wrong.';
            toast.error("Reservation Failed", { description: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toaster richColors position="top-right" /> 
            <Button 
                className="w-full text-lg py-6" 
                disabled={room.isOccupied || isLoading}
                onClick={handleReservation}
            >
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ShoppingCart className="mr-2 h-5 w-5" />}
                {room.isOccupied ? "Currently Occupied" : "Reserve this Room"}
            </Button>
        </>
    );
}