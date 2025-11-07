'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Menu, X, Building2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { ThemeSwitcher } from '../../shared/ThemeSwitcher';
import UserNav from '../../shared/UserNav';

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false)

    useEffect(() => {
      const handleScroll = () => {
        // Set scrolled to true if user has scrolled more than 10px, false otherwise
        setScrolled(window.scrollY > 20);
      };
  
      // Add listener when the component mounts
      window.addEventListener("scroll", handleScroll);
  
      // Clean up the listener when the component unmounts
      return () => {
        window.removeEventListener("scroll", handleScroll);
      };
    }, []);
  
  return (
    <>
      {/* 🔝 Top bar visible only on mobile */}
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-in-out flex justify-between p-3 sm:px-6 md:px-10 lg:hidden
        ${
          scrolled
            ? "border-b border-border/40 bg-background/80 backdrop-blur-lg"
            : "border-b border-transparent bg-transparent"
        }
      `}
    >        {/* Logo / Brand */}
        <Link
          href="/admin"
          className="flex items-center gap-2 font-bold text-lg tracking-wide"
        >
          <Building2 className="h-6 w-6 text-primary" />
          <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Admin Panel
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
                        <UserNav />
          
          {/* Hamburger */}
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-full bg-zinc-200 shadow-md dark:bg-zinc-700 hover:bg-primary/10 transition"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* 🏠 Slide-in drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 dark:bg-white/20 backdrop-blur-sm z-50"
            onClick={() => setOpen(false)}
          />
          {/* Drawer */}
          <aside
            className="fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-background/95 to-background/80 backdrop-blur-xl shadow-xl z-50 transform transition-transform duration-300 ease-out"
          >
            <div className="flex justify-between items-center h-16 px-5 border-b border-white/10">
              <span className="font-bold text-primary text-2xl">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-2xl bg-primary/5 hover:bg-primary/10 transition"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            {/* Reuse the Sidebar nav items */}
            <div
              onClick={() => setOpen(false)}
              className="overflow-y-auto h-screen"
            >
              <Sidebar />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
