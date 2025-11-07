// components/cart/CartSummary.tsx
'use client';

import { useMemo } from 'react';
import { useCartStore } from '@/store/cart-store';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import PaymentMethods from './PaymentMethods';
import {
  ShoppingCart,
  Receipt,
  Percent,
  Wallet,
} from 'lucide-react'; // <-- slick outline icons

export default function CartSummary() {
  const t = useTranslations('CartPage');
  const { items } = useCartStore();

  const subtotal = useMemo(
    () => items.reduce((acc, item) => acc + item.price, 0),
    [items]
  );
  const serviceFee = 0; // replace if you actually charge a fee
  const total = subtotal + serviceFee;

  return (
    <aside
      className="
        sticky top-24
        bg-gradient-to-br from-white/70 to-white/40 dark:from-slate-700 dark:to-slate-900

        backdrop-blur-md
        rounded-2xl
        shadow-xl
        border border-gray-200 dark:border-slate-600/20
        p-1
      "
    >
      <Card className="border-none sticky shadow-none bg-transparent">
        <CardHeader className="flex flex-row items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-primary" />
          <CardTitle className="text-2xl font-extrabold tracking-tight">
            {t('summaryTitle')}
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1">
              <Receipt className="w-4 h-4 text-muted-foreground" />
              {t('subtotalLabel', { itemCount: items.length })}
            </span>
            <span className="font-medium">{formatCurrency(subtotal)}</span>
          </div>

          <div className="flex justify-between items-center text-muted-foreground">
            <span className="flex items-center gap-1">
              <Percent className="w-4 h-4 text-muted-foreground" />
              {t('feeLabel')}
            </span>
            <span className="font-medium">{formatCurrency(serviceFee)}</span>
          </div>

          <Separator className="my-2" />

          <div className="flex justify-between items-center font-bold text-lg text-foreground">
            <span className="flex items-center gap-1">
              <Wallet className="w-5 h-5 text-primary" />
              {t('totalLabel')}
            </span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-3">
          <Button
            className="
              w-full h-12 rounded-xl
              bg-gradient-to-r from-primary to-primary/80
              hover:from-primary/90 hover:to-primary
              transition-all duration-200
            "
            size="lg"
            disabled={items.length === 0}
          >
            {t('checkoutButton')}
          </Button>
        </CardFooter>
      </Card>

      <div className="pb-4">
        <PaymentMethods />
      </div>
    </aside>
  );
}
