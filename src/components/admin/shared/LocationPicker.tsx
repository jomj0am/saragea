// components/admin/LocationPicker.tsx
'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker, type MapLayerMouseEvent } from 'react-map-gl'; // <<<--- Import 'type' ya event
import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes'; // Tutatumia theme kubadilisha muonekano wa ramani

interface LocationPickerProps {
    value: { latitude?: number | null; longitude?: number | null };
    onChange: (value: { latitude: number; longitude: number }) => void;
}

const DAR_ES_SALAAM_COORDS = { latitude: -6.7924, longitude: 39.2083 };

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const { theme } = useTheme();
    
    // --- REKEBISHO #1: Weka 'state' na 'initial value' ziwe na uhakika ---
    const [marker, setMarker] = useState({
        // Tumia '??' (Nullish Coalescing) badala ya '||' ili kushughulikia '0' kama 'value' halali
        latitude: value.latitude ?? DAR_ES_SALAAM_COORDS.latitude,
        longitude: value.longitude ?? DAR_ES_SALAAM_COORDS.longitude,
    });

    // Sasisha 'marker' kama 'initial value' (kutoka fomu) itabadilika
    useEffect(() => {
        setMarker({
            latitude: value.latitude ?? DAR_ES_SALAAM_COORDS.latitude,
            longitude: value.longitude ?? DAR_ES_SALAAM_COORDS.longitude,
        });
    }, [value.latitude, value.longitude]);
    
    // --- REKEBISHO #2: Tumia 'Type' Sahihi kwa 'event' ---
    const handleMapInteraction = (event: MapLayerMouseEvent) => {
        const { lng, lat } = event.lngLat;
        const newCoords = { latitude: lat, longitude: lng };
        setMarker(newCoords);
        onChange(newCoords);
    };

    // --- REKEBISHO #3: Hakikisha 'token' ipo kabla ya ku-render ---
    if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
        return (
            <div className="h-[400px] w-full rounded-md bg-destructive/10 text-destructive flex items-center justify-center p-4">
                Mapbox Access Token is not configured. Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment variables.
            </div>
        );
    }

    return (
        <div className="h-[400px] w-full rounded-md overflow-hidden border">
            <Map
                mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
                // Tumia 'key' kubadilisha ramani theme inapobadilika
                key={theme}
                // Tumia 'viewState' ili ramani iweze kusogea
                initialViewState={{ ...marker, zoom: 12 }}
                onMove={evt => setMarker(evt.viewState)}
                style={{ width: '100%', height: '100%' }}
                // Badilisha muonekano wa ramani kulingana na 'theme'
                mapStyle={theme === 'dark' ? "mapbox://styles/mapbox/dark-v11" : "mapbox://styles/mapbox/streets-v11"}
                onClick={handleMapInteraction}
            >
                <Marker 
                    longitude={marker.longitude} 
                    latitude={marker.latitude} 
                    draggable 
                   // onDragEnd={handleMapInteraction} 
                    pitchAlignment="viewport"
                />
            </Map>
            <p className="text-xs text-muted-foreground mt-1">
                Click on the map or drag the pin to set the precise location.
            </p>
        </div>
    );
}