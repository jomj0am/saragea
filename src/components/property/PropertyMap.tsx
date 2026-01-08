"use client";

import Map, { Marker, NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { MapPin } from "lucide-react";
import { OSM_STYLE } from "@/lib/map-style";

interface PropertyMapProps {
  latitude: number;
  longitude: number;
}

export default function PropertyMap({ latitude, longitude }: PropertyMapProps) {
  return (
    <div className="h-full w-full rounded-2xl overflow-hidden shadow-lg border border-border">
      <Map
        mapLib={maplibregl}
        initialViewState={{
          longitude,
          latitude,
          zoom: 15,
        }}
        style={{ width: "100%", height: "100%" }}
        mapStyle={OSM_STYLE as maplibregl.StyleSpecification}
      >
        <NavigationControl position="top-right" />

        <Marker longitude={longitude} latitude={latitude} anchor="bottom">
          {/* Custom Animated Marker */}
          <div className="relative">
            <span className="flex h-4 w-4 absolute -top-1 -right-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-primary"></span>
            </span>
            <MapPin className="h-10 w-10 text-red-600 fill-white drop-shadow-xl" />
          </div>
        </Marker>
      </Map>
    </div>
  );
}
