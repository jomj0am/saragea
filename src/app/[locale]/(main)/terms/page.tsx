import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import {
  Gavel,
  UserCheck,
  CreditCard,
  Home,
  AlertTriangle,
  HelpCircle,
  Info,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("TermsPage");

  const sections = [
    { id: "s1", icon: <Gavel className="w-5 h-5" /> },
    { id: "s2", icon: <UserCheck className="w-5 h-5" /> },
    { id: "s3", icon: <CreditCard className="w-5 h-5" /> },
    { id: "s4", icon: <Home className="w-5 h-5" /> },
    { id: "s5", icon: <AlertTriangle className="w-5 h-5" /> },
    { id: "s6", icon: <Info className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-background min-h-screen -mt-16 pt-24 pb-20 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Hero Header */}
        <header className="mb-16 border-l-4 border-primary pl-6 md:pl-10">
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 inline-flex items-center gap-2 text-xs font-bold px-3 py-1 rounded-md bg-secondary text-secondary-foreground">
            {t("lastUpdated")}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* Table of Contents (Desktop Sidebar) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-2">
              <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-4 pl-4">
                Navigation
              </p>
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-4 p-4 rounded-2xl hover:bg-secondary/50 border border-transparent hover:border-border transition-all group"
                >
                  <div className="p-2 rounded-xl bg-card shadow-sm border group-hover:bg-primary group-hover:text-white transition-colors">
                    {section.icon}
                  </div>
                  <span className="font-bold text-sm text-muted-foreground group-hover:text-foreground">
                    {t(`sections.${section.id}_title`)}
                  </span>
                </a>
              ))}
            </div>
          </aside>

          {/* Legal Content */}
          <main className="lg:col-span-8 space-y-16">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32 group"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px flex-grow bg-border group-hover:bg-primary/30 transition-colors" />
                  <h2 className="text-2xl font-bold whitespace-nowrap">
                    {t(`sections.${section.id}_title`)}
                  </h2>
                </div>
                <div className="bg-white/50 dark:bg-zinc-900/30 backdrop-blur-md border border-gray-100 dark:border-zinc-800/50 rounded-3xl p-8 shadow-sm group-hover:shadow-md transition-all leading-relaxed text-muted-foreground text-lg">
                  {t(`sections.${section.id}_content`)}
                </div>
              </section>
            ))}

            {/* Help CTA Card */}
            <div className="bg-gradient-to-br from-primary to-indigo-700 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden shadow-2xl">
              {/* Decorative Background Icon */}
              <HelpCircle className="absolute -bottom-10 -right-10 w-64 h-64 opacity-10 rotate-12" />

              <div className="relative z-10">
                <h3 className="text-4xl font-black mb-4">{t("agreeTitle")}</h3>
                <p className="text-primary-foreground/80 text-lg mb-10 max-w-md">
                  {t("agreeDesc")}
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button
                    asChild
                    size="lg"
                    className="rounded-full bg-white text-primary hover:bg-white/90 h-14 px-8 font-black shadow-xl"
                  >
                    <Link href="/contact">
                      <MessageSquare className="mr-2 h-5 w-5" />
                      {t("contactBtn")}
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
