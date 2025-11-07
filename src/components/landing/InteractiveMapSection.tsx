// components/landing/InteractiveMapSection.tsx
'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker, Popup } from 'react-map-gl';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';

type PropertyLocation = {
    id: string;
    name: string;
    latitude: number | null;
    longitude: number | null;
    images: string[];
};

export default function InteractiveMapSection() {
    const t = useTranslations('HomePageV3.InteractiveMap');
    const [locations, setLocations] = useState<PropertyLocation[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<PropertyLocation | null>(null);

    useEffect(() => {
        fetch('/api/properties/locations')
            .then(res => res.json())
            .then(data => setLocations(data));
    }, []);

    return (
        <section className="py-24 bg-secondary">
            <div className="container mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold">{t('sectionTitle')}</h2>
                    <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">{t('sectionSubtitle')}</p>
                </div>
                <div className="h-[600px] w-full rounded-lg overflow-hidden">
                    <Map
                        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                        initialViewState={{ longitude: 39.2083, latitude: -6.7924, zoom: 11 }}
                        mapStyle="mapbox://styles/mapbox/dark-v11" // Mandhari ya giza
                    >
                        {locations.map(loc => (
                            <Marker key={loc.id} longitude={loc.longitude!} latitude={loc.latitude!}>
                                <button onClick={() => setSelectedLocation(loc)} className="w-4 h-4 bg-primary rounded-full border-2 border-white animate-pulse"></button>
                            </Marker>
                        ))}

                        {selectedLocation && (
                            <Popup
                                longitude={selectedLocation.longitude!}
                                latitude={selectedLocation.latitude!}
                                onClose={() => setSelectedLocation(null)}
                                closeOnClick={false}
                                anchor="bottom"
                            >
                                <div className="w-48">
                                    <Image src={selectedLocation.images[0] || '/placeholder.jpg'} alt={selectedLocation.name} width={200} height={100} className="object-cover rounded-t-md" />
                                    <div className="p-2">
                                        <h4 className="font-bold text-sm">{selectedLocation.name}</h4>
                                        <Button asChild size="sm" className="w-full mt-2">
                                            <Link href={`/properties/${selectedLocation.id}`}>View Details</Link>
                                        </Button>
                                    </div>
                                </div>
                            </Popup>
                        )}
                    </Map>
                </div>
            </div>
        </section>
    );
}