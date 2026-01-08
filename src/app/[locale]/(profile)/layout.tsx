"use client";

import Link from "next/link";
import { ArrowLeft, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import UserNav from "@/components/shared/UserNav";
import { Toaster } from "@/components/ui/sonner";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      {/* Minimal Header */}
      <header className="fixed top-0 w-full h-16 z-50 px-6 flex items-center justify-between bg-black/20 backdrop-blur-md border-b border-white/10 text-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="text-white hover:bg-white/20 rounded-full"
          >
            <Link href="/dashboard">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <span className="font-bold tracking-tight flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" /> SARAGEA
          </span>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <UserNav />
        </div>
      </header>

      <main className="pt-0">
        <Toaster />
        {children}
      </main>
    </div>
  );
}
