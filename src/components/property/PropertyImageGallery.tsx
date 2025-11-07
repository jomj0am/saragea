// components/property/PropertyImageGallery.tsx
'use client';

import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay"; // Kwa ajili ya auto-play

interface PropertyImageGalleryProps {
    images: string[];
    propertyName: string;
}

export default function PropertyImageGallery({ images, propertyName }: PropertyImageGalleryProps) {
    // Tumia picha ya 'placeholder' kama hakuna picha zilizopakiwa
    const imageList = images && images.length > 0 ? images : ['/placeholder.jpg'];

    // Kama kuna picha moja tu, onyesha hiyo bila carousel
    if (imageList.length === 1) {
        return (
            <div className="relative h-[500px] w-full">
                <Image
                    src={imageList[0]}
                    alt={`Image of ${propertyName}`}
                    fill
                    className="object-cover"
                    priority // Picha ya kwanza ni muhimu, ipakuliwe haraka
                />
            </div>
        );
    }

    // Kama kuna picha nyingi, onyesha carousel
    return (
        <Carousel
            className="w-full"
            plugins={[
                Autoplay({
                    delay: 5000, // Badilisha picha kila sekunde 5
                    stopOnInteraction: true,
                }),
            ]}
        >
            <CarouselContent>
                {imageList.map((src, index) => (
                    <CarouselItem key={index}>
                        <div className="relative h-[500px] w-full">
                            <Image
                                src={src}
                                alt={`Image ${index + 1} of ${propertyName}`}
                                fill
                                className="object-cover"
                                priority={index === 0} // Picha ya kwanza tu ndiyo iwe na priority
                            />
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            {/* Vitufe vya Next/Previous vitaonekana tu kama kuna picha nyingi */}
            <CarouselPrevious className="absolute left-4" />
            <CarouselNext className="absolute right-4" />
        </Carousel>
    );
}