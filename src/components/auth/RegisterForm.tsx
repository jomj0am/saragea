// components/auth/RegisterForm.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/components/ui/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { LoadingButton } from '@/components/ui/loading-button';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { FaApple, FaFacebook } from 'react-icons/fa';
import { Loader2, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

// Validation schema
const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function RegisterForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<'register' | 'google' | 'facebook' |'apple'| null>(null);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    setIsLoading('register');
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Something went wrong');

      toast({
        title: 'Registration Successful 🎉',
        description: 'Welcome aboard! Redirecting to your dashboard…',
      });

      await signIn('credentials', {
        email: values.email,
        password: values.password,
        redirect: true,
        callbackUrl: '/dashboard',
      });
    } catch (err: unknown) {
    let message = 'Something went wrong';
    if (err instanceof Error) {
      message = err.message;
    } else if (typeof err === 'string') {
      message = err;
    }

    toast({
      variant: 'destructive',
      title: 'Registration Failed',
      description: message,
    });
    } finally {
      setIsLoading(null);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'facebook' |'apple') => {
    setIsLoading(provider);
    signIn(provider, { callbackUrl: '/dashboard' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6 rounded-xl bg-card/40 p-6 backdrop-blur-md shadow-xl
                 ring-1 ring-border sm:p-8"
    >
      {/* Header */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl font-bold tracking-tight flex items-center justify-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          Create an Account
        </h2>
        <p className="text-sm text-muted-foreground">
          Join the party and start exploring right away
        </p>
      </div>

      {/* Register Form */}
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Full Name"
                    {...field}
                    className="rounded-lg border-muted focus:ring-2 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    placeholder="Email"
                    type="email"
                    {...field}
                    className="rounded-lg border-muted focus:ring-2 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Password"
                    {...field}
                    className="rounded-lg border-muted focus:ring-2 focus:ring-primary"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <LoadingButton
            type="submit"
            loading={isLoading === 'register'}
            className="w-full rounded-lg text-base font-medium shadow-sm
                       transition-all hover:scale-[1.02]"
          >
            Create Account
          </LoadingButton>
        </form>
      </Form>

      {/* Divider */}
      <div className="relative flex justify-center text-xs uppercase text-muted-foreground">
        <span className="bg-background px-3">Or sign up with</span>
        <span className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t border-border"></span>
      </div>

      {/* Social Logins */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('google')}
          disabled={!!isLoading}
          className="flex items-center justify-center  gap-2 rounded-lg transition hover:scale-[1.02]"
        >
          {isLoading === 'google' ? (
            <Loader2 className="h-8 w-8 animate-spin" />
          ) : (
            <FcGoogle className="!h-8 w-8" />
          )}
        </Button>
        <Button
          variant="outline"
          onClick={() => handleSocialLogin('facebook')}
          disabled={!!isLoading}
          className="flex items-center justify-center gap-2 rounded-lg transition hover:scale-[1.02]"
        >
          {isLoading === 'facebook' ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <FaFacebook className="h-8 w-8 text-blue-600" />
          )}
        </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleSocialLogin('apple')}
                        disabled={!!isLoading}
                        className="rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/60"
                      >
                        {isLoading === 'apple' ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          <FaApple className="h-8 w-8" />
                        )}
                      </Button>
      </div>
    </motion.div>
  );
}
