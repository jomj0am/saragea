// app/[locale]/(main)/rooms/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Building, Home, MapPin } from "lucide-react";
import AddToCartButton from "@/components/room/AddToCartButton";
import { formatCurrency } from "@/lib/utils";
import RoomImageGallery from "@/components/room/RoomImageGallery"; // Komponenti mpya
import { getAmenityIcon } from "@/lib/amenities"; // Tunatumia tena 'helper' yetu
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReservationButton from "@/components/room/ReservationButton";

async function getRoom(id: string) {
    return prisma.room.findUnique({
        where: { id },
        include: {
            property: true, // Jumuisha taarifa zote za jengo mzazi
        },
    });
}

export default async function RoomDetailsPage({ params }: { params: Promise<{ id: string; locale: string }> }) {
    const awaitedParams = await params;
    const { locale, id } = awaitedParams;
    
    setRequestLocale(locale);
    const t = await getTranslations('RoomDetailsPage');
    const room = await getRoom(id);

    if (!room) {
        notFound();
    }
    
    // Pata 'amenities' za jengo zima
    const propertyAmenities = room.property.amenities;

    return (
        <div className="bg-secondary">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
                    {/* Sehemu ya Picha (Kushoto) */}
                    <div className="lg:col-span-2">
                        <RoomImageGallery images={room.images} roomType={room.type} />
                    </div>

                    {/* Sehemu ya Taarifa (Kulia) */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            <Card>
                                <CardContent className="p-6">
                                    <Link href={`/properties/${room.property.id}`} className="text-primary hover:underline text-sm font-medium flex items-center gap-2 mb-2">
                                       <Building className="h-4 w-4" /> {t('backToProperty', { propertyName: room.property.name })}
                                    </Link>
                                    <h1 className="text-3xl font-extrabold tracking-tight">
                                        {room.type}
                                        <span className="text-muted-foreground font-normal ml-2">({t('roomLabel')} {room.roomNumber})</span>
                                    </h1>
                                    <div className="mt-4">
                                        <Badge variant={room.isOccupied ? "destructive" : "success"}>
                                            {room.isOccupied ? t('statusOccupied') : t('statusAvailable')}
                                        </Badge>
                                    </div>
                                    <Separator className="my-4" />
                                    <p className="text-4xl font-bold">{formatCurrency(room.price)}
                                        <span className="text-lg font-normal text-muted-foreground">{t('pricePerMonth')}</span>
                                    </p>
                                    <div className="mt-6">
                                        <ReservationButton room={room} />
                                        <p className="text-xs text-center text-muted-foreground mt-3">{t('reservationNotice')}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>{t('descriptionTitle')}</CardTitle></CardHeader>
                                <CardContent>
                                    <p className="text-muted-foreground">{room.description || t('noDescription')}</p>
                                </CardContent>
                            </Card>
                        </div>
                    </aside>
                </div>

                {/* Sehemu ya Ziada ya Amenities na Maelezo ya Jengo */}
                <div className="mt-16">
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-12">
                        <Card>
                             <CardHeader><CardTitle>{t('amenitiesTitle')}</CardTitle></CardHeader>
                             <CardContent className="grid grid-cols-2 gap-4">
                                {propertyAmenities.map(amenity => (
                                    <div key={amenity} className="flex items-center gap-2">
                                        <span className="text-primary">{getAmenityIcon(amenity)}</span>
                                        <span className="text-muted-foreground">{amenity}</span>
                                    </div>
                                ))}
                             </CardContent>
                        </Card>
                        <Card>
                             <CardHeader><CardTitle>{t('propertyDetailsTitle')}</CardTitle></CardHeader>
                             <CardContent className="space-y-2">
                                <p className="flex items-center gap-2"><Home className="h-4 w-4 text-primary" /> <strong>Name:</strong> {room.property.name}</p>
                                <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> <strong>Location:</strong> {room.property.location}</p>
                                <p className="text-muted-foreground mt-2">{room.property.description}</p>
                             </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}