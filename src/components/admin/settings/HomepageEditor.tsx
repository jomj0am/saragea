'use client';

import { useRouter } from 'next/navigation';
import { useForm, useFieldArray, SubmitHandler } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Setting ,type Prisma } from '@prisma/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Trash2, PlusCircle, Layers, Star, Eye } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '../../ui/form';
import { LoadingButton } from '../../ui/loading-button';

// --- Homepage Content type ---npm rundev

type HomepageContent = {
  settings: {
    heroEnabled: boolean;
    lifestyleEnabled: boolean;
    featuredEnabled: boolean;
    threeDEnabled: boolean;
    testimonialsEnabled: boolean;
    mapEnabled: boolean;
    ctaEnabled: boolean;
  };
  content: {
    hero: { splineUrl: string };
    testimonials: { name: string; avatarUrl: string; quoteKey: string; locationKey: string; }[];
  };
};

// --- Validation Schema ---
const homepageSettingsSchema = z.object({
  settings: z.object({
    heroEnabled: z.boolean(),
    lifestyleEnabled: z.boolean(),
    featuredEnabled: z.boolean(),
    threeDEnabled: z.boolean(),
    testimonialsEnabled: z.boolean(),
  }),
  content: z.object({
    hero: z.object({
      splineUrl: z.string().url({ message: "Please enter a valid Spline URL." }).or(z.literal('')),
    }),
    testimonials: z.array(z.object({
      name: z.string().min(1, "Name is required."),
      avatarUrl: z.string().min(1, "Avatar image is required."),
      quoteKey: z.string(),
      locationKey: z.string(),
    })),
  }),
});
type HomepageSettingsValues = z.infer<typeof homepageSettingsSchema>;

interface HomepageEditorProps {
  initialSettings: Setting | null;
}

function isHomepageContent(content: Prisma.JsonValue | null | undefined): content is HomepageContent {
  return (
    content !== null &&
    content !== undefined &&
    typeof content === 'object' &&
    'settings' in content &&
    'content' in content
  );
}

export default function HomepageEditor({ initialSettings }: HomepageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Safe parse with null/undefined check
  const parsedContent = initialSettings?.jsonContent && isHomepageContent(initialSettings.jsonContent) 
    ? initialSettings.jsonContent 
    : null;

  const form = useForm<HomepageSettingsValues>({
    resolver: zodResolver(homepageSettingsSchema),
    defaultValues: {
      settings: {
        heroEnabled: parsedContent?.settings?.heroEnabled ?? true,
        lifestyleEnabled: parsedContent?.settings?.lifestyleEnabled ?? true,
        featuredEnabled: parsedContent?.settings?.featuredEnabled ?? true,
        threeDEnabled: parsedContent?.settings?.threeDEnabled ?? true,
        testimonialsEnabled: parsedContent?.settings?.testimonialsEnabled ?? true,
      },
      content: {
        hero: { splineUrl: parsedContent?.content?.hero?.splineUrl || '' },
        testimonials: parsedContent?.content?.testimonials || [],
      },
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "content.testimonials",
  });

  const onSubmit: SubmitHandler<HomepageSettingsValues> = async (values) => {
    try {
      // Fix: Handle undefined case properly
      const currentTestimonials = initialSettings?.jsonContent && isHomepageContent(initialSettings.jsonContent)
        ? initialSettings.jsonContent.content.testimonials
        : [];

      const updatedTestimonials = values.content.testimonials.map((testimonial, index) => ({
        ...testimonial,
        quoteKey: currentTestimonials[index]?.quoteKey || `HomePageV3.testimonial${index+1}Quote`,
        locationKey: currentTestimonials[index]?.locationKey || `HomePageV3.testimonial${index+1}Location`,
      }));

      const payload = {
        ...values,
        content: {
          ...values.content,
          testimonials: updatedTestimonials,
        }
      };
      
      const res = await fetch(`/api/settings/page.home`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jsonContent: payload }),
      });

      if (!res.ok) throw new Error("Failed to save.");

      toast({ title: "Homepage updated successfully!"});
      router.refresh();
    } catch (error) {
      toast({ 
        title: "Error saving", 
        description: error instanceof Error ? error.message : "Could not save changes.", 
        variant: 'destructive' 
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Toggles */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-0 shadow-xl">
          <CardHeader className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            <CardTitle>Section Layout</CardTitle>
          </CardHeader>
          <CardDescription className="ml-7 text-gray-600 dark:text-gray-300">
            Enable or disable homepage sections dynamically.
          </CardDescription>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {[
              { label: 'Hero Section', name: 'heroEnabled', icon: <Eye className="w-4 h-4 text-blue-500" /> },
              { label: 'Shop by Lifestyle', name: 'lifestyleEnabled', icon: <Star className="w-4 h-4 text-yellow-500" /> },
              { label: 'Featured Products', name: 'featuredEnabled', icon: <Star className="w-4 h-4 text-green-500" /> },
              { label: '3D Showcase', name: 'threeDEnabled', icon: <Loader2 className="w-4 h-4 text-purple-500 animate-spin" /> },
              { label: 'Testimonials', name: 'testimonialsEnabled', icon: <Star className="w-4 h-4 text-pink-500" /> },
            ].map((section) => (
              <FormField 
                key={section.name} 
                name={`settings.${section.name}`} 
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between border p-3 rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <FormLabel className="mb-0 cursor-pointer">{section.label}</FormLabel>
                    </div>
                                     <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>

                  </FormItem>
                )} 
              />
            ))}
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="shadow-lg border-t-4 border-purple-500">
          <CardHeader className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle>Content Editor</CardTitle>
          </CardHeader>
          <CardDescription className="ml-7 text-gray-600 dark:text-gray-300">
            Edit visual content for each section.
          </CardDescription>
          <CardContent>
            <Accordion type="multiple" defaultValue={['hero']} className="w-full">
              {/* Hero */}
              <AccordionItem value="hero">
                <AccordionTrigger className="hover:no-underline">Hero Section</AccordionTrigger>
                <AccordionContent className="pt-4">
                  <FormField 
                    control={form.control}
                    name="content.hero.splineUrl" 
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormLabel>3D Model URL</FormLabel>
                        <FormControl>
                          <Input placeholder="Spline scene URL" {...field} />
                        </FormControl>
                        <FormDescription>Copy the scene URL from Spline export.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} 
                  />
                </AccordionContent>
              </AccordionItem>

              {/* Testimonials */}
              <AccordionItem value="testimonials">
                <AccordionTrigger className="hover:no-underline">Testimonials</AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  {fields.map((field, index) => (
                    <Card key={field.id} className="border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-900/20 relative">
                      <CardContent className="pt-6 space-y-3">
                        <Button 
                          type="button" 
                          variant="destructive" 
                          size="icon" 
                          className="absolute top-2 right-2" 
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <FormField 
                          control={form.control}
                          name={`content.testimonials.${index}.name`} 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Asha Juma" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                        <FormField 
                          control={form.control}
                          name={`content.testimonials.${index}.avatarUrl`} 
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Avatar Image URL</FormLabel>
                              <FormControl>
                                <Input placeholder="URL to avatar" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )} 
                        />
                      </CardContent>
                    </Card>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-2" 
                    onClick={() => append({ name: '', avatarUrl: '', quoteKey: '', locationKey: '' })}
                  >
                    <PlusCircle className="w-4 h-4" /> Add Testimonial
                  </Button>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <LoadingButton 
            type="submit" 
            loading={form.formState.isSubmitting} 
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg transition-all duration-200"
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              'Save All Homepage Changes'
            )}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}