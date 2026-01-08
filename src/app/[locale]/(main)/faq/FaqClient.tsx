"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Search,
  MessageCircle,
  HelpCircle,
  HelpCircleIcon,
} from "lucide-react";
import Lottie from "lottie-react";
import faqAnimation from "../../../../../public/lottie/FAQ web page.json";

export default function FaqClient() {
  const t = useTranslations("FaqPage");
  const [searchQuery, setSearchQuery] = useState("");

  const faqData = [
    { id: "q1", category: "general" },
    { id: "q2", category: "booking" },
    { id: "q3", category: "booking" },
    { id: "q4", category: "maintenance" },
    { id: "q5", category: "booking" },
    { id: "q6", category: "security" },
  ];

  const filteredFaqs = faqData.filter((faq) => {
    const question = t(`questions.${faq.id}`).toLowerCase();
    const answer = t(`questions.${faq.id.replace("q", "a")}`).toLowerCase();
    return (
      question.includes(searchQuery.toLowerCase()) ||
      answer.includes(searchQuery.toLowerCase())
    );
  });

  return (
    <div className="bg-background min-h-screen -mt-16 pt-24 pb-20">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 1. Hero Section */}
        <header className="text-center mb-16 relative flex flex-col items-center md:flex-row">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-72 bg-primary/10 rounded-full blur-[100px] -z-10" />

          <div className="w-64 mx-auto ">
            <Lottie animationData={faqAnimation} />
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl font-black orboto tracking-tight mb-4">
              {t("heroTitle")}
            </h1>
            <p className="text-muted-foreground text-base mb-8 max-w-xl mx-auto">
              {t("heroSubtitle")}
            </p>

            {/* Search Bar */}
            <div className="relative max-w-lg mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground h-5 w-5" />
              <Input
                className="pl-12 h-14 rounded-full border-2 border-muted bg-card shadow-lg focus:border-primary transition-all text-lg"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </header>

        {/* 2. FAQ List */}
        <section className="space-y-4 min-h-[400px]">
          <AnimatePresence mode="popLayout">
            {filteredFaqs.length > 0 ? (
              <Accordion type="single" collapsible className="w-full space-y-4">
                {filteredFaqs.map((faq, index) => (
                  <motion.div
                    key={faq.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <AccordionItem
                      value={faq.id}
                      className="border-none bg-card rounded-2xl px-6 shadow-sm border border-transparent hover:border-primary/20 transition-all overflow-hidden"
                    >
                      <AccordionTrigger className="text-left font-bold text-lg py-6 hover:no-underline hover:text-primary">
                        <div className="flex items-center gap-4 roboto">
                          <div className="p-2 rounded-lg bg-secondary">
                            <HelpCircleIcon className="h-5 w-5 text-primary" />
                          </div>
                          {t(`questions.${faq.id}`)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-base pb-6 pl-14">
                        {t(`questions.${faq.id.replace("q", "a")}`)}
                      </AccordionContent>
                    </AccordionItem>
                  </motion.div>
                ))}
              </Accordion>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-muted/30 rounded-3xl border-2 border-dashed"
              >
                <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4 opacity-20" />
                <p className="text-muted-foreground">
                  No matches found for your search.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* 3. Still Have Questions CTA */}
        <footer className="mt-24">
          <div className="bg-gradient-to-br from-primary to-purple-700 rounded-[2.5rem] p-8 md:p-12 text-center text-white relative overflow-hidden shadow-2xl">
            {/* Decorative Circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-4">
                {t("stillHaveQuestions")}
              </h3>
              <p className="text-primary-foreground/80 mb-8 max-w-md mx-auto">
                {t("contactSupport")}
              </p>
              <Button
                asChild
                size="lg"
                className="bg-white text-primary hover:bg-white/90 rounded-full px-10 h-14 font-bold shadow-xl transition-transform hover:scale-105"
              >
                <Link href="/contact">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {t("contactBtn")}
                </Link>
              </Button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
