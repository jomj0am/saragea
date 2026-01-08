import { getTranslations } from "next-intl/server";
import { setRequestLocale } from "next-intl/server";
import { ShieldCheck, Lock, Eye, FileText, Scale, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PrivacyPage");

  const sections = [
    { id: "s1", icon: <Eye className="w-5 h-5" /> },
    { id: "s2", icon: <FileText className="w-5 h-5" /> },
    { id: "s3", icon: <ShieldCheck className="w-5 h-5" /> },
    { id: "s4", icon: <Lock className="w-5 h-5" /> },
    { id: "s5", icon: <Scale className="w-5 h-5" /> },
  ];

  return (
    <div className="bg-background min-h-screen -mt-16 pt-24 pb-20 overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[120px] -z-10" />

      <div className="container mx-auto px-4 max-w-6xl">
        {/* 1. Hero Header */}
        <header className="mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <ShieldCheck className="w-4 h-4" />
            TRUSTED BY TENANTS
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6">
            {t("heroTitle")}
          </h1>
          <p className="text-muted-foreground text-xl max-w-2xl leading-relaxed">
            {t("heroSubtitle")}
          </p>
          <div className="mt-8 text-sm font-mono text-primary uppercase tracking-widest">
            {t("lastUpdated")}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* 2. Left Column: Table of Contents (Sticky) */}
          <aside className="hidden lg:block lg:col-span-4">
            <div className="sticky top-32 space-y-2">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-4 p-4 rounded-xl hover:bg-secondary transition-all group"
                >
                  <div className="p-2 rounded-lg bg-card border group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    {section.icon}
                  </div>
                  <span className="font-bold text-sm text-muted-foreground group-hover:text-foreground">
                    {t(`sections.${section.id}_title`)}
                  </span>
                </a>
              ))}
            </div>
          </aside>

          {/* 3. Right Column: Content Sections */}
          <main className="lg:col-span-8 space-y-20">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.id}
                className="scroll-mt-32"
              >
                <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-primary opacity-20">#</span>
                  {t(`sections.${section.id}_title`)}
                </h2>
                <div className="bg-card/50 backdrop-blur-sm border rounded-3xl p-8 shadow-sm hover:shadow-md transition-all leading-loose text-muted-foreground text-lg">
                  {t(`sections.${section.id}_content`)}
                </div>
              </section>
            ))}

            {/* Contact CTA */}
            <div className="bg-gradient-to-tr from-zinc-900 to-zinc-800 dark:from-primary/20 dark:to-purple-900/20 rounded-[2.5rem] p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-10 opacity-10">
                <ShieldCheck className="w-40 h-40" />
              </div>
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">{t("contactTitle")}</h3>
                <p className="text-zinc-400 mb-8 max-w-md">
                  {t("contactDesc")}
                </p>
                <Button
                  asChild
                  size="lg"
                  className="rounded-full bg-white text-black hover:bg-gray-200 h-14 px-8 font-bold"
                >
                  <a href="mailto:legal@saragea.com">
                    <Mail className="mr-2 h-5 w-5" />
                    {t("contactBtn")}
                  </a>
                </Button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
