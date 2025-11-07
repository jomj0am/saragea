// app/admin/properties/[id]/page.tsx
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import RoomList from "@/components/admin/rooms/RoomList"; // Tutatengeneza hii
import StatCard from "@/components/admin/shared/StatCard"; // Tutaitumia tena
import { Building, DoorOpen, DollarSign } from "lucide-react";
import { Toaster } from "sonner";

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
  params: Promise<{ id: string }>; // ✅ Promise here
}

export default async function SinglePropertyPage({ params }: LocaleLayoutProps) {
    const awaitedParams = await params; // ✅ await the params
    const property = await getPropertyData(awaitedParams.id);

    if (!property) {
        notFound();
    }

    const totalRooms = property.rooms.length;
    const occupiedRooms = property.rooms.filter(r => r.isOccupied).length;
    const occupancyRate = totalRooms > 0 ? (occupiedRooms / totalRooms) * 100 : 0;
    const potentialIncome = property.rooms.reduce((sum, room) => sum + room.price, 0);

    return (
        <div>
            <Toaster />
            <Link href="/admin/properties" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to All Properties
            </Link>

            <div className="mb-6">
                <h1 className="text-4xl font-bold">{property.name}</h1>
                <p className="text-muted-foreground">{property.location}</p>
            </div>

            {/* Stat Cards for this specific property */}
            <div className="grid gap-4 md:grid-cols-3 mb-8">
                 <StatCard title="Total Rooms" value={String(totalRooms)}     icon={<Building className="h-5 w-5" />}     description="All registered rooms & units"/>
                 <StatCard title="Occupancy Rate" value={`${occupancyRate.toFixed(1)}%`}     icon={<DoorOpen className="h-5 w-5" />} description="Rooms currently occupied" bgColor="from-yellow-400 to-orange-500"       progress={Number(occupancyRate)}/>
                 <StatCard title="Potential Monthly Income" value={`TSh ${potentialIncome.toLocaleString()}`} icon={<DollarSign />}  bgColor="from-pink-400 to-rose-500"/>
            </div>

            {/* Room Management Section */}
            <div>
                <RoomList propertyId={property.id} initialRooms={property.rooms} />
            </div>
        </div>
    );
}