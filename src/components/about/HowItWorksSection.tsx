'use client';

import { useTranslations } from 'next-intl';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

import discoverAnimation from '../../../public/lottie/Collo Onboarding 1.json';
import applyAnimation from '../../../public/lottie/application completed.json';
import paymentAnimation from '../../../public/lottie/Payments.json';
import supportAnimation from '../../../public/lottie/Contactus.json';

export default function HowItWorksSection() {
  const t = useTranslations('AboutPage');

  const steps = [
    { title: t('step1Title'), description: t('step1Desc'), animationData: discoverAnimation },
    { title: t('step2Title'), description: t('step2Desc'), animationData: applyAnimation },
    { title: t('step3Title'), description: t('step3Desc'), animationData: paymentAnimation },
    { title: t('step4Title'), description: t('step4Desc'), animationData: supportAnimation },
  ];

  return (
    <section className="relative py-28 overflow-hidden bg-gradient-to-br from-secondary via-background to-secondary px-4">


      <div className="container mx-auto relative z-10">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <h2 className="text-3xl md:text-4xl orboto font-extrabold tracking-tight bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent">
            {t('digitalTitle')}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
            {t('digitalSubtitle')}
          </p>
        </motion.div>

        {/* Timeline vertical line */}
        <div className="relative grid gap-0">
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-pink-500 to-purple-500 rounded-full shadow-[0_0_25px_rgba(0,0,0,0.2)]"></div>

          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 80 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className={`flex flex-col md:flex-row items-center gap-12 ${
                index % 2 === 1 ? 'md:flex-row-reverse' : ''
              }`}
            >
              {/* Lottie Animation */}
              <div className="md:w-1/2 flex justify-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotate: 2 }}
                  className="drop-shadow-2xl flex justify-center  -mb-10 mt-5 w-full"
                >
                  <Lottie animationData={step.animationData} className="w-full max-w-[18rem]" />
                </motion.div>
              </div>

              {/* Step Card */}
              <div className="md:w-1/3 relative">
                {/* glowing orb connector */}
                <div className=" md:block absolute top-1/2 -translate-y-1/2 
                                left-1/2 -translate-x-1/2 
                                h-30 w-30 rounded-full bg-primary/50 blur-3xl
                                shadow-[0_0_30px_10px_rgba(168,85,247,0.5)]"></div>

                <motion.div
                  whileHover={{ scale: 1.03 }}
                  className="p-8 rounded-3xl backdrop-blur-md bg-white/10 border dark:border-white/20 border-slate-500/40  border-dashed
                             shadow-[0_8px_40px_rgba(0,0,0,0.2)]
                             hover:shadow-[0_0_35px_10px_theme(colors.primary.DEFAULT)/40] 
                             transition-all"
                >
                  <span className="inline-block text-sm uppercase tracking-wider font-bold text-primary">
                    Step {index + 1}
                  </span>
                  <h3 className="mt-3 text-3xl font-semibold dark:text-white text-slate-600  text-shadow-xs text-shadow-black/80 drop-shadow-md">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
