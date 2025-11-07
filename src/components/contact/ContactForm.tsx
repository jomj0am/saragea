// components/contact/ContactForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoadingButton } from '../ui/loading-button';
import { useToast } from '../ui/use-toast';
import { Send, CheckCircle, MessageSquare, Type, MessageCircle, UserPen,  MailPlus } from 'lucide-react';
import { useTranslations } from 'next-intl';



export default function ContactForm() {
    const { toast } = useToast();
    const t = useTranslations('ContactPage');
    const tZod = useTranslations('ZodErrors'); // Tunapata tafsiri za Zod

    // --- REKEBISHO #1: Tumia 'keys' za tafsiri ndani ya Zod ---
    const formSchema = z.object({
        name: z.string().min(2, tZod('nameRequired')),
        email: z.string().email(tZod('emailInvalid')),
        subject: z.string().min(4, tZod('subjectRequired')),
        message: z.string().min(10, tZod('messageRequired')),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { name: '', email: '', subject: '', message: '' },
    });

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, // Ongeza headers
                body: JSON.stringify(values),
            });
            if (!response.ok) throw new Error('Something went wrong.');
            
            // --- REKEBISHO #2: Ondoa 'action' prop kutoka kwenye Toast ---
            toast({ 
                title: t('formSuccessToastTitle'), 
                description: t('formSuccessToastDesc'),
                // 'action' haipo kwenye 'default' Toast. UI ya mafanikio inaweza kuwa 'className'.
                // Lakini ni vizuri zaidi kutumia 'sonner' toast library kwa hili.
                // Kwa sasa, tutaiondoa.
            });
            form.reset();
        } catch  {
            toast({ 
                variant: 'destructive', 
                title: t('formErrorToastTitle'), 
                description: t('formErrorToastDesc'),
            });
        }
    };

    return (
        <Card className="border-0 shadow-none bg-transparent  overflow-hidden">
            <CardHeader className="px-6">
                <div className="flex items-start gap-3 mb-2">
                    <div className="p-2 bg-primary/20 rounded-lg">
                        <MessageCircle className="h-8 w-8 text-primary" />
                    </div>
                    <div className="">
                    <CardTitle className="text-3xl">{t('formTitle')}</CardTitle>
                     <CardDescription className='text-sm md:text-[16px]'>{t('formSubtitle')}</CardDescription>
                     </div>
                </div>
                <hr className='border-3 my-3 animate-pulse' />
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-6 2 md:px-6">
                         <FormField 
                            name="name" 
                            control={form.control} 
                            render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel className="flex items-center text-[17px] gap-2 text-muted-foreground">
                                        <UserPen className="h-6 w-6 fill-pink-200 text-pink-500 drop-shadow-md drop-shadow-black/50" /> {t('formNameLabel')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('formNamePlaceholder')} className='h-12 md:h-14 text-sm md:text-[16px] rounded-xl border-gray-300 dark:border-border border-dashed'/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )} 
                         />
                         
                         <FormField 
                            name="email" 
                            control={form.control} 
                            render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel className="flex items-center text-[17px]  gap-2 text-muted-foreground">
                                        <MailPlus className="h-6 w-6 fill-blue-200 text-blue-500 drop-shadow-md drop-shadow-black/50" /> {t('formEmailLabel')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} type="email" placeholder={t('formEmailPlaceholder')} className='h-12 md:h-14 text-sm md:text-[16px] rounded-xl border-gray-300 dark:border-border border-dashed'/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )} 
                         />
                         
                         <FormField 
                            name="subject" 
                            control={form.control} 
                            render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel className="flex items-center text-[17px]  gap-2 text-muted-foreground">
                                        <Type className="h-6 w-6 text-green-500 fill-green-200 drop-shadow-md drop-shadow-black/50" /> {t('formSubjectLabel')}
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder={t('formSubjectPlaceholder')} className='h-12 md:h-14 text-sm md:text-[16px] rounded-xl border-gray-300 dark:border-border border-dashed' />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )} 
                         />
                         
                         <FormField 
                            name="message" 
                            control={form.control} 
                            render={({ field }) => ( 
                                <FormItem>
                                    <FormLabel className="flex items-center text-[17px]  gap-2 text-muted-foreground">
                                        <MessageSquare className="h-6 w-6 fill-amber-200 text-amber-500 drop-shadow-md drop-shadow-black/50" /> {t('formMessageLabel')}
                                    </FormLabel>
                                    <FormControl>
                                        <Textarea rows={6} {...field} placeholder={t('formMessagePlaceholder')} className='md:text-[16px] rounded-xl border-gray-300 dark:border-border border-dashed'/>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem> 
                            )} 
                         />

                         </div>
                         
                        <LoadingButton 
                            type="submit" 
                            className="w-full font-semibold text-base h-12 rounded-full"
                            loading={form.formState.isSubmitting}
                        >
                            {form.formState.isSubmitting ? t('formSendingButton') : (
                                <>
                                    {t('formSendButton')} <Send className="h-5 w-5 ml-2" />
                                </>
                            )}
                        </LoadingButton>
                    </form>
                </Form>
                
                <div className="mt-8 p-4 bg-secondary rounded-xl flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <p className=" text-muted-foreground">
                        {t('formResponseNotice')}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}