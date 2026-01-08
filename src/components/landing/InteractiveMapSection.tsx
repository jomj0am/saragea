"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import Map, {
  Marker,
  Popup,
  NavigationControl,
  FullscreenControl,
} from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { OSM_STYLE, DEFAULT_LAT, DEFAULT_LNG } from "@/lib/map-style";
import { MapPin, ArrowRight, Loader2 } from "lucide-react";

type PropertyLocation = {
  id: string;
  name: string;
  latitude: number | null;
  longitude: number | null;
  images: string[];
};

export default function InteractiveMapSection() {
  const t = useTranslations("HomePageV3.InteractiveMap");
  const [locations, setLocations] = useState<PropertyLocation[]>([]);
  const [selectedLocation, setSelectedLocation] =
    useState<PropertyLocation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/properties/locations")
      .then((res) => res.json())
      .then((data) => {
        setLocations(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <section className="pt-12 relative overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className=" ">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent orboto">
            {t("sectionTitle")}
          </h2>
          <p className="text-muted-foreground mt-3 max-w-2xl mx-auto text-lg">
            {t("sectionSubtitle")}
          </p>
        </div>

        {/* Map Container */}
        <div className="h-[600px] w-full  overflow-hidden shadow-2xl  dark:border-slate-800 relative group">
          {loading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center bg-background/50 backdrop-blur-sm">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          )}

          <Map
            mapLib={maplibregl}
            initialViewState={{
              longitude: DEFAULT_LNG,
              latitude: DEFAULT_LAT,
              zoom: 11,
            }}
            style={{ width: "100%", height: "100%" }}
            mapStyle={OSM_STYLE as maplibregl.StyleSpecification}
          >
            <NavigationControl position="bottom-right" />
            <FullscreenControl position="top-right" />

            {locations.map((loc) => (
              <Marker
                key={loc.id}
                longitude={loc.longitude!}
                latitude={loc.latitude!}
                anchor="bottom"
                onClick={(e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedLocation(loc);
                }}
              >
                <div className="cursor-pointer transition-transform hover:scale-110 hover:-translate-y-2">
                  <div className="bg-white p-1 rounded-full shadow-md border border-gray-100">
                    <div className="bg-primary text-white p-2 rounded-full">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-t-[8px] border-t-white border-r-[6px] border-r-transparent mx-auto drop-shadow-sm"></div>
                </div>
              </Marker>
            ))}

            {selectedLocation && (
              <Popup
                longitude={selectedLocation.longitude!}
                latitude={selectedLocation.latitude!}
                onClose={() => setSelectedLocation(null)}
                closeOnClick={false}
                offset={40}
                className="z-50"
                maxWidth="300px"
              >
                <div className="p-0 overflow-hidden rounded-lg">
                  <div className="relative h-32 w-full">
                    <Image
                      src={selectedLocation.images[0] || "/placeholder.jpg"}
                      alt={selectedLocation.name}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-2 left-3 right-3 text-white">
                      <h4 className="font-bold text-sm truncate shadow-black drop-shadow-md">
                        {selectedLocation.name}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3 bg-white dark:bg-zinc-900">
                    <Button
                      asChild
                      size="sm"
                      className="w-full h-8 text-xs bg-primary/90 hover:bg-primary rounded-md"
                    >
                      <Link
                        href={`/property/${selectedLocation.id}`}
                        className="flex items-center justify-center gap-1"
                      >
                        View Details <ArrowRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </Popup>
            )}
          </Map>

          {/* Footer Overlay */}
          <div className="absolute bottom-5 left-5 z-10 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 shadow-lg text-xs font-medium">
            Found {locations.length} Properties
          </div>
        </div>
      </div>
    </section>
  );
}
