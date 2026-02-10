"use client";

import { useState, useRef, useEffect } from "react";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import PropertyCard from "../shared/PropertyCard";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { motion } from "framer-motion";
import clsx from "clsx";
import { Prisma } from "@prisma/client";
import { Link } from "@/i18n/navigation";
import { ArrowRight } from "lucide-react";

/* ---------- Types ---------- */
// Hii ni type sahihi unayoipata kutoka kwenye page.tsx
type PropertyWithDetails = Prisma.PropertyGetPayload<{
  include: {
    rooms: { where: { isOccupied: false } };
    _count: { select: { rooms: true } };
  };
}>;

/** Minimal placeholder shape that satisfies PropertyWithDetails fields we use */
function createPlaceholder(id: string): PropertyWithDetails {
  return {
    id: id,
    name: "placeholder",
    location: "",
    description: "",
    images: [],
    amenities: [],
    latitude: null,
    longitude: null,
    ownerId: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    totalPrice: null,
    rooms: [],
    _count: { rooms: 0 },
  };
}

export default function FeaturedProperties({
  properties,
}: {
  properties: PropertyWithDetails[];
}) {
  const t = useTranslations("HomePageV3");
  const [api, setApi] = useState<CarouselApi | null>(null);
  const [active, setActive] = useState(0);
  const thumbRowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!api) return;
    setActive(api.selectedScrollSnap());
    const onSelect = () => {
      setActive(api.selectedScrollSnap());
      scrollThumbIntoView(api.selectedScrollSnap());
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  /* --- Make sure we have at least 4 thumbs --- */
  const showThumbs: PropertyWithDetails[] = [...properties];
  while (showThumbs.length < 4) {
    showThumbs.push(createPlaceholder(`placeholder-${showThumbs.length}`));
  }

  const scrollThumbIntoView = (index: number) => {
    const row = thumbRowRef.current;
    if (!row) return;
    const thumb = row.children[index] as HTMLElement | undefined;
    thumb?.scrollIntoView({
      inline: "center",
      behavior: "smooth",
      block: "nearest",
    });
  };

  const setSlide = (index: number) => {
    setActive(index);
    scrollThumbIntoView(index);
  };

  return (
    <section className="relative py-24  md:px-0 bg-gradient-to-br from-secondary/80 via-white to-secondary dark:from-slate-950 dark:via-slate-600/30  dark:to-slate-950">
      <div className="absolute inset-0 bg-[url('/assets/patterns/grid.jpg')] opacity-10 dark:opacity-5 pointer-events-none" />
      <div className="container max-w-[84rem] mx-auto md:px-12 px-6 relative flex flex-col lg:flex-row gap-10">
        {/* Left rail (desktop) */}
        <div className="hidden lg:flex flex-col justify-center gap-4">
          <ThumbRail
            thumbs={showThumbs}
            active={active}
            setSlide={setSlide}
            vertical
          />
        </div>

        <div className="flex-1">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-5xl orboto font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500 drop-shadow-md">
              {t("featuredPropertiesTitle")}
            </h2>
            <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
              {t("featuredPropertiesSubtitle")}
            </p>
          </div>

          {/* Carousel */}
          <Carousel setApi={setApi} opts={{ align: "center", loop: true }}>
            <CarouselContent className="-ml-4">
              {properties.map((property) => (
                <CarouselItem
                  key={property.id}
                  className="pl-4 md:basis-1/2 lg:basis-1/3"
                >
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <PropertyCard property={property} />
                  </motion.div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-15 top-[29.7rem] -translate-y-1/2 bg-primary/70 hover:bg-primary text-white shadow rounded-full w-9 h-9" />
            <CarouselNext className="absolute right-15 top-[29.7rem] -translate-y-1/2 bg-primary/70 hover:bg-primary text-white shadow rounded-full w-9 h-9" />
          </Carousel>

          {/* Dots */}
          <div className="mt-8 flex justify-center gap-2">
            {properties.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlide(i)}
                className={clsx(
                  "h-2.5 w-2.5 rounded-full transition-all",
                  i === active ? "bg-primary scale-125 w-4" : "bg-gray-400/50",
                )}
              />
            ))}
          </div>

          {/* Horizontal thumbs (mobile) */}
          <div className="mt-6 flex items-center justify-center lg:hidden">
            <div
              ref={thumbRowRef}
              className="flex w-full items-center justify-center scrollbar-hide"
            >
              <ThumbRail
                thumbs={showThumbs}
                active={active}
                setSlide={setSlide}
                vertical={false}
              />
            </div>
          </div>
        </div>

        <Link
          className="absolute -bottom-12 px-6 right-0 flex underline text-blue-500 text-shadow-xs text-shadow-black"
          href="properties"
        >
          View All Properties <ArrowRight />
        </Link>
      </div>
    </section>
  );
}

function ThumbRail({
  thumbs,
  active,
  setSlide,
  vertical,
}: {
  thumbs: PropertyWithDetails[];
  active: number;
  setSlide: (index: number) => void;
  vertical: boolean;
}) {
  return (
    <div
      className={clsx(
        "flex",
        vertical
          ? "flex-col gap-3"
          : "flex-row gap-2 overflow-hidden sm:px-1 py-1",
      )}
    >
      {thumbs.map((prop, i) =>
        prop.images && prop.images.length > 0 ? (
          <button
            key={prop.id}
            onClick={() => setSlide(i)}
            className={clsx(
              "relative overflow-hidden rounded-xl border-2 transition-all flex-shrink-0",
              vertical ? "h-20 w-28" : "h-20 md:w-28 w-22",
              i === active
                ? "border-primary scale-105 shadow-lg"
                : "border-transparent opacity-70 hover:opacity-100",
            )}
          >
            <Image
              src={prop.images[0]}
              alt={prop.name}
              fill
              className="object-cover"
            />
          </button>
        ) : (
          <div
            key={prop.id}
            className="h-18 md:w-28 w-18 flex-shrink-0 rounded-xl bg-gray-300/20 border border-dashed border-gray-400 animate-pulse"
          />
        ),
      )}
    </div>
  );
}
