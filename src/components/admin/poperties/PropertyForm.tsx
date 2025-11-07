'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type Property } from '@prisma/client'; 
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '../../ui/loading-button';
import MultiImageUploader from '../shared/MultiImageUploader';
import AmenitySelector from './AmenitySelector';
import LocationPicker from '../shared/LocationPicker';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Building,  ImageIcon, List, MapPin } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(3),
  location: z.string().min(3),
  description: z.string().min(20).optional().or(z.literal('')),
  images: z.array(z.string().url()).min(1),
  amenities: z.array(z.string()).optional(),
  coords: z.object({
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
  }),
});

type PropertyFormValues = z.infer<typeof formSchema>;



type FormattedPropertyValues = Omit<PropertyFormValues, "coords"> & {
  latitude: number | null;
  longitude: number | null;
};


interface PropertyFormProps {
  initialData?: Property; 
  onSubmit: (values: FormattedPropertyValues) => void;
  isSubmitting: boolean;
}


export default function PropertyForm({ initialData, onSubmit, isSubmitting }: PropertyFormProps) {
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      location: initialData?.location || '',
      description: initialData?.description || '',
      images: initialData?.images || [],
      amenities: initialData?.amenities || [],
      coords: {
        latitude: initialData?.latitude,
        longitude: initialData?.longitude,
      },
    },
  });

const handleSubmit = (values: PropertyFormValues) => {
  const { coords, ...rest } = values; // remove coords safely
  const formattedValues = {
    ...rest,
    latitude: coords?.latitude ?? null,
    longitude: coords?.longitude ?? null,
  };
  onSubmit(formattedValues);
};


  const sections = [
    { title: 'Basic Information', icon: <Building className="text-purple-500 dark:text-purple-400" />, value: 'item-1' },
    { title: 'Image Gallery', icon: <ImageIcon className="text-pink-500 dark:text-pink-400" />, value: 'item-2' },
    { title: 'Amenities', icon: <List className="text-green-500 dark:text-green-400" />, value: 'item-3' },
    { title: 'Geographical Location', icon: <MapPin className="text-indigo-500 dark:text-indigo-400" />, value: 'item-4' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <Accordion type="multiple" defaultValue={sections.map(s => s.value)} className="w-full space-y-4">
          {sections.map((section) => (
            <AccordionItem
              key={section.value}
              value={section.value}
              className="shadow-lg rounded-xl hover:shadow-2xl transition-shadow duration-300 bg-white/90 dark:bg-gray-800/80 backdrop-blur-md"
            >
              <AccordionTrigger className="flex items-center gap-3 text-lg font-semibold px-4 py-3 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 rounded-t-xl hover:from-indigo-50 hover:to-pink-50 dark:hover:from-indigo-700/20 dark:hover:to-pink-700/20">
                <div className="p-2 bg-white/70 dark:bg-gray-700 rounded-full shadow-inner">{section.icon}</div>
                {section.title}
              </AccordionTrigger>
              <AccordionContent className="space-y-4 px-4 pt-4 pb-6">
                {section.value === 'item-1' && (
                  <>
                    <FormField name="name" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Property Name</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Masaki Towers"
                            {...field}
                            className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField name="location" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Address / Location</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Masaki, Dar es Salaam"
                            {...field}
                            className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                    <FormField name="description" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel className="dark:text-gray-200">Description</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={5}
                            placeholder="A detailed description..."
                            {...field}
                            className="shadow-inner hover:shadow-lg transition-shadow dark:bg-gray-700 dark:text-gray-100"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}/>
                  </>
                )}
                {section.value === 'item-2' && (
                  <FormField name="images" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultiImageUploader value={field.value} onChange={field.onChange}  />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}/>
                )}
                {section.value === 'item-3' && (
                  <FormField name="amenities" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <AmenitySelector value={field.value || []} onChange={field.onChange}  />
                      </FormControl>
                    </FormItem>
                  )}/>
                )}
                {section.value === 'item-4' && (
                  <FormField name="coords" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <LocationPicker value={field.value} onChange={field.onChange}  />
                      </FormControl>
                    </FormItem>
                  )}/>
                )}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <LoadingButton
          type="submit"
          loading={isSubmitting}
          className="w-full bg-gradient-to-r py-6 from-indigo-500 to-pink-500 shadow-lg hover:scale-101 transform transition-all text-white dark:from-indigo-600 dark:to-pink-600"
        >
          {initialData ? 'Save Changes' : 'Create Property'}
        </LoadingButton>
      </form>
    </Form>
  );
}
