'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Edit, MoreHorizontal, PlusCircle } from 'lucide-react';
import { type Room } from '@prisma/client';
import RoomForm from './RoomForm';
import DeleteRoomButton from './DeleteRoomButton';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { IconButton } from '../shared/IconButton';

// --- types ---
type RoomFormValues = {
  roomNumber: string;
  type: string;
  price: string;
  description?: string;
  images?: string[];
  // isOccupied: boolean;
};

interface RoomActionsProps {
  room?: Room;
  propertyId: string;
}

export default function RoomActions({ room, propertyId }: RoomActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = !!room;

  const handleSubmit = async (values: RoomFormValues) => {
    setIsSubmitting(true);
    try {
      const url = isEditMode ? `/api/rooms/${room.id}` : '/api/rooms';
      const method = isEditMode ? 'PATCH' : 'POST';
      const body = JSON.stringify(isEditMode ? values : { ...values, propertyId });

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to save room');
      }

      toast({ title: `Room ${isEditMode ? 'updated' : 'created'} successfully!` });
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
          let message = 'Something went wrong';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }
      toast({ variant: 'destructive', title: 'Error', description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- same gradient wrapper as PropertyActions ---
  const DialogWrapper = ({ children }: { children: React.ReactNode }) => (
    <DialogContent
      className="
        !max-w-full w-full h-full rounded-none
        sm:!max-w-2xl sm:rounded-2xl sm:max-h-[90vh]
        p-0 overflow-hidden
        bg-gradient-to-tr from-white/90 via-white/80 to-white/90 dark:from-slate-700/90 dark:via-slate-700/80 dark:to-slate-800/90
        backdrop-blur-md shadow-2xl
      "
    >
      {children}
    </DialogContent>
  );


  if (!isEditMode) {
    return (
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-transform">
            <PlusCircle className="h-5 w-5 text-white drop-shadow-lg" />
            Add New Room
          </Button>
        </DialogTrigger>

        <DialogWrapper>
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-xl font-bold text-indigo-700">Add a New Room</DialogTitle>
          </DialogHeader>
          <div className="h-full sm:max-h-[80vh] overflow-y-auto p-4">
            <RoomForm key={String(isOpen)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </DialogWrapper>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <IconButton>
              <MoreHorizontal className="h-5 w-5 text-white" />
            </IconButton>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DialogTrigger asChild>
            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
              <Edit className="mr-2 text-green-500 fill-emerald-200/20" />
              Edit
            </DropdownMenuItem>
          </DialogTrigger>
          <DeleteRoomButton roomId={room.id} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogWrapper>
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl font-bold text-indigo-700">
            Edit Room: {room.roomNumber}
          </DialogTitle>
        </DialogHeader>
        <div className="h-full sm:max-h-[80vh] overflow-y-auto p-4">
          <RoomForm
            key={String(isOpen)}
            initialData={room}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogWrapper>
    </Dialog>
  );
}
