// components/admin/RecentLeases.tsx
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { type Lease, type User, type Room } from '@prisma/client';

type LeaseWithRelations = Lease & {
    tenant: Pick<User, 'name'>;
    room: Pick<Room, 'roomNumber'>;
};

export default function RecentLeases({ leases }: { leases: LeaseWithRelations[] }) {
    return (
        <div className="space-y-6">
            {leases.map((lease) => (
                <div key={lease.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback>{lease.tenant.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {lease.tenant.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Signed a lease for room {lease.room.roomNumber}.
                        </p>
                    </div>
                    <div className="ml-auto font-medium text-sm">
                        {new Date(lease.createdAt).toLocaleDateString()}
                    </div>
                </div>
            ))}
        </div>
    );
}