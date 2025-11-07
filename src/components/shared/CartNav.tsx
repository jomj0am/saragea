// components/shared/CartNav.tsx
'use client';
import { useCartStore } from "@/store/cart-store";
import { ShoppingCart } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function CartNav() {
    const { items } = useCartStore();
    // Zustand state is not immediately available on server render, so we check.
    const hasMounted = typeof window !== 'undefined'; 

    return (
        <Link href="/cart" className="relative p-2 hover:bg-muted rounded-full">
            <ShoppingCart className="h-5 w-5" />
            {hasMounted && items.length > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-1">
                    {items.length}
                </Badge>
            )}
        </Link>
    )
}