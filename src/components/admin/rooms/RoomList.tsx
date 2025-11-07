'use client';
import { type Room } from '@prisma/client';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import RoomActions from './RoomActions';
import Image from 'next/image';
import { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  BedDouble,
  DollarSign,
  Info,
  Lock,
  Unlock,
} from 'lucide-react';
import { Nodata } from '@/components/shared/Nodata';

interface RoomListProps {
  initialRooms: Room[];
  propertyId: string;
}

export default function RoomList({ initialRooms, propertyId }: RoomListProps) {
  const formatCurrency = (amount: number) => `TSh ${amount.toLocaleString()}`;
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-pink-500 bg-clip-text text-transparent">
          Room Management
        </h2>
        <RoomActions propertyId={propertyId} />
      </div>

      {/* Desktop */}
      <div className="hidden md:block  border bg-white/90 dark:bg-gray-900/80 shadow-lg backdrop-blur-md">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
              <TableHead className='flex gap-3 items-center'>
                    <div className="w-20 h-6 rounded-sm bg-gradient-to-br from-slate-200/30 to-slate-600"></div>
                    Room No.
                </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Price / Month</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialRooms.map((room) => (
              <TableRow key={room.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                <TableCell className="font-medium flex gap-3 items-start">
                  <div className="relative w-20 h-14 shrink-0 overflow-hidden rounded-sm border">
                    <Image
                      src={room.images?.[0] ?? '/placeholder.png'}
                      alt={room.roomNumber}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold">{room.roomNumber}</span>
                    <span className="text-sm text-muted-foreground max-w-[22rem] line-clamp-2">
                      {room.description}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{room.type}</TableCell>
                <TableCell>{formatCurrency(room.price)}</TableCell>
                <TableCell>
                  <Badge variant={room.isOccupied ? "secondary" : "default"}>
                    {room.isOccupied ? "Occupied" : "Vacant"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <RoomActions room={room} propertyId={propertyId} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {initialRooms.length === 0 && (
          <div className="text-center p-10 text-muted-foreground">
            <Nodata/>
            This property has no rooms yet. Click “Add New Room” to get started.
          </div>
        )}
      </div>

      {/* Mobile */}
      <div className="md:hidden space-y-4">
        {initialRooms.map((room) => {
          const isOpen = expanded === room.id;
          return (
            <div
              key={room.id}
              className=" border shadow-sm bg-white/90 dark:bg-gray-900/80 p-4 px-2 "
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-12 overflow-hidden rounded-sm border">
                    <Image
                      src={room.images?.[0] ?? '/placeholder.png'}
                      alt={room.roomNumber}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="">
                  <span className="font-semibold">{room.roomNumber}</span>

                                 {/* Status */}
                  <div className="flex items-center gap-2">
                    {room.isOccupied ? (
                      <Lock className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-green-500" />
                    )}
                    <p>
                      <Badge variant={room.isOccupied ? "secondary" : "default"}>
                        {room.isOccupied ? "Occupied" : "Vacant"}
                      </Badge>
                    </p>
                  </div>
                  </div>
                  
                </div>
                <div className="flex items-center gap-2">
                  <RoomActions room={room} propertyId={propertyId} />
                  <button
                    onClick={() => setExpanded(isOpen ? null : room.id)}
                    className="p-1 text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                  >
                    {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {isOpen && (
                <div className="mt-3 text-sm space-y-3 border-t p-3 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg">
                  {/* Type */}
                  <div className="flex items-center gap-2">
                    <BedDouble className="w-4 h-4 text-indigo-500" />
                    <p>
                      <span className="font-medium">Type:</span> {room.type}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    <p>
                      <span className="font-medium">Price:</span> {formatCurrency(room.price)}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-2">
                    {room.isOccupied ? (
                      <Lock className="w-4 h-4 text-yellow-500" />
                    ) : (
                      <Unlock className="w-4 h-4 text-green-500" />
                    )}
                    <p>
                      <span className="font-medium">Status:</span>{" "}
                      <Badge variant={room.isOccupied ? "secondary" : "default"}>
                        {room.isOccupied ? "Occupied" : "Vacant"}
                      </Badge>
                    </p>
                  </div>

                  {/* Description */}
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-pink-500 mt-0.5" />
                    <p className="text-muted-foreground line-clamp-2">
                      {room.description}
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {initialRooms.length === 0 && (
          <div className="text-center p-6 text-muted-foreground">
            <Nodata/>
            No rooms yet. Tap “Add New Room” to get started.
          </div>
        )}
      </div>
    </div>
  );
}
