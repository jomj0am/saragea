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
import { Mail, Key, ArrowLeft, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// --- Schemas ---
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password is required." }),
});

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function LoginForm() {
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const [view, setView] = useState<"login" | "forgot-password">("login");
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  // Forms
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const forgotForm = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  // --- Handlers ---
  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    setIsLoading("credentials");
    try {
      const result = await signIn("credentials", {
        ...values,
        redirect: false,
      });

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
    } finally {
      setIsLoading(null);
    }
  };

  const onForgotSubmit = async (
    values: z.infer<typeof forgotPasswordSchema>
  ) => {
    setIsLoading("forgot");
    try {
      // Logic for password reset (e.g., calling your /api/auth/reset-password)
      // For now, using NextAuth email provider or dummy success
      console.log("Sending reset link to:", values.email);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "Reset link sent! 📧",
        description:
          "If an account exists with that email, you will receive a reset link shortly.",
      });
      setView("login"); // Return to login
    } finally {
      setIsLoading(null);
    }
  };

  const handleSocialLogin = (provider: "google" | "facebook" | "apple") => {
    setIsLoading(provider);
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="relative overflow-hidden min-h-[400px]">
      <AnimatePresence mode="wait">
        {/* --- VIEW: LOGIN --- */}
        {view === "login" && (
          <motion.div
            key="login-view"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="name@example.com"
                            className="pl-10 h-12 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={loginForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>Password</FormLabel>
                        <button
                          type="button"
                          onClick={() => setView("forgot-password")}
                          className="text-xs text-primary hover:underline font-bold"
                        >
                          Forgot password?
                        </button>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            type="password"
                            placeholder="••••••••"
                            className="pl-10 h-12 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <LoadingButton
                  type="submit"
                  loading={isLoading === "credentials"}
                  className="w-full h-12 rounded-xl text-base font-bold shadow-lg bg-primary hover:bg-primary/90"
                >
                  Sign In
                </LoadingButton>
              </form>
            </Form>

            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-muted" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <Button
                variant="outline"
                className="h-12 rounded-xl"
                onClick={() => handleSocialLogin("google")}
                disabled={!!isLoading}
              >
                <FcGoogle className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl"
                onClick={() => handleSocialLogin("facebook")}
                disabled={!!isLoading}
              >
                <FaFacebook className="h-5 w-5 text-blue-600" />
              </Button>
              <Button
                variant="outline"
                className="h-12 rounded-xl"
                onClick={() => handleSocialLogin("apple")}
                disabled={!!isLoading}
              >
                <FaApple className="h-5 w-5" />
              </Button>
            </div>
          </motion.div>
        )}

        {/* --- VIEW: FORGOT PASSWORD --- */}
        {view === "forgot-password" && (
          <motion.div
            key="forgot-view"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">Reset Password</h2>
              <p className="text-sm text-muted-foreground">
                Enter your email and we&apos;ll send you a link to get back into
                your account.
              </p>
            </div>

            <Form {...forgotForm}>
              <form
                onSubmit={forgotForm.handleSubmit(onForgotSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            placeholder="name@example.com"
                            className="pl-10 h-12 rounded-xl"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-3">
                  <LoadingButton
                    type="submit"
                    loading={isLoading === "forgot"}
                    className="w-full h-12 rounded-xl text-base font-bold shadow-lg"
                  >
                    <Send className="mr-2 h-4 w-4" /> Send Reset Link
                  </LoadingButton>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setView("login")}
                    className="h-12 rounded-xl"
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" /> Back to Login
                  </Button>
                </div>
              </form>
            </Form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
