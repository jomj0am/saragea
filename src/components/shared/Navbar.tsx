"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Building2,
  Home,
  Info,
  Phone,
  Landmark,
  LogOut,
  LogIn,
  UserPlus
} from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useEffect, useState } from "react"
import UserNav from "./UserNav"
import CartNav from "./CartNav"
import LanguageSwitcher from "./LanguageSwitcher"
import { ThemeSwitcher } from "./ThemeSwitcher"
import { motion } from "framer-motion"
import { useAuthModalStore } from "@/store/auth-modal-store"
import { useTranslations } from "next-intl"

export default function Navbar() {
  const { data: session, status } = useSession()
  const [scrolled, setScrolled] = useState(false)
  const { openModal } = useAuthModalStore()
  const t = useTranslations("Navbar")

  const navLinks = [
    { href: "/", label: t("home"), icon: Home, color: "text-blue-500" },
    { href: "/properties", label: t("properties"), icon: Landmark, color: "text-emerald-500" },
    { href: "/about", label: t("about"), icon: Info, color: "text-purple-500" },
    { href: "/contact", label: t("contact"), icon: Phone, color: "text-pink-500" },
  ]

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300
        ${scrolled
          ? "border-b border-border/40 bg-background/80 backdrop-blur-lg"
          : "border-b border-transparent bg-transparent"}
      `}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 font-extrabold text-lg tracking-tight"
        >
          <motion.div
            initial={{ rotate: -15, scale: 0.9 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
          >
            <Building2 className="h-6 w-6 text-primary" />
          </motion.div>
          <span className="hidden sm:inline-block bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
            SARAGEA
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-6">
          {navLinks.map(({ href, label }) => (
            <motion.div key={href} whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 300 }}>
              <Link
                href={href}
                className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                {label}
              </Link>
            </motion.div>
          ))}
        </nav>

        {/* Right-side actions */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />

          {status === "loading" ? (
            <div className="h-10 w-24 rounded-md bg-muted animate-pulse" />
          ) : session ? (
            <div className="flex items-center gap-2">
              <CartNav />
              <UserNav />
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" onClick={() => openModal("login")}>Log In</Button>
              <Button onClick={() => openModal("register")}>Sign Up</Button>
            </div>
          )}

          {/* Mobile Menu */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full hover:scale-105 transition-transform"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>

              <SheetContent
                side="right"
                className="bg-background/95 backdrop-blur-xl flex flex-col justify-between p-0"
              >
                {/* Top section */}
                <div className="p-6 space-y-8">
                  <Link href="/" className="flex items-center gap-2 font-extrabold text-lg tracking-tight">
                    <Building2 className="h-6 w-6 text-primary" />
                    <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                      SARAGEA
                    </span>
                  </Link>

                  {/* Nav links w/ icons + color */}
                  <nav className="grid gap-4">
                    {navLinks.map(({ href, label, icon: Icon, color }) => (
                      <Link
                        key={href}
                        href={href}
                        className="flex items-center gap-3 text-lg font-medium text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Icon className={`h-5 w-5 ${color}`} />
                        {label}
                      </Link>
                    ))}
                  </nav>
                </div>

                {/* Sticky bottom auth actions */}
                <div className="sticky bottom-0 w-full border-t border-border/40 bg-background/90 backdrop-blur-md p-6 flex flex-col gap-3">
                  {status === "loading" ? (
                    <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                  ) : session ? (
                    <Button
                      variant="destructive"
                      onClick={() => signOut()}
                      className="flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Log Out
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => openModal("login")}
                        className="flex items-center justify-center gap-2"
                      >
                        <LogIn className="h-4 w-4 text-blue-500" />
                        Log In
                      </Button>
                      <Button
                        onClick={() => openModal("register")}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                      >
                        <UserPlus className="h-4 w-4" />
                        Sign Up
                      </Button>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
