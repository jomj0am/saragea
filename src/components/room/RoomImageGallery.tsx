// components/room/RoomImageGallery.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface RoomImageGalleryProps {
    images: string[];
    roomType: string;
}

export default function RoomImageGallery({ images, roomType }: RoomImageGalleryProps) {
    const imageList = images && images.length > 0 ? images : ['/placeholder-room.jpg'];
    const [mainImage, setMainImage] = useState(imageList[0]);

    return (
        <div className="space-y-4">
            <div className="relative h-[450px] w-full rounded-lg overflow-hidden border">
                <Image
                    src={mainImage}
                    alt={`Main view of ${roomType}`}
                    fill
                    className="object-cover transition-all duration-300"
                    sizes="(max-width: 768px) 100vw, 50vw"
                />
            </div>
            {imageList.length > 1 && (
                <div className="grid grid-cols-5 gap-2">
                    {imageList.map((image, index) => (
                        <button 
                            key={index}
                            onClick={() => setMainImage(image)}
                            className={cn(
                                "relative aspect-square rounded-md overflow-hidden transition-all",
                                mainImage === image 
                                    ? "ring-2 ring-primary ring-offset-2" 
                                    : "opacity-70 hover:opacity-100"
                            )}
                        >
                            <Image
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                fill
                                className="object-cover"
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}