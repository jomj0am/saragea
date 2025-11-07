// store/cart-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Room } from '@prisma/client'; // Import Room kutoka Prisma

interface CartState {
    items: Room[]; // Badilisha kutoka Property[] kwenda Room[]
    addToCart: (item: Room) => void; // Pokea Room
    removeFromCart: (itemId: string) => void;
    clearCart: () => void;
}

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            addToCart: (item) => {
                const currentItems = get().items;
                const itemExists = currentItems.find((i) => i.id === item.id);
                if (itemExists) {
                    console.log("Room already in cart.");
                    return; 
                }
                set({ items: [...currentItems, item] });
            },
            removeFromCart: (itemId) => {
                set({ items: get().items.filter((item) => item.id !== itemId) });
            },
            clearCart: () => set({ items: [] }),
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);