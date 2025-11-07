

'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Lottie from 'lottie-react';
import welcomeAnimation from '../../../public/lottie/Hello.json';
import settingsAnimation from '../../../public/lottie/Language Translator.json';
import completeAnimation from '../../../public/lottie/Make the Deal.json';
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeSelector from './ThemeSelector';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { Label } from '../ui/label';
import { useTranslations } from 'next-intl';

const ONBOARDING_KEY = 'saragea-onboarding-complete-v1';

export default function OnboardingModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);
  const t = useTranslations('Onboarding');

  useEffect(() => {
    const onboardingComplete = localStorage.getItem(ONBOARDING_KEY);
    if (!onboardingComplete) {
      const timer = setTimeout(() => setIsOpen(true), 10_000);
      return () => clearTimeout(timer);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setIsOpen(false);
  };

  const nextStep = () => setStep((prev) => Math.min(prev + 1, 2));
  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0));

  const steps = [
    {
      animation: welcomeAnimation,
      title: t('welcomeTitle'),
      description: t('welcomeSubtitle'),
      buttonText: t('nextButton'),
      action: nextStep,
    },
    {
      animation: settingsAnimation,
      title: t('personalizationTitle'),
      description: t('personalizationSubtitle'),
      buttonText: t('nextButton'),
      action: nextStep,
    },
    {
      animation: completeAnimation,
      title: t('doneTitle'),
      description: t('doneSubtitle'),
      buttonText: t('startButton'),
      action: completeOnboarding,
    },
  ];

  const currentStep = steps[step];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent
        className="
          w-full !max-w-full h-fit min-h-screen sm:min-h-auto sm:h-auto md:!max-w-4xl
          overflow-hidden rounded-none sm:rounded-2xl
          border border-white/30 dark:border-zinc-400/20
          bg-white/90 dark:bg-zinc-900/40
          shadow-2xl backdrop-blur-3xl
          p-0
        "
        onInteractOutside={(e) => e.preventDefault()}
      >
        {/* --- Glow / Aurora Background Layers --- */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 rounded-full blur-3xl animate-pulse" />
          <div className="absolute md:top-1/3  top-1/2 -right-40 w-96 h-96 bg-gradient-to-br from-amber-400/40 to-pink-500/40 rounded-full blur-3xl animate-pulse delay-2000" />
        </div>

        {/* Custom Close Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="
            absolute top-3 right-4 z-20
            rounded-full p-2
            bg-white dark:bg-zinc-800 shadow
            backdrop-blur-2xl
            hover:scale-110 transition
          "
        >
          <X className="h-5 w-5 text-zinc-700 dark:text-zinc-200" />
        </Button>

        {/* Step indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
          {steps.map((_, i) => (
            <motion.div
              key={i}
              layoutId={i === step ? 'active-step' : undefined}
              className={`w-3 h-3 rounded-full transition-all ${
                i === step
                  ? 'bg-indigo-500 dark:bg-amber-500 w-5'
                  : 'bg-muted-foreground/50'
              }`}
              animate={{ scale: i === step ? 1.2 : 1 }}
            />
          ))}
        </div>

          {/* nav buttons for mobile */}
  <div className="flex md:hidden absolute bottom-12 p-6 w-full items-center justify-between px-4 py-3 gap-4">
    {step > 0 ? (
      <Button
        variant="ghost"
        size="lg"
        onClick={prevStep}
        className="rounded-full px-6 py-2 text-sm md:text-base hover:bg-muted/50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
    ) : (
      <div />
    )}
    <Button
      size="lg"
      onClick={currentStep.action}
      className="rounded-full px-8 py-2 text-sm md:text-base 
                 bg-gradient-to-r from-indigo-500 to-amber-500 text-white 
                 shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-amber-600"
    >
      {currentStep.buttonText}
      {step < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="
              flex flex-col md:flex-row
              items-center justify-between
              h-full md:min-h-[500px]
              px-6 py-8 md:p-10
              text-center md:text-left gap-6
            "
          >
<div className="flex flex-col items-center justify-center   h-full
                md:flex-row md:items- md:justify-center">
  {/* Left: animation */}
  <div className="flex justify-center w-full md:w-1/2 md:ml-8">
    <Lottie
      animationData={currentStep.animation}
      loop
      className="h-64 w-64 md:h-72 md:w-72 drop-shadow-xl"
    />
  </div>

{/* Right: content */}
<div className="flex flex-col justify-between items-center 
                w-full md:w-1/2 md:items-center md:justify-between  pb-12 md:pb-0
                md:h-full md:-ml-8">

  {/* main content stays centered */}
  <div className="flex flex-col items-center justify-center flex-1 
                   text-center md:text-left">
    <DialogHeader className="mb-4 space-y-3">
      <DialogTitle className="text-xl md:text-4xl font-extrabold tracking-normal 
                              bg-gradient-to-r from-indigo-500 to-amber-600 
                              bg-clip-text text-transparent text-shadow-md">
        {currentStep.title}
      </DialogTitle>
      <DialogDescription className="text-base md:text-lg text-muted-foreground leading-relaxed">
        {currentStep.description}
      </DialogDescription>
    </DialogHeader>

    {step === 1 && (
      <div className="w-full mt-2 space-y-6">
        <div>
          <Label className="font-semibold text-sm tracking-wide pb-1">
            🌐 {t('languageLabel')}
          </Label>
          <LanguageSwitcher />
        </div>
        <div>
          <Label className="font-semibold text-sm tracking-wide pb-1">
            🎨 {t('themeLabel')}
          </Label>
          <ThemeSelector />
        </div>
      </div>
    )}
  </div>

  {/* nav buttons always pinned to bottom */}
  <div className="md:flex hidden w-full items-center justify-between  py-3 gap-4">
    {step > 0 ? (
      <Button
        variant="ghost"
        size="lg"
        onClick={prevStep}
        className="rounded-full px-6 py-2 text-sm md:text-base hover:bg-muted/50"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>
    ) : (
      <div />
    )}
    <Button
      size="lg"
      onClick={currentStep.action}
      className="rounded-full px-8 py-2 text-sm md:text-base 
                 bg-gradient-to-r from-indigo-500 to-amber-500 text-white 
                 shadow-md hover:shadow-lg hover:from-indigo-600 hover:to-amber-600"
    >
      {currentStep.buttonText}
      {step < steps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
    </Button>
  </div>
</div>

</div>

          </motion.div>
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}