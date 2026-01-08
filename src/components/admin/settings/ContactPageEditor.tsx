"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { type Setting } from "@prisma/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import {
  Mail,
  Phone,
  MapPin,
  Share2,
  Globe,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Info,
  CheckCircle2,
  Save,
  Navigation,
  Terminal,
} from "lucide-react";
import LocationPicker from "../shared/LocationPicker";
import { LoadingButton } from "@/components/ui/loading-button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { ComponentType } from "react";

// --- Validation Schema ---
const contactPageSchema = z.object({
  contactDetails: z.object({
    address: z.string().min(5, "Address is too short"),
    phone1: z.string().min(10, "Invalid phone format"),
    phone2: z.string().optional(),
    email: z.string().email("Invalid email address"),
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
  }),
  social: z.object({
    instagram: z.string().url().or(z.literal("")),
    facebook: z.string().url().or(z.literal("")),
    linkedin: z.string().url().or(z.literal("")),
    twitter: z.string().url().or(z.literal("")),
  }),
});

type ContactPageValues = z.infer<typeof contactPageSchema>;

interface ContactPageEditorProps {
  initialSettings: Setting | null;
}

// --- Helper: Guidance Component ---
type GuidanceBoxProps = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

const GuidanceBox = ({ title, description, icon: Icon }: GuidanceBoxProps) => (
  <Alert className="mb-6 bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 transition-all hover:shadow-md">
    <Icon className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
    <AlertTitle className="text-indigo-700 dark:text-indigo-300 font-bold">
      {title}
    </AlertTitle>
    <AlertDescription className="text-indigo-600/80 dark:text-indigo-400/80 text-xs">
      {description}
    </AlertDescription>
  </Alert>
);

export default function ContactPageEditor({
  initialSettings,
}: ContactPageEditorProps) {
  const router = useRouter();
  const { toast } = useToast();

  const initialContent =
    initialSettings?.jsonContent as unknown as ContactPageValues | null;

  const form = useForm<ContactPageValues>({
    resolver: zodResolver(contactPageSchema),
    defaultValues: {
      contactDetails: {
        address: initialContent?.contactDetails?.address ?? "",
        phone1: initialContent?.contactDetails?.phone1 ?? "",
        phone2: initialContent?.contactDetails?.phone2 ?? "",
        email: initialContent?.contactDetails?.email ?? "",
        latitude: initialContent?.contactDetails?.latitude ?? -6.7924,
        longitude: initialContent?.contactDetails?.longitude ?? 39.2083,
      },
      social: {
        instagram: initialContent?.social?.instagram ?? "",
        facebook: initialContent?.social?.facebook ?? "",
        linkedin: initialContent?.social?.linkedin ?? "",
        twitter: initialContent?.social?.twitter ?? "",
      },
    },
  });

  const onSubmit = async (values: ContactPageValues) => {
    try {
      const response = await fetch(`/api/settings/page.contact`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jsonContent: values }),
      });

      if (!response.ok) throw new Error("Failed to save settings.");

      toast({
        title: "Contact Settings Saved",
        description:
          "Public contact info and social links updated successfully.",
        variant: "success",
      });
      router.refresh();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Something went wrong";

      toast({
        variant: "destructive",
        title: "Error",
        description: message,
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 animate-in fade-in duration-500"
      >
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 p-1 bg-muted/50 rounded-xl">
            <TabsTrigger value="info" className="rounded-lg gap-2">
              <Globe className="w-4 h-4" /> Core Info
            </TabsTrigger>
            <TabsTrigger value="social" className="rounded-lg gap-2">
              <Share2 className="w-4 h-4" /> Social Links
            </TabsTrigger>
            <TabsTrigger value="map" className="rounded-lg gap-2">
              <Navigation className="w-4 h-4" /> Map Location
            </TabsTrigger>
          </TabsList>

          {/* 1. CORE INFO TAB */}
          <TabsContent value="info" className="space-y-5">
            <GuidanceBox
              icon={Info}
              title="Official Contact Points"
              description="This information is displayed on the Contact Us page and the website footer. Ensure the email is monitored by your support staff."
            />
            <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Contact Details</CardTitle>
                <CardDescription>
                  Primary address and communication channels.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <FormField
                  name="contactDetails.address"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-primary" /> Physical
                        Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. 123 Masaki Road, Dar es Salaam"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    name="contactDetails.phone1"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-primary" /> Primary
                          Phone
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="+255 7..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    name="contactDetails.email"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-primary" /> Public Email
                        </FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="info@saragea.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            <Alert>
              <Terminal className="h-4 w-4" />
              <AlertTitle>Heads up!</AlertTitle>
              <AlertDescription>
                To edit textual content like address, phone numbers, or emails,
                please use the main{" "}
                <Button variant="link" asChild className="p-0 h-auto">
                  <Link href="/admin/settings/translations">
                    Translation Editor
                  </Link>
                </Button>
                .
              </AlertDescription>
            </Alert>
          </TabsContent>

          {/* 2. SOCIAL LINKS TAB */}
          <TabsContent value="social" className="space-y-6">
            <GuidanceBox
              icon={Share2}
              title="Social Media Presence"
              description="Provide full URLs (including https://). These links populate the social icons in your footer to boost engagement."
            />
            <Card className="border-none shadow-xl bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm">
              <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg">Connect With Us</CardTitle>
                <CardDescription>
                  Direct links to your social media profiles.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  name="social.instagram"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Instagram className="w-4 h-4 text-pink-500" />{" "}
                        Instagram URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://instagram.com/saragea"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="social.facebook"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                        URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://facebook.com/saragea"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="social.linkedin"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Linkedin className="w-4 h-4 text-sky-700" /> LinkedIn
                        URL
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://linkedin.com/company/saragea"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="social.twitter"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Twitter className="w-4 h-4 text-zinc-900 dark:text-white" />{" "}
                        X / Twitter URL
                      </FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="https://x.com/saragea" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* 3. MAP LOCATION TAB */}
          <TabsContent value="map" className="space-y-">
            <GuidanceBox
              icon={Navigation}
              title="Geographical Coordinates"
              description="Drag the pin to the exact location of your office. This affects the interactive map on the contact page and building directions."
            />
            <Card className="border-none shadow-xl p-0 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm overflow-hidden">
              <CardHeader className="border-b ">
                <CardTitle className="text-lg">Office Pinpoint</CardTitle>
                <CardDescription>
                  Set the Latitude and Longitude for the headquarters.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 relative">
                <FormField
                  name="contactDetails.latitude"
                  control={form.control}
                  render={({ field }) => (
                    <div className=" m-2 -mt-5">
                      <LocationPicker
                        value={{
                          latitude: field.value,
                          longitude: form.getValues("contactDetails.longitude"),
                        }}
                        onChange={({ latitude, longitude }) => {
                          form.setValue("contactDetails.latitude", latitude, {
                            shouldDirty: true,
                          });
                          form.setValue("contactDetails.longitude", longitude, {
                            shouldDirty: true,
                          });
                        }}
                      />
                    </div>
                  )}
                />

                {/* Overlay Coordinates info */}
                <div className="absolute bottom-28 left-6 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md p-3 rounded-xl border shadow-lg z-10 flex gap-4 text-xs font-mono">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground uppercase text-[10px]">
                      Latitude
                    </span>
                    <span className="text-primary font-bold">
                      {form.watch("contactDetails.latitude")?.toFixed(6)}
                    </span>
                  </div>
                  <div className="flex flex-col border-l pl-4">
                    <span className="text-muted-foreground uppercase text-[10px]">
                      Longitude
                    </span>
                    <span className="text-primary font-bold">
                      {form.watch("contactDetails.longitude")?.toFixed(6)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Global Save Button */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <CheckCircle2
              className={`w-4 h-4 transition-colors ${form.formState.isDirty ? "text-orange-500" : "text-emerald-500"}`}
            />
            {form.formState.isDirty
              ? "You have unsaved changes"
              : "All settings are up to date"}
          </div>
          <LoadingButton
            type="submit"
            loading={form.formState.isSubmitting}
            className="rounded-full px-10 h-12 bg-gradient-to-r from-primary to-indigo-600 shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all font-bold"
          >
            <Save className="mr-2 h-5 w-5" /> Save Contact Settings
          </LoadingButton>
        </div>
      </form>
    </Form>
  );
}
