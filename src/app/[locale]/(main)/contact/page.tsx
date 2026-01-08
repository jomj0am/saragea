// app/[locale]/(main)/contact/page.tsx
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { Mail, Phone, MapPin, Clock, Send } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";
import PropertyMap from "@/components/property/PropertyMap";
import { setRequestLocale } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  FaFacebookF,
  FaTwitter,
  FaInstagram,
  FaLinkedinIn,
} from "react-icons/fa";
import { ContactLottie, ScrollMouse } from "@/components/shared/ContactLottie";
import { Metadata } from "next";

type ContactPageContent = {
  contactDetails: {
    titleKey: string;
    addressKey: string;
    phone1Key: string;
    phone2Key: string;
    emailKey: string;
    latitude: number | null;
    longitude: number | null;
  };
  form: {
    titleKey: string;
    subtitleKey: string;
  };
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  const title = "Contact Us | SARAGEA Apartments";
  const description =
    "Get in touch with SARAGEA. Whether you're looking for a new home or need support, our team is ready to help. Visit us in Masaki, Dar es Salaam.";
  const url = `https://saragea.com/${locale}/contact`;
  const ogImage = "https://saragea.com/assets/media/about/hero.jpeg";

  return {
    title: title,
    description: description,

    // Canonical & Languages
    alternates: {
      canonical: url,
      languages: {
        en: "https://saragea.com/contact",
        sw: "https://saragea.com/sw/contact",
        fr: "https://saragea.com/fr/contact",
      },
    },

    // Open Graph
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
          alt: "Contact SARAGEA Team",
        },
      ],
      locale: locale,
      type: "website",
    },

    // Twitter
    twitter: {
      card: "summary_large_image",
      title: title,
      description: description,
      images: [ogImage],
    },

    // Local Business Schema (Rich Snippet for Google Maps)
    other: {
      "geo.region": "TZ",
      "geo.placename": "Dar es Salaam",
      "geo.position": "-6.7924;39.2083",
      ICBM: "-6.7924, 39.2083",
    },
  };
}

export const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
    <div className="absolute top-[10%] -left-24 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl animate-blob-spin dark:bg-cyan-900/40"></div>
    <div className="absolute bottom-[5%] -right-24 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl animate-blob-spin animation-delay-4000 dark:bg-indigo-950/40"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/20 rounded-full blur-3xl animate-blob-spin animation-delay-2000 dark:bg-fuchsia-900/20"></div>
  </div>
);

// Function ya kupata data (inabaki kama ilivyo)
async function getContactPageData() {
  const settings = await prisma.setting.findUnique({
    where: { id: "page.contact" },
  });
  return settings?.jsonContent as ContactPageContent;
}
export default async function ContactPage({
  params,
}: {
  params: { locale: string };
}) {
  const awaitedParams = await Promise.resolve(params);
  const { locale } = awaitedParams;
  setRequestLocale(locale);
  const t = await getTranslations("ContactPage");
  const content = await getContactPageData();

  const details = content?.contactDetails || {};

  const contactItems = [
    {
      icon: MapPin,
      color: "text-orange-500",
      bg: "from-orange-100 to-orange-200",
      labelKey: "addressLabel",
      valueKey: "address",
    },
    {
      icon: Phone,
      color: "text-green-500",
      bg: "from-green-100 to-green-200",
      labelKey: "phoneLabel",
      valueKey: "phone1",
      secondaryValueKey: "phone2",
    },
    {
      icon: Mail,
      color: "text-blue-500",
      bg: "from-blue-100 to-blue-200",
      labelKey: "emailLabel",
      valueKey: "email",
    },
    {
      icon: Clock,
      color: "text-yellow-500",
      bg: "from-yellow-100 to-yellow-200",
      labelKey: "hoursLabel",
      valueKey: "hours1",
      secondaryValueKey: "hours2",
    },
  ];

  const socialLinks = [
    { name: "Facebook", icon: FaFacebookF, href: "#" },
    { name: "Twitter", icon: FaTwitter, href: "#" },
    { name: "Instagram", icon: FaInstagram, href: "#" },
    { name: "LinkedIn", icon: FaLinkedinIn, href: "#" },
  ];

  return (
    <div className="-mt-17">
      {/* Hero Section with Enhanced BG */}
      <section className="relative  py-30 p-2 text-center md:text-start  pb-15 overflow-hidden bg-gradient-to-br from-white via-cyan-50 to-white dark:from-gray-600 dark:via-slate-800 dark:to-slate-950">
        <div className="absolute inset-0 bg-[url('/assets/patterns/contact2.jpg')] md:bg-[url('/assets/patterns/contact.jpg')] bg-no-repeat bg-center bg-cover  md:bg-[length:100%_100%] opacity-20 md:opacity-30">
          {" "}
        </div>
        <div className="container flex flex-col md:flex-row justify-center items-center mx-auto relative z-10">
          <div>
            <h1 className="text-5xl md:text-6xl bg-gradient-to-r from-transparent to-transparent bg-transparent bg-clip-text text-shadow-xs text-slate-600 dark:text-slate-200 orboto font-extrabold tracking-tighter mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              {t("heroSubtitle")}
            </p>
            <div className="animate-bounce-in mt-10">
              <a
                href="#contact-form"
                className="inline-flex items-center gap-2 bg-white text-slate-600 px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {t("ctaGetInTouch")} <Send className="h-5 w-5" />
              </a>
            </div>
          </div>
          <ContactLottie />
        </div>
        <ScrollMouse />
      </section>

      {/* Main Contact Section */}
      <section className="md:py-24 pb-10">
        <div className="container mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Contact Details Section */}
          <div className="relative space-y-8 overflow-hidden pt-10 md:pt-0">
            {/* floating gradient orbs */}
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full blur-2xl"></div>
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gradient-to-tr from-primary/10 to-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -top-4 -right-4 w-28 h-28 bg-primary/10 rounded-full"></div>
            <div className="absolute -bottom-11 -left-4 w-20 h-20 bg-primary/10 rounded-full"></div>
            <div className="relative sm:p-10 p-6 overflow-hidden">
              <div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {t("detailsTitle")}
                </h2>
                <div className="w-24 h-1 bg-primary my-3 rounded-full"></div>
              </div>

              <div className="space-y-7">
                {contactItems.map((item) => (
                  <div
                    key={item.labelKey}
                    className="flex items-start gap-5 group"
                  >
                    {/* Icon with 3D gradient */}
                    <div
                      className={`flex-shrink-0 p-4 rounded-2xl bg-gradient-to-br ${item.bg} shadow-lg transition-transform group-hover:scale-105`}
                    >
                      <item.icon
                        className={`h-7 w-7 ${item.color} drop-shadow-md`}
                      />
                    </div>

                    {/* Text Content */}
                    <div>
                      <h3 className="font-semibold text-lg">
                        {t(item.labelKey)}
                      </h3>
                      <p className="text-muted-foreground text-[16px]">
                        {t(item.valueKey)}
                      </p>
                      {item.secondaryValueKey && (
                        <p className="text-muted-foreground text-[16px]">
                          {t(item.secondaryValueKey)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {details.latitude && details.longitude && (
                  <div className="w-full h-96 mt-6 rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-primary/20">
                    <PropertyMap
                      latitude={details.latitude}
                      longitude={details.longitude}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sehemu ya Fomu na Ramani (Kulia) */}
          <div className=" space-y-8">
            <div id="contact-form">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* Social Media & CTA Section */}
      <section className="py-24 bg-secondary dark:bg-slate-950 relative">
        <BackgroundBlobs />
        <div
          className="absolute z-0 inset-0 bg-repeat opacity-[0.05]"
          style={{ backgroundImage: "url('/assets/patterns/circuit.jpg')" }}
        />
        <div className="container z-40 mx-auto text-center relative">
          <h2 className="text-3xl font-bold mb-4">{t("socialTitle")}</h2>
          <p className="text-muted-foreground mb-8">
            Connect with us on social media.
          </p>
          <div className="flex justify-center gap-4 mb-16">
            {socialLinks.map(({ name, icon: Icon, href }) => (
              <Button
                asChild
                key={name}
                variant="outline"
                size="icon"
                className="h-12 w-12 rounded-full hover:bg-primary hover:text-white transition-all duration-300 transform hover:scale-110"
              >
                <a href={href} aria-label={name}>
                  <Icon className="h-5 w-5" />
                </a>
              </Button>
            ))}
          </div>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl text-shadow-xs text-shadow-black orboto font-extrabold mb-4">
              {t("bottomCtaTitle")}
            </h2>
            <p className="text-muted-foreground mb-8">
              {t("bottomCtaSubtitle")}
            </p>
            <div className="flex sm:flex-row gap-4 justify-center">
              <Button asChild size="lg">
                <Link href="/properties">Browse Properties</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-dashed rounded-full"
              >
                <a href={`tel:${t("phone1").split(" ")[0]}`}>
                  <Phone className="h-5 w-5 mr-2" />
                  {t("bottomCtaCall")}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
