"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Edit, MoreHorizontal, PlusCircle } from "lucide-react";
import type { Property } from "@prisma/client";
import PropertyForm from "./PropertyForm";
import DeletePropertyButton from "./DeletePropertyButton";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import { IconButton } from "../shared/IconButton";

// Define the shape of data coming BACK from PropertyForm
type FormattedSubmission = {
  name: string;
  location: string;
  description?: string;
  images: string[];
  amenities?: string[];
  latitude: number | null;
  longitude: number | null;
};

interface PropertyActionsProps {
  property?: Property;
}

export default function PropertyActions({ property }: PropertyActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const isEditMode = Boolean(property);

  const handleSubmit = async (values: FormattedSubmission): Promise<void> => {
    setIsSubmitting(true);
    try {
      // ✅ FIX: Include latitude and longitude in the payload
      const payload = {
        name: values.name,
        location: values.location,
        description: values.description ?? "",
        images: values.images,
        amenities: values.amenities ?? [],
        latitude: values.latitude, // Added
        longitude: values.longitude, // Added
      };

      const url = isEditMode
        ? `/api/properties/${property!.id}`
        : "/api/properties";
      const method = isEditMode ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData: { message?: string } = await response.json();
        throw new Error(errorData.message || "Failed to save property");
      }

      toast({
        title: `Property ${isEditMode ? "updated" : "created"} successfully!`,
      });
      setIsOpen(false);
      router.refresh();
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "An unexpected error occurred";
      toast({ variant: "destructive", title: "Error", description: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const DialogWrapper: React.FC<{ children: React.ReactNode }> = ({
    children,
  }) => (
    <DialogContent
      className="
        !max-w-full w-full h-full rounded-none
        sm:!max-w-2xl sm:rounded-2xl sm:max-h-[90vh]
        p-0 overflow-hidden
        bg-gradient-to-tr from-white/90 via-white/80 to-white/90
        dark:from-slate-700/90 dark:via-slate-700/80 dark:to-slate-800/90
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
          <Button className="flex items-center w-fit gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg hover:scale-105 transition-transform">
            <PlusCircle className="h-5 w-5 text-white drop-shadow-lg" />
            Add New Property
          </Button>
        </DialogTrigger>

        <DialogWrapper>
          <DialogHeader className="px-4 pt-4">
            <DialogTitle className="text-xl font-bold text-indigo-700">
              Add a New Property
            </DialogTitle>
          </DialogHeader>
          <div className="h-full sm:max-h-[80vh] overflow-y-auto p-4">
            <PropertyForm
              key={String(isOpen)}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
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
          <DeletePropertyButton propertyId={property!.id} />
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogWrapper>
        <DialogHeader className="px-4 pt-4">
          <DialogTitle className="text-xl font-bold text-indigo-700">
            Edit Property
          </DialogTitle>
        </DialogHeader>
        <div className="h-full sm:max-h-[80vh] overflow-y-auto p-4">
          <PropertyForm
            key={String(isOpen)}
            initialData={property}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
          />
        </div>
      </DialogWrapper>
    </Dialog>
  );
}
