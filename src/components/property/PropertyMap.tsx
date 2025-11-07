'use client';
import 'mapbox-gl/dist/mapbox-gl.css';
import Map, { Marker } from 'react-map-gl';

interface PropertyMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  if (!process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-md">
        Mapbox token is not configured.
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full rounded-lg overflow-hidden">
      <Map
        initialViewState={{
          longitude,
          latitude,
          zoom: 14,
        }}
        mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN!}
        style={{ width: '100%', height: '100%' }}
        mapStyle="mapbox://styles/mapbox/streets-v11"
      >
        <Marker longitude={longitude} latitude={latitude} />
      </Map>
    </div>
  );
}
