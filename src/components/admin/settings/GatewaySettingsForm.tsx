'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { type PaymentGateway } from '@prisma/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '../../ui/loading-button';
import { CreditCard, Zap, Link as LinkIcon, Globe} from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';

const formSchema = z.object({
  isEnabled: z.boolean(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  vendor: z.string().optional(),
  isLiveMode: z.boolean(),
});

// Gateway styles
const gatewayStyles: Record<
  string,
  { color: string; icon: React.ReactNode; logo: React.ReactNode }
> = {
  SELCOM: {
    color: 'dark:from-purple-500 dark:to-pink-500 from-purple-500/30 to-pink-500/20',
    icon: <Zap className="w-6 h-6 text-white" />,
    logo: <Image src="/logos/selcom.png" width={16} height={16} alt="Selcom" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
  },
  PESAPAL: {
    color: 'dark:from-red-400 dark:to-red-600 from-red-400/30 to-red-600/30',
    icon: <CreditCard className="w-6 h-6 text-white" />,
    logo: <Image src="/logos/mpesa.png" width={16} height={16} alt="M-Pesa" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
  },
  FLUTTERWAVE: {
    color: 'from-indigo-500/30 to-blue-500/30 dark:from-indigo-500 dark:to-indigo-600',
    icon: <LinkIcon className="w-6 h-6 text-white" />,
    logo: <Image src="/logos/stripe.png" width={16} height={16} alt="Stripe" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
  },
  PAYCHANGU: {
    color: 'dark:from-yellow-400 dark:to-yellow-600 from-yellow-400/30 to-yellow-600/30',
    icon: <Globe className="w-6 h-6 text-white" />,
    logo: <Image src="/logos/paypal.png" width={16} height={16} alt="PayPal" className="w-12 h-12 rounded-full border-2 border-white shadow-md" />
  },
};

export default function GatewaySettingsForm({ gateway }: { gateway: PaymentGateway }) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      isEnabled: gateway.isEnabled,
      apiKey: gateway.apiKey || '',
      apiSecret: gateway.apiSecret || '',
      vendor: gateway.vendor || '',
      isLiveMode: gateway.isLiveMode,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      const res = await fetch(`/api/gateways/${gateway.id}`, {
        method: 'PATCH',
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      toast({ title: `${gateway.name} settings saved!`, description: "Everything is good ✅" });
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Error', description: 'Could not save settings.' });
    }
  };

  const style = gatewayStyles[gateway.provider] || {
    color: 'from-gray-400 to-gray-600',
    icon: <CreditCard className="w-6 h-6 text-white" />,
    logo: <CreditCard className="w-12 h-12 text-white" />
  };

  return (
    <Card className="relative overflow-hidden rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 border-0">
      {/* Gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-r ${style.color} opacity-20 blur-2xl`} />
      <CardHeader className="relative z-10 flex flex-col md:flex-row md:items-center gap-4">
        {/* Logo */}
        <div className="flex-shrink-0">{style.logo}</div>
        {/* Title + status */}
        <div className="flex-1 space-y-1">
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            {gateway.name}
            <span className={clsx('text-sm font-medium px-2 py-1 rounded-full', gateway.isEnabled ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
              {gateway.isEnabled ? 'Active' : 'Disabled'}
            </span>
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300 flex items-center gap-2">
            {style.icon}
            Configure this gateway’s credentials and modes.
          </CardDescription>
        </div>
      </CardHeader>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="relative z-10 space-y-6 mt-4">
            <FormField
              control={form.control}
              name="isEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="font-medium">Enable Gateway</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            {gateway.provider === 'SELCOM' && (
              <FormField
                control={form.control}
                name="vendor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vendor ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Selcom Vendor ID" {...field} className="border-indigo-300 focus:border-indigo-500 focus:ring-indigo-200" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter API Key" {...field} className="border-blue-300 focus:border-blue-500 focus:ring-blue-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="apiSecret"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Secret</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter API Secret" {...field} className="border-purple-300 focus:border-purple-500 focus:ring-purple-200" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isLiveMode"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between">
                  <FormLabel className="font-medium">Live Mode</FormLabel>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <span className={clsx('ml-3 text-sm font-medium', field.value ? 'text-green-600' : 'text-gray-400')}>
                    {field.value ? 'Live' : 'Sandbox'}
                  </span>
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="relative z-10 flex justify-end">
            <LoadingButton
              type="submit"
              disabled={form.formState.isSubmitting}
              className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white px-6 py-2 rounded-xl hover:scale-105 transition-transform shadow-lg"
            >
              {form.formState.isSubmitting ? 'Saving...' : 'Save Settings'}
            </LoadingButton>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
