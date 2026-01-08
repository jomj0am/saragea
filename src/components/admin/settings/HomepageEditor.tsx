"use client";

import { useRouter } from "next/navigation";
import { useForm, useFieldArray, SubmitHandler } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Setting, type Prisma } from "@prisma/client";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Loader2,
  Trash2,
  PlusCircle,
  Layers,
  Star,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoadingButton } from "../../ui/loading-button";
import MultiImageUploader from "../shared/MultiImageUploader";

// --- Validation Schema ---
const homepageSettingsSchema = z.object({
  settings: z.object({
    heroEnabled: z.boolean(),
    lifestyleEnabled: z.boolean(),
    featuredEnabled: z.boolean(),
    threeDEnabled: z.boolean(),
    testimonialsEnabled: z.boolean(),
    mapEnabled: z.boolean(),
    ctaEnabled: z.boolean(),
  }),
  content: z.object({
    hero: z.object({
      splineUrl: z.string().url().or(z.literal("")),
    }),
    // Added Lifestyle Schema
    lifestyle: z.array(
      z.object({
        titleKey: z.string(),
        subtitleKey: z.string(),
        imageUrl: z.string(),
        link: z.string(),
      })
    ),
    testimonials: z.array(
      z.object({
        name: z.string().min(1, "Name is required."),
        avatarUrl: z.string().min(1, "Avatar image is required."),
        quoteKey: z.string(),
        locationKey: z.string(),
      })
    ),
  }),
});

type HomepageSettingsValues = z.infer<typeof homepageSettingsSchema>;

interface HomepageEditorProps {
  initialSettings: Setting | null;
}

// Default Lifestyle Data (Your local assets)
const DEFAULT_LIFESTYLE = [
  {
    titleKey: "oceanfrontLivingTitle",
    subtitleKey: "oceanfrontLivingSubtitle",
    imageUrl: "/assets/media/ShopByLifestyle/shoby1.avif",
    link: "/properties?location=Beach",
  },
  {
    titleKey: "cityHubTitle",
    subtitleKey: "cityHubSubtitle",
    imageUrl: "/assets/media/ShopByLifestyle/shopby2.jpeg",
    link: "/properties?location=Masaki",
  },
  {
    titleKey: "familyHomesTitle",
    subtitleKey: "familyHomesSubtitle",
    imageUrl: "/assets/media/ShopByLifestyle/shopby3.jpeg",
    link: "/properties?minRooms=3",
  },
  {
    titleKey: "budgetFriendlyTitle",
    subtitleKey: "budgetFriendlySubtitle",
    imageUrl: "/assets/media/ShopByLifestyle/shopby4.jpeg",
    link: "/properties?maxPrice=500000",
  },
];

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
    lifestyle: {
      titleKey: string;
      subtitleKey: string;
      imageUrl: string;
      link: string;
    }[];
    testimonials: {
      name: string;
      avatarUrl: string;
      quoteKey: string;
      locationKey: string;
    }[];
  };
};

function isHomepageContent(
  content: Prisma.JsonValue | null | undefined
): content is HomepageContent {
  return (
    content !== null &&
    content !== undefined &&
    typeof content === "object" &&
    "settings" in content &&
    "content" in content
  );
}

export default function HomepageEditor({
  initialSettings,
}: HomepageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const safeContent: HomepageContent | null =
    initialSettings?.jsonContent &&
    isHomepageContent(initialSettings.jsonContent)
      ? initialSettings.jsonContent
      : null;

  const form = useForm<HomepageSettingsValues>({
    resolver: zodResolver(homepageSettingsSchema),
    defaultValues: {
      settings: {
        // No 'any' needed because safeContent is typed
        heroEnabled: safeContent?.settings?.heroEnabled ?? true,
        lifestyleEnabled: safeContent?.settings?.lifestyleEnabled ?? true,
        featuredEnabled: safeContent?.settings?.featuredEnabled ?? true,
        threeDEnabled: safeContent?.settings?.threeDEnabled ?? true,
        testimonialsEnabled: safeContent?.settings?.testimonialsEnabled ?? true,
        mapEnabled: safeContent?.settings?.mapEnabled ?? true,
        ctaEnabled: safeContent?.settings?.ctaEnabled ?? true,
      },
      content: {
        hero: {
          splineUrl: safeContent?.content?.hero?.splineUrl || "",
        },
        // Use saved lifestyle or fall back to defaults
        lifestyle: safeContent?.content?.lifestyle || DEFAULT_LIFESTYLE,
        testimonials: safeContent?.content?.testimonials || [],
      },
    },
  });

  const {
    fields: testimonialFields,
    append: appendTestimonial,
    remove: removeTestimonial,
  } = useFieldArray({
    control: form.control,
    name: "content.testimonials",
  });

  // We use useFieldArray for lifestyle too, even though it's fixed length, for easier mapping
  const { fields: lifestyleFields } = useFieldArray({
    control: form.control,
    name: "content.lifestyle",
  });

  const onSubmit: SubmitHandler<HomepageSettingsValues> = async (values) => {
    try {
      // Merge logic to keep keys if not present (simplified for this use case)
      const payload = values;

      const res = await fetch(`/api/settings/page.home`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonContent: payload }),
      });

      if (!res.ok) throw new Error("Failed to save.");

      toast({ title: "Homepage updated successfully!" });
      router.refresh();
    } catch (error) {
      toast({
        title: "Error saving",
        description:
          error instanceof Error ? error.message : "Could not save changes.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section Toggles (Same as before) */}
        <Card className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 border-0 shadow-xl">
          {/* ... (Keep existing toggles code) ... */}
          <CardHeader className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-purple-600 dark:text-purple-300" />
            <CardTitle>Section Layout</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            {/* Re-using existing toggles map */}
            {[
              {
                label: "Hero Section",
                name: "heroEnabled",
                icon: <Eye className="w-4 h-4 text-blue-500" />,
              },
              {
                label: "Shop by Lifestyle",
                name: "lifestyleEnabled",
                icon: <ShoppingBag className="w-4 h-4 text-yellow-500" />,
              },
              {
                label: "Featured Products",
                name: "featuredEnabled",
                icon: <Star className="w-4 h-4 text-green-500" />,
              },
              {
                label: "3D Showcase",
                name: "threeDEnabled",
                icon: (
                  <Loader2 className="w-4 h-4 text-purple-500 animate-spin" />
                ),
              },
              {
                label: "Testimonials",
                name: "testimonialsEnabled",
                icon: <Star className="w-4 h-4 text-pink-500" />,
              },
              {
                label: "CTA Section",
                name: "ctaEnabled",
                icon: <Star className="w-4 h-4 text-orange-500" />,
              },
            ].map((section) => (
              <FormField
                key={section.name}
                name={`settings.${section.name}` as const}
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between border p-3 rounded-lg shadow-sm hover:shadow-md transition-all bg-white dark:bg-gray-800">
                    <div className="flex items-center gap-2">
                      {section.icon}
                      <FormLabel className="mb-0 cursor-pointer">
                        {section.label}
                      </FormLabel>
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
            ))}
          </CardContent>
        </Card>

        {/* Content Editor */}
        <Card className="shadow-lg border-t-4 border-purple-500">
          <CardHeader className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <CardTitle>Content Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion
              type="multiple"
              defaultValue={["lifestyle"]}
              className="w-full"
            >
              {/* 1. Hero Section */}
              <AccordionItem value="hero">
                <AccordionTrigger className="hover:no-underline">
                  Hero Section
                </AccordionTrigger>
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
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </AccordionContent>
              </AccordionItem>

              {/* 2. Shop By Lifestyle Section */}
              <AccordionItem value="lifestyle">
                <AccordionTrigger className="hover:no-underline">
                  Shop by Lifestyle Images
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lifestyleFields.map((field, index) => (
                      <Card
                        key={field.id}
                        className="border bg-slate-50 dark:bg-slate-900"
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                            Card {index + 1} ({field.titleKey})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {/* Image Uploader */}
                          <FormField
                            control={form.control}
                            name={`content.lifestyle.${index}.imageUrl`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                  {/* We adapt MultiImageUploader for single image behavior */}
                                  <MultiImageUploader
                                    value={field.value ? [field.value] : []}
                                    onChange={(urls) =>
                                      field.onChange(urls[0] || "")
                                    }
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Link Input */}
                          <FormField
                            control={form.control}
                            name={`content.lifestyle.${index}.link`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Redirect Link</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          {/* Hidden Fields to preserve keys */}
                          <input
                            type="hidden"
                            {...form.register(
                              `content.lifestyle.${index}.titleKey`
                            )}
                          />
                          <input
                            type="hidden"
                            {...form.register(
                              `content.lifestyle.${index}.subtitleKey`
                            )}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* 3. Testimonials Section */}
              <AccordionItem value="testimonials">
                <AccordionTrigger className="hover:no-underline">
                  Testimonials
                </AccordionTrigger>
                <AccordionContent className="pt-4 space-y-4">
                  {testimonialFields.map((field, index) => (
                    <Card
                      key={field.id}
                      className="border-l-4 border-pink-500 bg-pink-50 dark:bg-pink-900/20 relative"
                    >
                      <CardContent className="pt-6 space-y-3">
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2"
                          onClick={() => removeTestimonial(index)}
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
                    onClick={() =>
                      appendTestimonial({
                        name: "",
                        avatarUrl: "",
                        quoteKey: "",
                        locationKey: "",
                      })
                    }
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
              "Save All Homepage Changes"
            )}
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
