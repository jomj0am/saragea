// app/properties/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { MapPin, CheckCircle2 } from "lucide-react";
import RoomCard from "@/components/shared/RoomCard";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils";
import PropertyImageGallery from "@/components/property/PropertyImageGallery"; // <<<--- IMPORT MPYA
import PropertyMap from "@/components/property/PropertyMap"; // <<<--- IMPORT RAMANI PIA
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getProperty(id: string) {
    return prisma.property.findUnique({
        where: { id },
        include: {
            rooms: {
                where: { isOccupied: false },
                orderBy: { price: 'asc' },
            },
        },
    });
}

export default async function PropertyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
const awaitedParams = await params;
const { id } = awaitedParams;
const property = await getProperty(id);

    if (!property) {
        notFound();
    }

    const vacantRooms = property.rooms; 
    const remainingTotalPrice = vacantRooms.reduce((sum, room) => sum + room.price, 0);

    return (
        <div>
            {/* Sehemu ya Picha na Kichwa IMEBORESHWA */}
            <section className="relative w-full -mt-18">
                {/* --- TUMETUMIA KOMPONENTI MPYA HAPA --- */}
                <PropertyImageGallery images={property.images} propertyName={property.name} />
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-6 md:p-12 text-white">
                  <div className="container mx-auto">
                    <h1 className="text-4xl md:text-5xl font-extrabold">{property.name}</h1>
                    <p className="flex items-center mt-2 text-lg"><MapPin className="mr-2 h-5 w-5"/>{property.location}</p>
                  </div>
                </div>
            </section>

            <main className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Sehemu ya Maelezo (Upande wa Kushoto) */}
                <div className="lg:col-span-2 space-y-10">
                    <div>
                        <h2 className="text-3xl font-bold border-b pb-4 mb-6">About this Property</h2>
                        <p className="text-muted-foreground">{property.description || 'No description available.'}</p>
                    </div>

                    <div>
                        <h3 className="text-2xl font-bold mb-4">Amenities</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {property.amenities.map(amenity => (
                                <div key={amenity} className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    <span>{amenity}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- TUMEONGEZA RAMANI HAPA --- */}
                    {property.latitude && property.longitude && (
                        <div>
                             <h3 className="text-2xl font-bold mb-4">Location Map</h3>
                             <PropertyMap latitude={property.latitude} longitude={property.longitude} />
                        </div>
                    )}
                </div>

                {/* Sehemu ya Vyumba Vilivyo Wazi (Upande wa Kulia) */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24">
                        <Card className="bg-transparent shadow-none space-y-0 gap-0  border-transparent p-0  md:border-l-2 md:border-l-slate-300/40">
                            <CardHeader className="py-0 p-2 md:px-6 my-0">
                                <CardTitle className="text-start text-2xl">Available Rooms</CardTitle>
                            </CardHeader>
                            <CardContent className="p-2 md:px-6 md:pb-6">
                                <div className="space-y-4">
                                    {vacantRooms.length > 0 ? (
                                        vacantRooms.map(room => <RoomCard key={room.id} room={room} />)
                                    ) : (
                                        <p className="text-center text-muted-foreground py-4">No vacant rooms available at the moment.</p>
                                    )}
                                </div>

                                {vacantRooms.length > 1 && (
                                    <div className="mt-6 pt-6 border-t text-center">
                                        <p className="text-muted-foreground">Or rent all available space</p>
                                        <p className="text-2xl font-bold text-primary">{formatCurrency(remainingTotalPrice)}/month</p>
                                        <Button className="w-full mt-2">Inquire About Full Rental</Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </aside>
            </main>
        </div>
    );
}