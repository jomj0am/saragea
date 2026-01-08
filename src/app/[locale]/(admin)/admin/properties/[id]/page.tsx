import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Building,
  DoorOpen,
  DollarSign,
  MapPin,
  CheckCircle2,
  Hotel,
  Layers,
} from "lucide-react";
import RoomList from "@/components/admin/rooms/RoomList";
import StatCard from "@/components/admin/shared/StatCard";
import PropertyMap from "@/components/property/PropertyMap";
import PropertyActions from "@/components/admin/poperties/PropertyActions";
import { Toaster } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const dynamic = "force-dynamic";

async function getPropertyData(id: string) {
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      rooms: true,
    },
  });
  return property;
}

interface LocaleLayoutProps {
  params: Promise<{ id: string }>;
}

export default async function SinglePropertyPage({
  params,
}: LocaleLayoutProps) {
  const awaitedParams = await params;
  const property = await getPropertyData(awaitedParams.id);

  if (!property) {
    notFound();
  }

  // --- Calculations ---
  const totalRooms = property.rooms.length;
  const occupiedRooms = property.rooms.filter((r) => r.isOccupied).length;
  const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
  const potentialIncome = property.rooms.reduce(
    (sum, room) => sum + room.price,
    0
  );
  const coverImage = property.images[0] || "/placeholder.jpg";

  return (
    <div className="space-y-8 pb-10  xl:p-12">
      <Toaster />

      {/* --- 1. Navigation & Actions --- */}
      <div className="flex sm:flex-row items-start sm:items-center justify-between gap-4">
        <Link
          href="/admin/properties"
          className="group flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
        >
          <div className="p-2 bg-secondary rounded-full mr-2 group-hover:bg-primary/10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          Back to Properties
        </Link>
        <div className="flex items-center gap-2">
          <PropertyActions property={property} />
        </div>
      </div>

      {/* --- 2. Property Hero Profile --- */}
      <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden shadow-2xl border border-white/20 dark:border-gray-800 group">
        <Image
          src={coverImage}
          alt={property.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

        <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 opacity-90">
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white backdrop-blur-md border-0 hover:bg-white/30"
                >
                  <Hotel className="w-3 h-3 mr-1" /> Managed Property
                </Badge>
                <span className="flex items-center text-sm font-medium">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-red-400" />{" "}
                  {property.location}
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-shadow-lg">
                {property.name}
              </h1>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-2xl p-3 border border-white/10">
              <div className="text-center px-2">
                <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                  Rooms
                </p>
                <p className="text-xl font-bold">{totalRooms}</p>
              </div>
              <div className="w-px h-8 bg-white/20"></div>
              <div className="text-center px-2">
                <p className="text-xs text-gray-300 uppercase tracking-wider font-semibold">
                  Tenants
                </p>
                <p className="text-xl font-bold text-emerald-400">
                  {occupiedRooms}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- 3. Detailed Info Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Description & Amenities */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-none shadow-md bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-900/50">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Layers className="w-5 h-5 text-purple-500" />
                About the Property
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed text-base">
                {property.description ||
                  "No description provided for this property."}
              </p>

              <Separator />

              <div>
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" /> Amenities
                  & Features
                </h4>
                {property.amenities.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {property.amenities.map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-muted-foreground bg-white dark:bg-gray-800 p-2 rounded-lg border border-gray-100 dark:border-gray-800 shadow-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div>
                        {amenity}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No amenities listed.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Row Embedded in Layout */}
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Occupancy"
              value={`${occupancyRate.toFixed(0)}%`}
              icon={<DoorOpen className="h-5 w-5" />}
              description="Active leases"
              progress={occupancyRate}
              progressColor="#10b981"
              bgColor="from-emerald-400 to-teal-500"
            />
            <StatCard
              title="Total Units"
              value={String(totalRooms)}
              icon={<Building className="h-5 w-5" />}
              description="Registered rooms"
              bgColor="from-blue-400 to-indigo-500"
            />
            <StatCard
              title="Projected Income"
              value={`TSh ${(potentialIncome / 1000000).toFixed(1)}M`}
              icon={<DollarSign />}
              bgColor="from-pink-400 to-rose-500"
              description="If 100% occupied"
            />
          </div>
        </div>

        {/* Right Column: Location Map */}
        <div className="lg:col-span-1">
          <Card className="h-full border-none shadow-md overflow-hidden flex flex-col p-0">
            <CardHeader className="-mb-3 pt-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-500" /> Location
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-3 flex-grow relative   overflow-hidden h-full">
              {property.latitude && property.longitude ? (
                <div className="absolute inset-0 m-2">
                  <PropertyMap
                    latitude={property.latitude}
                    longitude={property.longitude}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full bg-muted/30 text-muted-foreground text-sm p-8 text-center">
                  No GPS coordinates set for this property.
                </div>
              )}
              {property.latitude && (
                <div className="px-3 py-2 absolute bottom-4 bg-white/90 backdrop-blur-3xl rounded-2xl z-10 right-4 shadow-md shadow-black/30  text-xs text-center text-muted-foreground border-t">
                  Coordinates: {property.latitude.toFixed(4)},{" "}
                  {property.longitude?.toFixed(4)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator className="my-8" />

      {/* --- 4. Room Management Section --- */}
      <div>
        <RoomList propertyId={property.id} initialRooms={property.rooms} />
      </div>
    </div>
  );
}
