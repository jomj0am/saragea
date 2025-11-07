

// components/shared/PropertyCard.tsx
import Image from 'next/image';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { type Property, type Room } from '@prisma/client';
import { MapPin, Building, KeyRound, Ban } from 'lucide-react';
import { Badge } from '../ui/badge';
import RoomViewer from '../property/RoomViewer';
import { amenityList } from '@/lib/amenities'; // Import kutoka faili letu jipya
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// Sakinisha: npx shadcn-ui@latest add tooltip

type PropertyWithDetails = Property & {
    rooms: Room[];
    _count: { rooms: number };
};

interface PropertyCardProps {
    property: PropertyWithDetails;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const firstImage = property.images?.[0] || '/placeholder.jpg';
    const vacantRoomsCount = property.rooms.length;
    const minPrice = vacantRoomsCount > 0 ? Math.min(...property.rooms.map(room => room.price)) : null;

    // Andaa orodha ya amenities za kuonyesha
    const availableAmenities = property.amenities
        .map(amenityName => amenityList.find(a => a.key === amenityName.toLowerCase()))
        .filter(Boolean) // Ondoa null/undefined
        .slice(0, 5); // Onyesha 5 za kwanza tu

    // Andaa orodha ya amenities ambazo hazipo (kwa ajili ya 'frozen' state)
    const unavailableAmenities = amenityList
        .filter(amenity => !property.amenities.includes(amenity.name))
        .slice(0, 5 - availableAmenities.length); // Jaza nafasi iliyobaki

    return (
        <TooltipProvider delayDuration={100}>
            <div className='flex flex-col h-full'>
                <Card className="w-full h-full overflow-hidden flex flex-col transition-all duration-300 p-0 pb-2 group rounded-lg border-2 border-slate-400/30 border-dashed hover:border-primary/50 hover:shadow-lg">
                    <Link href={`/property/${property.id}`} className="block">
                        <div className="relative overflow-hidden">
                            <Image
                                src={firstImage}
                                alt={property.name}
                                width={400}
                                height={250}
                                className="object-cover w-full h-56 transition-transform duration-500 ease-in-out group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <Badge variant={vacantRoomsCount > 0 ? "success" : "destructive"} className="absolute top-3 right-3">
                                {vacantRoomsCount > 0 ? 'Available' : 'Fully Occupied'}
                            </Badge>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-xl font-bold tracking-tight group-hover:text-primary transition-colors">{property.name}</h3>
                                <div className="flex items-center text-sm mt-1 opacity-90">
                                    <MapPin className="w-4 h-4 mr-1.5" />
                                    <span>{property.location}</span>
                                </div>
                            </div>
                        </div>
                    <CardContent className="p-4 flex-grow flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                    <Building className="w-4 h-4" />
                                    <span>{property._count.rooms} Total Units</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <KeyRound className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold text-green-700">{vacantRoomsCount} Vacant</span>
                                </div>
                            </div>
                            
                            {/* --- SEHEMU MPYA YA AMENITIES --- */}
                            <div className="flex items-center gap-3 mb-4 h-8">
                                {availableAmenities.map(amenity => (
                                    <Tooltip key={amenity!.key}>
                                        <TooltipTrigger>
                                            <div className="p-2 bg-muted rounded-full text-primary">
                                                {amenity!.icon}
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>{amenity!.name}</TooltipContent>
                                    </Tooltip>
                                ))}
                                {unavailableAmenities.map(amenity => (
                                    <Tooltip key={amenity.key}>
                                        <TooltipTrigger>
                                            <div className="p-2 bg-muted rounded-full text-muted-foreground opacity-30 relative">
                                                {amenity.icon}
                                                <Ban className="absolute inset-0 m-auto h-5 w-5"/>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent>{amenity.name} (Not Available)</TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </div>

                        <div>
                            {minPrice !== null ? (
                                <p className="text-sm text-muted-foreground">
                                    Starts from <span className="text-2xl font-bold text-primary">TSh {minPrice.toLocaleString()}/mo</span>
                                </p>
                            ) : (
                                <p className="text-lg font-semibold text-destructive">Currently no rooms available</p>
                            )}
                        </div>
                    </CardContent>
                 </Link>

                </Card>

                                    {/* Kitendo kikuu kiko nje ya Link */}
                    <div className="pt-5">
                        <RoomViewer property={property} />
                    </div>
            </div>
        </TooltipProvider>
    );
}

