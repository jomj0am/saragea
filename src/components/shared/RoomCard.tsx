// components/shared/RoomCard.tsx
import Link from 'next/link';
import { type Room } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';

export default function RoomCard({ room }: { room: Room }) {
    const firstImage = room.images?.[0] || '/placeholder-room.jpg'; // Picha maalum ya chumba

    return (
        <div className="border bg-white/80 dark:bg-zinc-800/60 border-dashed dark:border-white/20 border-slate-400/70 rounded-lg p-0 flex flex-col md:flex-row gap-0 overflow-hidden group transition-all hover:border-primary">
            <div className="relative w-full md:w-1/3 h-42 md:h-auto">
                <Image 
                    src={firstImage}
                    alt={`Image of ${room.type}`}
                    fill
                    className="object-cover bg-black"
                />
            </div>
            <div className="flex-1 p-4 pt-2 md:pt-4 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs text-muted-foreground">Room {room.roomNumber}</p>
                            <h3 className="font-bold text-lg leading-tight">{room.type}</h3>
                        </div>
                        <p className="font-bold text-lg text-primary text-right whitespace-nowrap">{formatCurrency(room.price)}
                            <span className="text-xs font-normal text-muted-foreground block">/month</span>
                        </p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                        {room.description || "A comfortable and well-maintained living space, perfect for individuals or small families."}
                    </p>
                </div>
                <Button asChild className="mt-4 w-full justify-between">
                    <Link href={`/rooms/${room.id}`}>
                        <span>View Details & Reserve</span>
                        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}