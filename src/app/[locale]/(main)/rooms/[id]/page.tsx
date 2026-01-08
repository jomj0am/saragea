import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building,
  MapPin,
  CheckCircle2,
  ShieldCheck,
  Maximize,
  ArrowLeft,
  Star,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import RoomImageGallery from "@/components/room/RoomImageGallery";
import { getAmenityIcon } from "@/lib/amenities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ReservationButton from "@/components/room/ReservationButton";
import PropertyMap from "@/components/property/PropertyMap"; // ✅ Reusing our map component
import { Button } from "@/components/ui/button";

export const dynamic = "force-dynamic";

async function getRoom(id: string) {
  return prisma.room.findUnique({
    where: { id },
    include: {
      property: true,
    },
  });
}

export default async function RoomDetailsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const awaitedParams = await params;
  const { locale, id } = awaitedParams;

  setRequestLocale(locale);
  const t = await getTranslations("RoomDetailsPage");
  const room = await getRoom(id);

  if (!room) {
    notFound();
  }

  const property = room.property;
  const propertyAmenities = property.amenities;

  return (
    <div className="bg-background min-h-screen  -mt-6 pt-6">
      {/* --- 1. Top Navigation & Breadcrumbs --- */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href={`/property/${property.id}`}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary transition-colors mb-6 group"
        >
          <div className="p-2 bg-secondary rounded-full mr-2 group-hover:bg-primary/10">
            <ArrowLeft className="h-4 w-4" />
          </div>
          {t("backToProperty", { propertyName: property.name })}
        </Link>
      </div>

      <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* --- LEFT COLUMN: Main Content --- */}
        <div className="lg:col-span-2 space-y-10">
          {/* Header Section */}
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
              <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight orboto text-foreground">
                {room.type}
                <span className="text-muted-foreground font-light text-2xl ml-3">
                  #{room.roomNumber}
                </span>
              </h1>
              <Badge
                variant={room.isOccupied ? "destructive" : "success"}
                className="text-sm px-3 py-1 uppercase tracking-wide"
              >
                {room.isOccupied ? t("statusOccupied") : t("statusAvailable")}
              </Badge>
            </div>
            <div className="flex items-center text-muted-foreground gap-4 text-sm md:text-base">
              <span className="flex items-center gap-1">
                <Building className="h-4 w-4 text-primary" /> {property.name}
              </span>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1 underline decoration-dashed underline-offset-4">
                <MapPin className="h-4 w-4 text-red-500" /> {property.location}
              </span>
            </div>
          </div>

          {/* Image Gallery */}
          <div className="rounded-3xl ">
            <RoomImageGallery images={room.images} roomType={room.type} />
          </div>

          {/* Room Description */}
          <div className="prose dark:prose-invert max-w-none">
            <h3 className="text-2xl font-bold roboto  mb-4">
              {t("descriptionTitle")}
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {room.description || t("noDescription")}
            </p>
          </div>

          <Separator />

          {/* Amenities Grid */}
          <div>
            <h3 className="text-base font-bold orboto tracking-tight mb-6">
              {t("amenitiesTitle")}
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {propertyAmenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all hover:bg-secondary/50"
                >
                  <div className="text-primary bg-background p-2 rounded-full shadow-sm">
                    {getAmenityIcon(amenity)}
                  </div>
                  <span className="font-medium text-sm">{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* About the Residence (Parent Property) */}
          <div className="bg-gradient-to-br from-secondary/50 to-background rounded-3xl p-8 border border-border">
            <h3 className="text-2xl font-bold roboto mb-4 flex items-center gap-2">
              <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
              About {property.name}
            </h3>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              {property.description ||
                "Experience modern living with top-tier management and security."}
            </p>
            <div className="flex flex-wrap gap-6 text-sm font-medium">
              <div className="flex items-center gap-2 text-foreground">
                <ShieldCheck className="h-5 w-5 text-green-600" /> Secure
                Compound
              </div>
              <div className="flex items-center gap-2 text-foreground">
                <Maximize className="h-5 w-5 text-blue-600" /> Prime Location
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT COLUMN: Sticky Reservation Card --- */}
        <aside className="lg:col-span-1 relative">
          <div className="sticky top-24">
            <Card className="shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t-4 border-t-primary overflow-hidden">
              <CardHeader className="bg-secondary/20 pb-6">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium mb-1">
                      Monthly Rent
                    </p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-extrabold text-primary">
                        {formatCurrency(room.price).replace("/month", "")}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />{" "}
                      Verified
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="-mt-6 space-y-6">
                {/* Date / Info Placeholders could go here */}
                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-sm text-amber-800 dark:text-amber-200 flex gap-2">
                  <div className="mt-0.5">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  </div>
                  <p>{t("reservationNotice")}</p>
                </div>

                <ReservationButton room={room} />

                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    No payment charged yet. Setup lease with admin.
                  </p>
                </div>

                <Separator />

                <div className="flex justify-between text-sm font-medium">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span>TSh 0</span>
                </div>
                <div className="flex justify-between text-base font-bold">
                  <span>Total (First Month)</span>
                  <span>{formatCurrency(room.price)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Support / Contact Hint */}
            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Questions?{" "}
                <Link href="/contact" className="underline hover:text-primary">
                  Contact Support
                </Link>
              </p>
            </div>
          </div>
        </aside>
      </div>

      {/* --- BOTTOM SECTION: Location Map --- */}
      {/* 4. Location Map CTA Section */}
      {room.property.latitude && room.property.longitude && (
        <div className="mt-20 container mx-auto px-4">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl b dark:border-zinc-800">
            <div className="absolute inset-0 z-10 pointer-events-none bg-gradient-to-tr from-black/80 via-black/20 to-transparent md:bg-gradient-to-r md:from-black/80 md:via-black/40 md:to-transparent" />

            <div className="grid grid-cols-1 md:grid-cols-3 h-[400px] md:h-[500px]">
              {/* Map occupies full width, but covered by overlay on left/bottom */}
              <div className="md:col-span-3 h-full">
                <PropertyMap
                  latitude={room.property.latitude}
                  longitude={room.property.longitude}
                />
              </div>
            </div>

            {/* Floating Content Overlay */}
            <div className="absolute bottom-0 left-0 p-8 md:p-12 z-20 w-full md:w-1/2 text-white">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-primary hover:bg-primary text-white border-none">
                  <MapPin className="h-3 w-3 mr-1" /> Great Location
                </Badge>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4 orboto tracking-tight text-shadow-black text-shadow-sm">
                Explore the Neighborhood
              </h2>
              <p className="text-gray-200 mb-6 text-lg shadow-black drop-shadow-md">
                {room.property.name} is situated in {room.property.location},
                offering convenient access to local amenities and transport
                links.
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-black hover:bg-gray-200 border-none shadow-xl"
              >
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${room.property.latitude},${room.property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get Directions <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
