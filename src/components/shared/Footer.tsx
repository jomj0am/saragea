import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  Building2,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import FooterSpline from "./FooterSpline"; // We will extract this

// Define the shape of our contact settings
type ContactSettings = {
  contactDetails?: {
    address?: string;
    phone1?: string;
    email?: string;
  };
  social?: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
    twitter?: string;
  };
};

async function getFooterData() {
  const settings = await prisma.setting.findUnique({
    where: { id: "page.contact" },
  });
  // Add default fallbacks
  const data = (settings?.jsonContent as ContactSettings) || {};
  return {
    address: data.contactDetails?.address || "Masaki, Dar es Salaam",
    phone: data.contactDetails?.phone1 || "+255 700 000 000",
    email: data.contactDetails?.email || "info@saragea.com",
    social: {
      instagram: data.social?.instagram || "#",
      facebook: data.social?.facebook || "#",
      linkedin: data.social?.linkedin || "#",
      twitter: data.social?.twitter || "#",
    },
  };
}

export default async function Footer() {
  const data = await getFooterData();

  return (
    <footer className="relative mt-0 overflow-hidden bg-background border-t border-border/40">
      {/* --- Background Spline (Client Component) --- */}
      <FooterSpline />

      {/* --- Main Content --- */}
      <div className="relative z-10 container mx-auto px-6 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* 1. Brand & Bio */}
          <div className="flex flex-col gap-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <span className="font-black text-2xl tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                SARAGEA
              </span>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
              Redefining modern living in Tanzania. We provide a seamless,
              secure, and premium rental experience tailored to your lifestyle.
            </p>

            {/* Social Icons Row */}
            <div className="flex items-center gap-4 mt-2">
              {[
                {
                  icon: Instagram,
                  href: data.social.instagram,
                  color: "hover:text-pink-500",
                },
                {
                  icon: Facebook,
                  href: data.social.facebook,
                  color: "hover:text-blue-600",
                },
                {
                  icon: Linkedin,
                  href: data.social.linkedin,
                  color: "hover:text-sky-700",
                },
                {
                  icon: Twitter,
                  href: data.social.twitter,
                  color: "hover:text-foreground",
                },
              ].map((S, i) => (
                <Link
                  key={i}
                  href={S.href}
                  target="_blank"
                  className={`p-2 rounded-full bg-secondary/50 hover:bg-secondary transition-all transform hover:-translate-y-1 ${S.color}`}
                >
                  <S.icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* 2. Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-6">Explore</h3>
            <ul className="space-y-4">
              {[
                { href: "/properties", label: "Find a Home" },
                { href: "/about", label: "Our Story" },
                { href: "/contact", label: "Get in Touch" },
                { href: "/faq", label: "Help Center" },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 group-hover:bg-primary transition-colors" />
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* 3. Contact Info (New) */}
          <div>
            <h3 className="font-bold text-lg mb-6">Contact</h3>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <span>{data.address}</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`tel:${data.phone}`}
                  className="hover:text-primary transition-colors"
                >
                  {data.phone}
                </a>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <a
                  href={`mailto:${data.email}`}
                  className="hover:text-primary transition-colors"
                >
                  {data.email}
                </a>
              </li>
            </ul>
          </div>

          {/* 4. Legal & Newsletter */}
          <div>
            <h3 className="font-bold text-lg mb-6">Legal</h3>
            <ul className="space-y-4 mb-8">
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

            {/* Newsletter / CTA Box */}
            <div className="bg-secondary/50 p-4 rounded-2xl border border-border/50">
              <p className="text-xs font-medium mb-3">
                Subscribe to our updates
              </p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email..."
                  className="bg-background rounded-lg px-3 py-2 text-xs w-full border border-input focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary text-primary-foreground rounded-lg px-3 py-2 text-xs font-bold hover:bg-primary/90 transition-colors">
                  GO
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- Bottom Bar --- */}
        <div className="mt-16 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-6 text-sm text-muted-foreground/60">
          <p>
            &copy; {new Date().getFullYear()} SARAGEA Apartments. All rights
            reserved.
          </p>

          {/* G-Nexus Branding (Premium Style) */}
          <div className="flex items-center gap-3 group cursor-default">
            <span className="text-xs uppercase tracking-widest opacity-70 group-hover:opacity-100 transition-opacity">
              Powered by
            </span>
            <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 px-3 py-1.5 rounded-full border border-transparent group-hover:border-primary/20 transition-all">
              <span className="text-xl filter grayscale group-hover:grayscale-0 transition-all">
                🦍
              </span>
              <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                G-Nexus
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
