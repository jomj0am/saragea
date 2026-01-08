"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  Marker,
  NavigationControl,
  GeolocateControl,
  type MapLayerMouseEvent,
  type MarkerDragEvent,
} from "react-map-gl/maplibre";

import maplibregl from "maplibre-gl";
import { useState, useEffect, useMemo } from "react";
import { MapPin } from "lucide-react";
import { OSM_STYLE, DEFAULT_LAT, DEFAULT_LNG } from "@/lib/map-style";

interface LocationPickerProps {
  value: { latitude?: number | null; longitude?: number | null };
  onChange: (value: { latitude: number; longitude: number }) => void;
}

export default function LocationPicker({
  value,
  onChange,
}: LocationPickerProps) {
  // Initial state based on props or default (Dar es Salaam)
  const initialCoords = useMemo(
    () => ({
      latitude: value.latitude ?? DEFAULT_LAT,
      longitude: value.longitude ?? DEFAULT_LNG,
    }),
    [value.latitude, value.longitude]
  );

  const [viewState, setViewState] = useState({
    ...initialCoords,
    zoom: 13,
  });

  const [marker, setMarker] = useState(initialCoords);

  // Sync marker if parent value changes externally (e.g. edit mode load)
  useEffect(() => {
    if (value.latitude && value.longitude) {
      setMarker({ latitude: value.latitude, longitude: value.longitude });
      setViewState((prev) => ({
        ...prev,
        latitude: value.latitude!,
        longitude: value.longitude!,
      }));
    }
  }, [value.latitude, value.longitude]);

  const handleMapClick = (event: MapLayerMouseEvent) => {
    const { lng, lat } = event.lngLat;
    updateLocation(lat, lng);
  };

  const onMarkerDragEnd = (event: MarkerDragEvent) => {
    const { lng, lat } = event.lngLat;
    updateLocation(lat, lng);
  };

  const updateLocation = (lat: number, lng: number) => {
    setMarker({ latitude: lat, longitude: lng });
    onChange({ latitude: lat, longitude: lng });
  };

  return (
    <div className="h-[400px] w-full rounded-xl overflow-hidden border border-border shadow-inner relative">
      <Map
        mapLib={maplibregl}
        {...viewState}
        onMove={(evt) => setViewState(evt.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={OSM_STYLE as maplibregl.StyleSpecification}
        onClick={handleMapClick}
        cursor="crosshair"
      >
        <GeolocateControl position="top-left" />
        <NavigationControl position="top-left" />

        <Marker
          longitude={marker.longitude}
          latitude={marker.latitude}
          anchor="bottom"
          draggable
          onDragEnd={onMarkerDragEnd}
        >
          <div className="relative group">
            <MapPin className="h-10 w-10 text-red-600 fill-red-100 drop-shadow-lg -translate-y-1 transition-transform group-hover:-translate-y-2" />
            <div className="w-3 h-1.5 bg-black/30 rounded-[100%] blur-[2px] mx-auto" />
          </div>
        </Marker>
      </Map>

      <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-black/80 backdrop-blur-md p-3 rounded-lg text-xs shadow-lg border border-border">
        <p className="font-semibold mb-1">Selected Coordinates:</p>
        <div className="grid grid-cols-2 gap-4 text-muted-foreground">
          <span>Lat: {marker.latitude.toFixed(6)}</span>
          <span>Lng: {marker.longitude.toFixed(6)}</span>
        </div>
        <p className="mt-2 text-[10px] opacity-70">
          Click map or drag pin to adjust.
        </p>
      </div>
    </div>
  );
}
