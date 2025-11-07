// components/room/AddToCartButton.tsx
'use client';

import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useCartStore } from '@/store/cart-store';
import { type Room } from '@prisma/client';
import { ShoppingCart } from 'lucide-react';
import { Toaster } from '../ui/sonner';

export default function AddToCartButton({ room }: { room: Room }) {
    const { addToCart, items } = useCartStore();
    const { toast } = useToast();

    const isInCart = items.some(item => item.id === room.id);

    const handleAddToCart = () => {
        if (isInCart) {
             toast({ title: "Already Reserved", description: "This room is already in your reservation list." });
             return;
        }
        if (room.isOccupied) {
             toast({ variant: "destructive", title: "Room is Occupied", description: "This room is no longer available." });
             return;
        }
        addToCart(room);
        toast({ title: "Reservation Added!", description: `${room.type} - ${room.roomNumber} is now in your list.` });
    };

    return (
        <>
            <Toaster /> 
            <Button 
                size="lg"
                className="w-full" 
                disabled={room.isOccupied || isInCart}
                onClick={handleAddToCart}
            >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {
                    room.isOccupied ? "Currently Occupied" :
                    isInCart ? "Already in Reservations" :
                    "Reserve this Room"
                }
            </Button>
        </>
    );
}