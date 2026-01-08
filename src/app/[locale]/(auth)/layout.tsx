"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Building2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background overflow-hidden">
      {/* --- Left Column: Cinematic Visual (Hidden on mobile) --- */}
      <div className="hidden lg:flex relative bg-zinc-950 items-center justify-center p-12 overflow-hidden">
        {/* Animated background patterns */}
        <div className="absolute inset-0 opacity-20 bg-[url('/assets/patterns/grid.jpg')] bg-center [mask-image:linear-gradient(to_bottom,white,transparent)]" />

        {/* Floating Orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], rotate: [0, -90, 0] }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"
        />

        <div className="relative z-10 max-w-lg">
          <Link href="/" className="flex items-center gap-2 mb-12 group">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 group-hover:scale-110 transition-transform">
              <Building2 className="h-8 w-8 text-white" />
            </div>
            <span className="text-3xl font-black text-white tracking-tighter">
              SARAGEA
            </span>
          </Link>

          <h2 className="text-5xl font-black text-white leading-tight mb-6">
            Your journey to a{" "}
            <span className="text-primary text-shadow-sm text-shadow-primary">
              perfect home
            </span>{" "}
            starts here.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Join thousands of happy tenants who have found their dream spaces
            through our seamless platform.
          </p>
        </div>
      </div>

      {/* --- Right Column: The Form Container --- */}
      <main className="relative flex items-center justify-center p-6 md:p-12">
        {/* Back button for mobile/desktop */}
        <Button
          variant="ghost"
          asChild
          className="absolute top-8 left-8 rounded-full text-muted-foreground hover:text-foreground"
        >
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to website
          </Link>
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {children}
        </motion.div>

        {/* Branding for mobile only */}
        <div className="absolute bottom-8 lg:hidden flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">SARAGEA</span>
        </div>
      </main>
    </div>
  );
}
