import { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://saragea.com";

  // 1. Static Routes (These always work, even without a DB)
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/about",
    "/contact",
    "/properties",
    "/faq",
    "/privacy",
    "/terms",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // 2. Dynamic Property Routes (Wrapped in try-catch for Build Safety)
  try {
    const properties = await prisma.property.findMany({
      select: { id: true, updatedAt: true },
    });

    const propertyRoutes = properties.map((prop) => ({
      url: `${baseUrl}/property/${prop.id}`,
      lastModified: prop.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...staticRoutes, ...propertyRoutes];
  } catch (error) {
    // During 'npm run build' in Docker, the DB is unreachable.
    // We log a warning and return only the static routes so the build finishes.
    console.warn(
      "⚠️ Sitemap Generation: Database unreachable during build. Skipping dynamic property routes."
    );
    return staticRoutes;
  }
}
