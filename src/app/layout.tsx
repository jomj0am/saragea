// src/app/layout.tsx
import { Metadata, Viewport } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import "maplibre-gl/dist/maplibre-gl.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // 🧠 App identity
  applicationName: "SARAGEA",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",

  // 🧾 Titles
  title: {
    default: "SARAGEA – Find Your Perfect Home",
    template: "%s | SARAGEA Apartments",
  },

  // 📝 SEO basics
  description:
    "The best platform for managing, renting, and discovering apartments.",
  keywords: [
    "apartments for rent",
    "real estate platform",
    "property management system",
    "apartment management system",
    "tenant management",
    "landlord tools",
    "housing platform",
    "SARAGEA",
    "SARAGEA apartments",
    "apartments in Tanzania",
    "Tanzania apartment rentals",
    "Dodoma apartments",
    "apartments for rent in Dodoma",
    "find apartments Tanzania",
    "rent apartments online",
    "manage rental properties",
    "tenant communication",
    "maintenance requests",
    "lease management",
    "rental listings",
    "property search",
  ],

  authors: [{ name: "SARAGEA Team" }],
  creator: "SARAGEA",
  publisher: "SARAGEA",

  // 🌍 URLs
  metadataBase: new URL("https://saragea.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "sw-TZ": "/sw",
    },
  },

  // 🤖 Search engine behavior
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  // 📱 PWA
  manifest: "/manifest.json",

  // 🍎 Apple
  appleWebApp: {
    capable: true,
    title: "SARAGEA",
    statusBarStyle: "default",
  },

  // 📣 Open Graph (Facebook, WhatsApp, LinkedIn)
  openGraph: {
    type: "website",
    siteName: "SARAGEA",
    title: "SARAGEA – Find Your Perfect Home",
    description: "Manage and rent apartments effortlessly with SARAGEA.",
    url: "https://saragea.com",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SARAGEA Apartments",
      },
    ],
  },

  // 🐦 Twitter / X
  twitter: {
    card: "summary_large_image",
    title: "SARAGEA – Find Your Perfect Home",
    description: "Smart apartment discovery and management platform.",
    images: ["/og-image.png"],
    creator: "@saragea",
  },

  // 🧩 Icons
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: ["/favicon.ico"],
  },

  // 🔐 Security / privacy hints
  other: {
    "color-scheme": "light dark",
  },
};

export const viewport: Viewport = {
  themeColor: "#4F46E5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
