// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { LoadingButton } from "@/components/ui/loading-button";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { FaApple, FaFacebook } from "react-icons/fa";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Zod schemas
const passwordLoginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});
const magicLinkSchema = z.object({
  email: z
    .string()
    .email({ message: "Enter a valid email to receive a link." }),
});

export default function LoginForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [view, setView] = useState<"main" | "magiclink">("main");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // forms
  const passwordForm = useForm<z.infer<typeof passwordLoginSchema>>({
    resolver: zodResolver(passwordLoginSchema),
    defaultValues: { email: "", password: "" },
  });
  const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: "" },
  });

  // handlers
  const onPasswordSubmit = async (
    values: z.infer<typeof passwordLoginSchema>
  ) => {
    setIsLoading("password");
    const result = await signIn("credentials", { ...values, redirect: false });
    setIsLoading(null);
    if (result?.error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid email or password.",
      });
    } else {
      toast({ title: "Welcome back!" });
      window.location.href = callbackUrl;
    }
  };

  const onMagicLinkSubmit = async (values: z.infer<typeof magicLinkSchema>) => {
    setIsLoading("magiclink");
    await signIn("email", {
      email: values.email,
      redirect: false,
      callbackUrl,
    });
    setIsLoading(null);
    toast({
      title: "Magic Link Sent ✨",
      description: "Check your inbox for a password-free login link.",
    });
  };

  const handleSocialLogin = (provider: "google" | "facebook" | "apple") => {
    setIsLoading(provider);
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        {view === "main" && (
          <motion.div
            key="main"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="
              space-y-6 p-6 rounded-2xl
              bg-gradient-to-br from-white/70 to-white/40
              dark:from-zinc-900/80 dark:to-zinc-800/50
              backdrop-blur-2xl shadow-xl
            "
          >
            {/* Email / Password login */}
            <Form {...passwordForm}>
              <form
                onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={passwordForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          className="rounded-xl focus:ring-2 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          className="rounded-xl focus:ring-2 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="text-right">
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="p-0 h-auto text-indigo-500 hover:text-indigo-600"
                    onClick={() => setView("magiclink")}
                  >
                    Forgot password?
                  </Button>
                </div>
                <LoadingButton
                  type="submit"
                  loading={isLoading === "password"}
                  className="
                    w-full rounded-xl
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    text-white shadow-md hover:shadow-lg
                  "
                >
                  Sign In
                </LoadingButton>
              </form>
            </Form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/30 dark:border-zinc-600/30" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white/60 dark:bg-zinc-900/60 px-3 text-xs uppercase text-muted-foreground rounded-full">
                  Or continue with
                </span>
              </div>
            </div>

            {/* Social buttons */}
            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("google")}
                disabled={!!isLoading}
                className="rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/60"
              >
                {isLoading === "google" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FcGoogle className="h-5 w-5" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("facebook")}
                disabled={!!isLoading}
                className="rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/60"
              >
                {isLoading === "facebook" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FaFacebook className="h-5 w-5 text-blue-600" />
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleSocialLogin("apple")}
                disabled={!!isLoading}
                className="rounded-xl hover:bg-white/60 dark:hover:bg-zinc-800/60"
              >
                {isLoading === "apple" ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <FaApple className="h-5 w-5" />
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {view === "magiclink" && (
          <motion.div
            key="magiclink"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="
              space-y-6 p-6 rounded-2xl
              bg-gradient-to-br from-white/70 to-white/40
              dark:from-zinc-900/80 dark:to-zinc-800/50
              backdrop-blur-2xl shadow-xl
            "
          >
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setView("main")}
              className="flex items-center gap-1 text-indigo-500 hover:text-indigo-600"
            >
              <ArrowLeft className="h-4 w-4" /> Back to login
            </Button>
            <p className="text-sm text-center text-muted-foreground">
              Enter your email to get a password-free magic link ✨
            </p>
            <Form {...magicLinkForm}>
              <form
                onSubmit={magicLinkForm.handleSubmit(onMagicLinkSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={magicLinkForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="you@example.com"
                          className="rounded-xl focus:ring-2 focus:ring-indigo-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoadingButton
                  type="submit"
                  loading={isLoading === "magiclink"}
                  className="
                    w-full rounded-xl
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    text-white shadow-md hover:shadow-lg
                  "
                >
                  <Mail className="mr-2 h-4 w-4" /> Send Magic Link
                </LoadingButton>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
