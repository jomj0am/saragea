// app/[locale]/(main)/cart/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Link } from '@/i18n/navigation';
import { ShoppingCart, Star } from 'lucide-react';
import CartItem from '@/components/cart/CartItem';
import CartSummary from '@/components/cart/CartSummary';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { Toaster } from 'sonner';
import { type Room } from '@prisma/client';

export default function CartPage() {
  const t = useTranslations('CartPage');
  const { items } = useCartStore();
  const [isMounted, setIsMounted] = useState(false);
  const [hydratedItems, setHydratedItems] = useState<Room[]>([]);

  useEffect(() => {
    setIsMounted(true);
    setHydratedItems(items);
  }, [items]);

  if (!isMounted) {
    // Skeleton loader
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-muted rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="h-28 bg-muted rounded"></div>
              <div className="h-28 bg-muted rounded"></div>
            </div>
            <div className="h-72 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-secondary/80 min-h-[calc(100vh-8rem)] py-12 -mt-16">
      <Toaster richColors />
      <div className="container mx-auto px-4">
        {/* 🌟 Header Section */}
        <header className="mb-12 text-center lg:text-left pt-18">
          <h1 className="md:text-5xl  text-4xl font-extrabold mb-3 text-foreground tracking-tight">
            {t('pageTitle')}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto lg:mx-0">
            {t('pageSubtitle', { itemCount: hydratedItems.length })}
          </p>
        </header>

        {hydratedItems.length === 0 ? (
          <div className="text-center py-20 px-6 rounded-2xl bg-card/80 border-2 border-dashed border-muted shadow-lg backdrop-blur-md">
            <ShoppingCart className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-3xl font-semibold mb-2">{t('emptyTitle')}</h2>
            <p className="text-muted-foreground mb-6">{t('emptySubtitle')}</p>
            <Button asChild size="lg">
              <Link href="/properties">{t('browseButton')}</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* 🛏️ Cart Items */}
            <div className="lg:col-span-2 space-y-6">
              {hydratedItems.map((room) => (
                <CartItem key={room.id} room={room} />
              ))}

              {/* ✨ Optional Recommendations / Promotions */}
              <div className="mt-8 p-6 rounded-2xl bg-gradient-to-r from-primary/30 to-primary/10 border border-primary/20 dark:border-slate-600/30 shadow-md">
                <div className="flex items-center gap-3 mb-4">
                  <Star className="h-6 w-6 text-yellow-400" />
                  <h3 className="text-xl font-bold">Recommended for you</h3>
                </div>
                <p className="text-muted-foreground">
                  Check out similar properties you might like.
                </p>
                {/* Placeholder for carousel */}
                <div className="mt-4 flex overflow-x-auto gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="min-w-[180px] h-40 bg-muted/40 rounded-xl flex-shrink-0"
                    ></div>
                  ))}
                </div>
              </div>
            </div>

            {/* 🧾 Cart Summary */}
            <div className="lg:col-span-1 stcky top-24">
              <CartSummary />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
