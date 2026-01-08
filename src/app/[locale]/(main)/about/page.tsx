// app/[locale]/(main)/about/page.tsx
import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import HowItWorksSection from "@/components/about/HowItWorksSection";
import {
  ComfortLottie,
  HandLottie,
  SecurityLottie,
} from "@/components/about/AboutLotties";
import { BackgroundBlobs } from "../contact/page";
import AdvancedImageComposition from "./imagesComposition";
import AboutHero from "./abothero";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // You can fetch translations here if you want localized metadata titles
  // For now, we'll use English as base or static strings
  const title = "About SARAGEA | Modern Living, Managed with Heart";
  const description =
    "Discover the story behind SARAGEA Apartments. We blend premium real estate with cutting-edge technology to provide a seamless living experience in Tanzania.";
  const url = `https://saragea.com/${locale}/about`;

  // Use a high-quality image from your public assets
  const ogImage = "https://saragea.com/assets/media/about/hero.jpeg";

  return {
    title: title,
    description: description,

    // Canonical URL (Prevents duplicate content issues)
    alternates: {
      canonical: url,
      languages: {
        en: "https://saragea.com/about",
        sw: "https://saragea.com/sw/about",
        fr: "https://saragea.com/fr/about",
      },
    },

    // Open Graph (Facebook, LinkedIn, Discord)
    openGraph: {
      title: title,
      description: description,
      url: url,
      siteName: "SARAGEA Apartments",
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: "SARAGEA Apartments Building",
        },
      ],
      locale: locale,
      type: "website",
    },

    // Twitter Card
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImage],
      creator: "@saragea_tz", // Replace with actual handle if exists
    },

    // Robots (Ensure it's indexed)
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;

  setRequestLocale(locale);
  const t = await getTranslations("AboutPage");

  const getDynamicValue = (key: string, fallback?: string) => {
    const val = t(key);
    return val.includes("AboutPage.") ? fallback : val;
  };

  return (
    <div className="bg-background -mt-18">
      <AboutHero
        title={t("heroTitle")}
        subtitle={t("heroSubtitle")}
        heroImage={getDynamicValue("heroImage", undefined)} // Pass image
      />
      {/* 2. Our Story Section */}
      <section className="relative py-20  overflow-hidden">
        {/* Animated gradient background that adapts to light/dark */}
        <div className="absolute inset-0">
          {/* gradient mesh blobs */}
          <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-gradient-to-br from-primary/30 via-pink-400/10 to-purple-600/10 blur-3xl rounded-full dark:from-primary/20 dark:via-purple-400/10 dark:to-indigo-700/20 animate-pulse"></div>
          <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-gradient-to-tl from-pink-500/20 via-orange-400/10 to-primary/20 blur-3xl rounded-full dark:from-pink-600/20 dark:via-purple-600/10 dark:to-primary/20 animate-pulse delay-1000"></div>

          {/* optional subtle texture */}
          <div
            className="absolute z-0 inset-0 bg-repeat opacity-[0.04]"
            style={{ backgroundImage: "url('/assets/patterns/pattern.jpeg')" }}
          />
        </div>

        <div className="container relative z-10 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">
          {/* Text Card with Glassmorphism */}
          <div className="   transition-all hover:scale-[1.02]">
            <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-6">
              {t("storyTitle")}
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              {t("storyParagraph1")}
            </p>
            <p className="text-lg text-muted-foreground leading-relaxed">
              {t("storyParagraph2")}
            </p>
          </div>

          {/* Image with floating effect */}
          <AdvancedImageComposition
            // We try to get the translation. If it's missing (returns key), fallback to default.
            mainImage={
              t("storyMainImage").includes("AboutPage")
                ? undefined
                : t("storyMainImage")
            }
            secondaryImage={
              t("storySecondaryImage").includes("AboutPage")
                ? undefined
                : t("storySecondaryImage")
            }
            statValue={
              t("storyStatValue").includes("AboutPage")
                ? "10+"
                : t("storyStatValue")
            }
            statLabel={
              t("storyStatLabel").includes("AboutPage")
                ? "Years of Excellence"
                : t("storyStatLabel")
            }
          />
        </div>
      </section>

      <HowItWorksSection />

      {/* 4. Our Values Section */}
      <section className="relative py-24">
        <BackgroundBlobs />
        <div
          className="absolute z-0 inset-0 bg-repeat opacity-[0.05]"
          style={{ backgroundImage: "url('/assets/patterns/circuit.jpg')" }}
        />
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-12">{t("valuesTitle")}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center">
              <div>
                <SecurityLottie />
              </div>
              <h3 className="text-2xl font-semibold text-shadow-xs orboto text-shadow-black">
                {t("value1Title")}
              </h3>
              <p className="text-muted-foreground mt-2 px-8">
                {t("value1Desc")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div>
                <ComfortLottie />
              </div>
              <h3 className="text-2xl font-semibold text-shadow-xs orboto text-shadow-black">
                {t("value2Title")}
              </h3>
              <p className="text-muted-foreground mt-2 px-8">
                {t("value2Desc")}
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div>
                <HandLottie />
              </div>
              <h3 className="text-2xl  font-semibold text-shadow-xs orboto text-shadow-black ">
                {t("value3Title")}
              </h3>
              <p className="text-muted-foreground mt-2 px-8">
                {t("value3Desc")}
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
