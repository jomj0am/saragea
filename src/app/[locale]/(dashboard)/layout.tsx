"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  FileText,
  Wrench,
  User,
  LogOut,
  Heart,
  ArrowLeft,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/shared/ThemeSwitcher";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Toaster } from "@/components/ui/sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import UserNav from "@/components/shared/UserNav";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navItems = [
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/documents", label: "Documents", icon: FileText },
    { href: "/dashboard/messages", label: "Messages", icon: Wrench }, // Changed icon to match context better if possible
    { href: "/saved", label: "Saved Homes", icon: Heart },
    { href: "/profile", label: "Profile", icon: User },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="h-16 flex items-center px-6 border-b">
        <Link
          href="/"
          className="flex items-center gap-2 font-black text-xl tracking-tighter group"
        >
          <div className="p-1.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
            SARAGEA
          </span>
        </Link>
      </div>

      <ScrollArea className="flex-1 py-6 px-4">
        <div className="space-y-6">
          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Menu
            </p>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group font-medium text-sm",
                    isActive
                      ? "bg-primary text-white shadow-lg shadow-primary/25"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive ? "text-white" : "group-hover:text-primary"
                    )}
                  />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="space-y-1">
            <p className="px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Shortcuts
            </p>
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground text-sm font-medium transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Website
            </Link>
            <Link
              href="/faq"
              className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground text-sm font-medium transition-colors"
            >
              <HelpCircle className="h-4 w-4" /> Help Center
            </Link>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-muted/20">
        <Button
          variant="ghost"
          className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* --- Main Content Area --- */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="h-16  bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md sticky top-0 z-40 flex items-center">
          <div className="flex w-full justify-between items-center max-w-5xl mx-auto  px-4 md:px-8">
            <div className="flex items-center gap-1">
              {/* Mobile Menu Trigger */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-gray-500/10 hover:scale-105 transition-transform"
                  >
                    <LayoutDashboard className="h-6 w-6 fill-secondary" />
                  </Button>
                </DropdownMenuTrigger>

                <AnimatePresence>
                  <DropdownMenuContent
                    side="bottom"
                    align="start"
                    forceMount
                    asChild
                    className="w-[320px] h-[65vh] rounded-2xl border border-zinc-200/30 bg-background/80 dark:bg-gray-500/30 backdrop-blur-sm shadow-2xl p-0"
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -8, scale: 0.97 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: -6, scale: 0.97 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="h-full flex flex-col"
                    >
                      <SidebarContent />
                    </motion.div>
                  </DropdownMenuContent>
                </AnimatePresence>
              </DropdownMenu>
              <h2 className="font-semibold text-lg  md:block">Dashboard</h2>
            </div>

            <div className="flex items-center gap-3">
              <ThemeSwitcher />
              <div className="h-6 w-px bg-border  sm:block" />
              <UserNav />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-5xl mx-auto w-full animate-in fade-in-50 duration-500">
          <Toaster />
          {children}
        </main>

        {/* Minimal Dashboard Footer */}
        <footer className="py-6 text-center text-xs text-muted-foreground border-t bg-white/50 dark:bg-zinc-900/50">
          <div className="flex justify-center gap-4 mb-2">
            <Link href="/privacy" className="hover:underline">
              Privacy
            </Link>
            <Link href="/terms" className="hover:underline">
              Terms
            </Link>
            <Link href="/contact" className="hover:underline">
              Support
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} SARAGEA. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
