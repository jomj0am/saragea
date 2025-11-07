'use client';

import { useState } from 'react';
import { type Translation } from '@prisma/client';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import { Loader2, Globe, Star, Layers, BookOpen } from 'lucide-react';
import { locales } from '@/i18n/config';
import { Card, CardContent } from '@/components/ui/card';

type EditableTranslation = Pick<Translation, 'id' | 'key' | 'locale' | 'value'> & {
  createdAt?: Date;
  updatedAt?: Date;
};

// Translation input with multi-language tabs
const TranslationInput = ({
  translations,
  translationKey,
  onChange,
  component: Component = Input,
}: {
  translations: EditableTranslation[];
  translationKey: string;
  onChange: (key: string, locale: string, value: string) => void;
  component?: typeof Input | typeof Textarea;
}) => {
  const [activeLocale, setActiveLocale] = useState<typeof locales[number]>(locales[0]);

  return (
    <div className="space-y-3 ">
      <div className="flex gap-2 mb-2">
        {locales.map((locale) => (
          <button
            key={locale}
            type="button"
            onClick={() => setActiveLocale(locale)}
            className={`px-3 py-1 rounded-lg font-semibold text-sm transition-colors ${
              activeLocale === locale
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {locale.toUpperCase()}
          </button>
        ))}
      </div>
      {locales.map((locale) => {
        if (locale !== activeLocale) return null;
        const translation = translations.find(
          (t) => t.key === translationKey && t.locale === locale
        );
        return (
          <div key={locale}>
            <Component
              value={translation?.value || ''}
              onChange={(e) => onChange(translationKey, locale, e.target.value)}
              className="mt-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={Component === Textarea ? 5 : undefined}
            />
          </div>
        );
      })}
    </div>
  );
};

export default function AboutPageEditor({
  initialTranslations,
}: {
  initialTranslations: Translation[];
}) {
  const [translations, setTranslations] = useState<EditableTranslation[]>(initialTranslations);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleTranslationChange = (key: string, locale: string, value: string) => {
    const existing = translations.find((t) => t.key === key && t.locale === locale);
    if (existing) {
      setTranslations(
        translations.map((t) =>
          t.key === key && t.locale === locale ? { ...t, value } : t
        )
      );
    } else {
      setTranslations([
        ...translations,
        { id: `${key}-${locale}`, key, locale, value, createdAt: new Date(), updatedAt: new Date() },
      ]);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = translations.map((t) => ({
        key: t.key,
        locale: t.locale,
        value: t.value,
      }));
      const res = await fetch('/api/translations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to save.');
      toast({
        title: 'Saved!',
        description: 'About Us page updated.',
        variant: 'success',
      });
      router.refresh();
    } catch {
      toast({
        title: 'Error',
        description: 'Could not save content.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      <Accordion type="single" collapsible className="w-full space-y-4">
        {/* Hero Section */}
        <AccordionItem value="hero">
          <AccordionTrigger className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800 rounded-lg shadow-md hover:shadow-lg">
            <Globe className="h-5 w-5 text-purple-600 dark:text-purple-300" /> Hero Section
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-6 pb-6 space-y-4 mt-2">
            <Card className="bg-white dark:bg-gray-900 shadow-lg rounded-lg border-l-4 border-purple-500">
              <CardContent className="space-y-4">
                <Label className="font-semibold">Title</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.heroTitle"
                  onChange={handleTranslationChange}
                />
                <Label className="font-semibold">Subtitle</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.heroSubtitle"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Our Story */}
        <AccordionItem value="story">
          <AccordionTrigger className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-200 to-lime-200 dark:from-green-800 dark:to-lime-700 rounded-lg shadow-md hover:shadow-lg">
            <BookOpen className="h-5 w-5 text-green-600 dark:text-green-300" /> Our Story
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-6 pb-6 space-y-4 mt-2">
            <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border-l-4 border-green-500">
              <CardContent className="space-y-4">
                <Label className="font-semibold">Title</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.storyTitle"
                  onChange={handleTranslationChange}
                />
                <Label className="font-semibold">Paragraph 1</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.storyParagraph1"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
                <Label className="font-semibold">Paragraph 2</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.storyParagraph2"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* How It Works */}
        <AccordionItem value="how">
          <AccordionTrigger className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-200 to-orange-200 dark:from-yellow-800 dark:to-orange-700 rounded-lg shadow-md hover:shadow-lg">
            <Layers className="h-5 w-5 text-yellow-600 dark:text-yellow-300" /> How It Works
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-6 pb-6 space-y-4 mt-2">
            <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border-l-4 border-yellow-500">
              <CardContent className="space-y-4">
                <Label className="font-semibold">Step 1: Discover & Explore</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.step1Desc"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
                <Label className="font-semibold">Step 2: Join & Learn</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.step2Desc"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>

        {/* Our Values */}
        <AccordionItem value="values">
          <AccordionTrigger className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-800 dark:to-purple-700 rounded-lg shadow-md hover:shadow-lg">
            <Star className="h-5 w-5 text-indigo-600 dark:text-indigo-300" /> Our Values
          </AccordionTrigger>
          <AccordionContent className="px-3 md:px-6 pb-6 space-y-4 mt-2">
            {/* Value 1 */}
            <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border-l-4 border-indigo-500">
              <CardContent className="space-y-4">
                <Label className="font-semibold">Value 1: Security</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.value1Desc"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
              </CardContent>
            </Card>
            {/* Value 2 */}
            <Card className="bg-white dark:bg-gray-900 shadow-md rounded-lg border-l-4 border-indigo-500">
              <CardContent className="space-y-4">
                <Label className="font-semibold">Value 2: Transparency</Label>
                <TranslationInput
                  translations={translations}
                  translationKey="AboutPage.value2Desc"
                  onChange={handleTranslationChange}
                  component={Textarea}
                />
              </CardContent>
            </Card>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex justify-end">
        <Button
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white flex items-center gap-2"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
          Save All Changes
        </Button>
      </div>
    </div>
  );
}
