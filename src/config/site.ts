// src/config/site.ts
export type SiteConfig = typeof siteConfig

export const siteConfig = {
  name: "G-Nexus",
  description: "The Decentralized Venture Ecosystem.",
  mainNav: [
    { title: "Home", href: "/" },
    { title: "Apartments", href: "/properties" },
    { title: "About Us", href: "/about" },
    { title: "Contact", href: "/contacts" },
  ],
}