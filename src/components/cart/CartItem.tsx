// components/cart/CartItem.tsx
'use client';

import Image from 'next/image';
import { type Room } from '@prisma/client';
import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { Trash2, Building, MapPin } from 'lucide-react';

type RoomWithProperty = Room & {
  property?: { name: string; location: string };
};

export default function CartItem({ room }: { room: RoomWithProperty }) {
  const { removeFromCart } = useCartStore();
  const { toast } = useToast();
  const t = useTranslations('CartPage');

  const handleRemove = () => {
    removeFromCart(room.id);
    toast({
      title: t('itemRemovedToast'),
      description: t('itemRemovedDesc', { roomType: room.type }),
    });
  };

  const firstImage = room.images?.[0] || '/placeholder-room.jpg';

  return (
    <div
      className="
        flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4
        border border-gray-200 rounded-2xl bg-white/80 backdrop-blur-md
        shadow-md hover:shadow-xl transition-shadow duration-200
      "
    >
      {/* Room Image */}
      <div className="relative w-full sm:w-32 h-24 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden">
        <Image
          src={firstImage}
          alt={room.type}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Room Details */}
      <div className="flex-grow flex flex-col gap-1">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Building className="h-4 w-4 text-primary/70" />
          {room.property?.name || 'SARAGEA Apartments'}
        </p>
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-red-500/80" />
          {room.property?.location || 'Unknown location'}
        </p>
        <Link href={`/rooms/${room.id}`}>
          <h3 className="text-lg font-semibold hover:text-primary transition-colors">
            {room.type} - {room.roomNumber}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
          {room.description || "no description"}
        </p>
      </div>

      {/* Price & Actions */}
      <div className="flex flex-row sm:flex-col items-end justify-between sm:justify-start gap-2 sm:gap-4 self-stretch">
        <p className="text-lg font-bold text-primary whitespace-nowrap flex items-center gap-1">
          {formatCurrency(room.price)}
          <span className="text-xs font-normal text-muted-foreground block">
            /month
          </span>
        </p>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-red-200 transition-colors"
          onClick={handleRemove}
        >
          <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
