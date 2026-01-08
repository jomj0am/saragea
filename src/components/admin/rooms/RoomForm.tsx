"use client";

import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { type Room } from "@prisma/client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { LoadingButton } from "../../ui/loading-button";
import MultiImageUploader from "../shared/MultiImageUploader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { BedDouble, DollarSign, ImageIcon, Lock } from "lucide-react";

const formSchema = z.object({
  roomNumber: z.string().min(1, "Room number is required"),
  type: z.string().min(3, "Room type is required"),
  price: z.string().min(1, "Price is required"), // Keep as string for form handling
  description: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  isOccupied: z.boolean(),
});

type RoomFormValues = z.infer<typeof formSchema>;

interface RoomFormProps {
  initialData?: Room;
  onSubmit: (values: RoomFormValues) => void;
  isSubmitting: boolean;
}

export default function RoomForm({
  initialData,
  onSubmit,
  isSubmitting,
}: RoomFormProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      roomNumber: initialData?.roomNumber ?? "",
      type: initialData?.type ?? "",
      // Fix: Ensure we don't get "undefined" as a string
      price: initialData?.price ? String(initialData.price) : "",
      description: initialData?.description ?? "",
      images: initialData?.images ?? [],
      isOccupied: initialData?.isOccupied ?? false,
    },
  });

  const handleSubmit: SubmitHandler<RoomFormValues> = (values) => {
    onSubmit(values);
  };

  const sections = [
    {
      title: "Basic Room Details",
      icon: <BedDouble className="text-purple-500 dark:text-purple-400" />,
      value: "item-1",
    },
    {
      title: "Room Images",
      icon: <ImageIcon className="text-pink-500 dark:text-pink-400" />,
      value: "item-2",
    },
    {
      title: "Occupancy Status",
      icon: <Lock className="text-green-500 dark:text-green-400" />,
      value: "item-3",
    },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Accordion
          type="multiple"
          defaultValue={sections.map((s) => s.value)}
          className="w-full space-y-4"
        >
          {sections.map((section) => (
            <AccordionItem
              key={section.value}
              value={section.value}
              className="shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md"
            >
              <AccordionTrigger className="flex items-center gap-3 text-lg font-semibold px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-t-xl hover:from-indigo-50 hover:to-pink-50 dark:hover:from-indigo-700/20 dark:hover:to-pink-700/20">
                <div className="p-2 bg-white/70 dark:bg-gray-700 rounded-full shadow-inner">
                  {section.icon}
                </div>
                {section.title}
              </AccordionTrigger>

              <AccordionContent className="space-y-4 px-4 pt-4 pb-6">
                {section.value === "item-1" && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        name="roomNumber"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">
                              Room Number / Name
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="A101"
                                {...field}
                                className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        name="type"
                        control={form.control}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="dark:text-gray-200">
                              Room Type
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="2-Bedroom Apartment"
                                {...field}
                                className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      name="price"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200 flex items-center gap-1">
                            Monthly Price (TSh)
                            <DollarSign className="w-4 h-4 text-indigo-500" />
                          </FormLabel>
                          <FormControl>
                            {/* ✅ FIX: Pass string value directly, do NOT cast to Number() here */}
                            <Input
                              type="number"
                              placeholder="500000"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
                              className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      name="description"
                      control={form.control}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="dark:text-gray-200">
                            Description
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              rows={5}
                              placeholder="Describe the key features of this room..."
                              {...field}
                              className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                {section.value === "item-2" && (
                  <FormField
                    name="images"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <MultiImageUploader
                            value={field.value || []}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {section.value === "item-3" && (
                  <FormField
                    name="isOccupied"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm dark:border-gray-600">
                        <div className="space-y-0.5">
                          <FormLabel className="dark:text-gray-200">
                            Mark as Occupied
                          </FormLabel>
                          <FormDescription>
                            Toggle on if the room is currently rented out.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <LoadingButton
          type="submit"
          className="w-full bg-gradient-to-r py-6 from-indigo-500 to-pink-500 shadow-lg hover:scale-101 transform transition-all text-white dark:from-indigo-600 dark:to-pink-600"
          loading={isSubmitting}
        >
          {initialData ? "Save Changes" : "Create Room"}
        </LoadingButton>
      </form>
    </Form>
  );
}
