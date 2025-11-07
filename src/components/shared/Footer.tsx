// components/shared/Footer.tsx
import Link from "next/link";
import {
  Building2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
} from "lucide-react";
import Spline from "@splinetool/react-spline";

export default function Footer() {
  return (
    <footer className="relative -mt-2 overflow-hidden">
      {/* --- Background Spline --- */}
      <div className="absolute inset-0 z-0">
             <div className=" dark:opacity-30">
                <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
            </div>
            
            <div className="absolute inset-0 bg-gradient-to-tr from-secondary/90 via-secondary/80 to-secondary/60 backdrop-blur-sm dark:from-gray-950/80 dark:via-slate-950/80 dark:to-black/80" />
      </div>

      {/* --- Main Content --- */}
      <div className="relative z-10 container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

          {/* About */}
          <div className="flex flex-col gap-4">
            <Link href="/" className="flex items-center gap-2 font-bold text-2xl">
              <Building2 className="h-7 w-7 text-primary" />
              <span>SARAGEA</span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Your one-stop solution for finding and managing rental
              properties with ease and confidence.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Quick Links</h3>
            <ul className="space-y-2">
              {[
                { href: "/properties", label: "All Properties" },
                { href: "/about", label: "About Us" },
                { href: "/contact", label: "Contact" },
                { href: "/faq", label: "FAQ" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold mb-4 text-primary">Connect With Us</h3>
            <div className="flex items-center gap-5">
              <Link
                href="#"
                aria-label="Instagram"
                className="hover:scale-110 transition-transform"
              >
                <Instagram className="h-6 w-6 text-pink-500" />
              </Link>
              <Link
                href="#"
                aria-label="Facebook"
                className="hover:scale-110 transition-transform"
              >
                <Facebook className="h-6 w-6 text-blue-600" />
              </Link>
              <Link
                href="#"
                aria-label="LinkedIn"
                className="hover:scale-110 transition-transform"
              >
                <Linkedin className="h-6 w-6 text-sky-700" />
              </Link>
              <Link
                href="#"
                aria-label="X / Twitter"
                className="hover:scale-110 transition-transform"
              >
                <Twitter className="h-6 w-6 text-black dark:text-white" />
              </Link>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="mt-12 border-t border-primary/10 pt-6 flex  md:flex-row items-center justify-between text-sm text-muted-foreground gap-4">
          <p>&copy; {new Date().getFullYear()} SARAGEA.<br className="md:hidden"/> All rights reserved.</p>

          {/* G-Nexus Block */}
          <div className="flex flex-col items-center text-center ">
            <span className="text-4xl">🦍</span>
            <span className="text-[8px] uppercase tracking-widest">
              Powered by
            </span>
            <span className="text-[14px] text-center text-shadow-xs -pt-2 text-shadow-black font-bold drop-shadow-sm">
              G-Nexus
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
