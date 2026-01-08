// app/[locale]/(main)/page.tsx
import { prisma } from "@/lib/prisma";

// Import all sections
import HeroSection from "@/components/landing/HeroSection";
import ShopByLifestyleSection, {
  LifestyleCategory,
} from "@/components/landing/ShopByLifestyleSection";
import FeaturedProperties from "@/components/landing/FeaturedProperties";
import Interactive3DPreview from "@/components/landing/Interactive3DPreview";
import WhyChooseUs from "@/components/landing/WhyChooseUs";
import RecentlyViewedSection from "@/components/landing/RecentlyViewedSection";
import CtaSection from "@/components/landing/CtaSection";
import { type Prisma } from "@prisma/client";
import InteractiveMapSection from "@/components/landing/InteractiveMapSection";

type HomepageContent = {
  settings: {
    heroEnabled: boolean;
    lifestyleEnabled: boolean;
    featuredEnabled: boolean;
    threeDEnabled: boolean;
    whyUsEnabled: boolean;
    mapEnabled: boolean;
    testimonialsEnabled: boolean;
    ctaEnabled: boolean;
  };
  content: {
    hero: {
      splineUrl: string;
    };
    lifestyle: LifestyleCategory[];
    testimonials: {
      name: string;
      locationKey: string;
      quoteKey: string;
      avatarUrl: string;
    }[];
    features: {
      titleKey: string;
      descKey: string;
      lottieFile: string;
    }[];
  };
};
// Define a comprehensive type for our properties
type PropertyWithDetails = Prisma.PropertyGetPayload<{
  include: {
    rooms: { where: { isOccupied: false } };
    _count: { select: { rooms: true } };
  };
}>;

/**
 * Main data fetching function for the homepage.
 * It gets all settings, content, and dynamic data in one go.
 */
async function getHomepageData() {
  const settingsData = await prisma.setting.findUnique({
    where: { id: "page.home" },
  });

  // Default settings in case none are in the DB
  const defaultContent: HomepageContent = {
    settings: {
      heroEnabled: true,
      lifestyleEnabled: true,
      featuredEnabled: true,
      threeDEnabled: true,
      whyUsEnabled: true,
      mapEnabled: true,
      testimonialsEnabled: true,
      ctaEnabled: true,
    },
    content: {
      hero: { splineUrl: "" },
      lifestyle: [], // We pass empty here, component handles defaults if empty

      testimonials: [],
      features: [],
    },
  };

  const jsonContent = {
    ...defaultContent,
    ...(settingsData?.jsonContent as Partial<HomepageContent>),
    settings: {
      ...defaultContent.settings,
      ...(settingsData?.jsonContent as Partial<HomepageContent>)?.settings,
    },
    content: {
      ...defaultContent.content,
      ...(settingsData?.jsonContent as Partial<HomepageContent>)?.content,
    },
  };

  // Fetch featured properties only if the section is enabled
  let featuredProperties: PropertyWithDetails[] = [];
  if (jsonContent.settings.featuredEnabled) {
    featuredProperties = await prisma.property.findMany({
      take: 6,
      where: { images: { isEmpty: false } },
      include: {
        rooms: { where: { isOccupied: false } },
        _count: { select: { rooms: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  return {
    settings: jsonContent.settings,
    content: jsonContent.content,
    featuredProperties,
  };
}

export default async function HomePage() {
  const { settings, featuredProperties, content } = await getHomepageData();

  return (
    <div className="overflow-x-hidden bg-background -mt-16">
      {/* Each section is conditionally rendered based on CMS settings */}

      {settings.heroEnabled && <HeroSection />}

      {settings.lifestyleEnabled && (
        <ShopByLifestyleSection categories={content.lifestyle} />
      )}
      {settings.featuredEnabled && (
        <FeaturedProperties properties={featuredProperties} />
      )}

      {settings.threeDEnabled && <Interactive3DPreview />}

      {settings.whyUsEnabled && <WhyChooseUs />}

      {settings.mapEnabled && <InteractiveMapSection />}

      {/* RecentlyViewedSection is a client component that fetches its own data */}
      <RecentlyViewedSection />

      {settings.ctaEnabled && <CtaSection />}
    </div>
  );
}
