// components/admin/ContactPageEditor.tsx
'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { type Setting } from '@prisma/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import LocationPicker from '../shared/LocationPicker';
import { Link } from '@/i18n/navigation';
import { Terminal } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { LoadingButton } from '@/components/ui/loading-button';

// --- REKEBISHO #1: 'Type' Kamili kwa ajili ya 'JSON' ---
type ContactPageContent = {
    contactDetails: {
        titleKey: string;
        addressKey: string;
        phone1Key: string;
        phone2Key: string;
        emailKey: string;
        latitude: number | null;
        longitude: number | null;
    };
    form: {
        titleKey: string;
        subtitleKey: string;
    };
};

// --- REKEBISHO #2: Zod Schema inayoakisi 'fields' tunazohariri ---
const contactEditorSchema = z.object({
    latitude: z.number().nullable(),
    longitude: z.number().nullable(),
});

type ContactEditorValues = z.infer<typeof contactEditorSchema>;

interface ContactPageEditorProps {
    initialSettings: Setting | null;
}

export default function ContactPageEditor({ initialSettings }: ContactPageEditorProps) {
    const router = useRouter();
    const { toast } = useToast();
    
    // Pata 'content' ya awali kwa usalama
    const initialContent = initialSettings?.jsonContent as Partial<ContactPageContent> | null;

    const form = useForm<ContactEditorValues>({
        resolver: zodResolver(contactEditorSchema),
        defaultValues: {
            latitude: initialContent?.contactDetails?.latitude ?? null,
            longitude: initialContent?.contactDetails?.longitude ?? null,
        },
    });

    const onSubmit = async (values: ContactEditorValues) => {
        try {
            // --- REKEBISHO #3: 'Logic' Salama ya Kuunganisha Data ---
            // Unda 'payload' mpya kabisa ili kuepuka 'mutation' isiyotarajiwa
            const newContent: ContactPageContent = {
                // Tumia 'spread' operator ku-copy 'objects' za zamani
                ...initialContent,
                contactDetails: {
                    ...initialContent?.contactDetails,
                    latitude: values.latitude,
                    longitude: values.longitude,
                },
                form: {
                    ...initialContent?.form,
                },
            } as ContactPageContent; // Thibitisha 'type' mwishoni
            
            const response = await fetch(`/api/settings/page.contact`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonContent: newContent }),
            });

            if (!response.ok) throw new Error("Failed to save settings.");

            toast({ title: "Contact Page updated successfully!" });
            router.refresh();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: 'destructive', title: "Error", description: errorMessage });
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Contact Details & Map</CardTitle>
                        <CardDescription>
                            Set the exact office location on the map below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {/* --- REKEBISHO #4: Ondoa  */}
                        <FormField
                            name="latitude" // Unganisha moja kwa moja na 'latitude'
                            control={form.control}
                            render={({ field }) => ( // 'field' inahusiana na 'latitude' tu
                                <FormItem>
                                    <FormLabel>Office Location on Map</FormLabel>
                                    <FormControl>
                                        <LocationPicker
                                            value={{ 
                                                latitude: field.value, 
                                                longitude: form.getValues('longitude') // Pata 'longitude' kutoka fomu
                                            }}
                                            onChange={({ latitude, longitude }) => {
                                                // Sasisha 'fields' zote mbili kwa pamoja
                                                form.setValue('latitude', latitude, { shouldValidate: true });
                                                form.setValue('longitude', longitude, { shouldValidate: true });
                                            }}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Drag the pin to the exact location of the SARAGEA office.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        {/* Hapa 'longitude' field inasimamiwa chinichini */}
                        <FormField name="longitude" control={form.control} render={() => <></>} />
                    </CardContent>
                </Card>
                
                <Alert>
                    <Terminal className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        To edit textual content like address, phone numbers, or emails, please use the main {' '}
                        <Button variant="link" asChild className="p-0 h-auto"><Link href="/admin/settings/translations">Translation Editor</Link></Button>.
                    </AlertDescription>
                </Alert>

                <div className="flex justify-end">
                    <LoadingButton type="submit" loading={form.formState.isSubmitting}>
                        Save Contact Page Settings
                    </LoadingButton>
                </div>
            </form>
        </Form>
    );
}