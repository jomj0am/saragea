'use client';

import Spline from '@splinetool/react-spline';
import { Button } from '@/components/ui/button';
import { motion ,Variants} from 'framer-motion';
import { useTranslations } from 'next-intl';
import Lottie from 'lottie-react';
import { FaApple, FaGooglePlay, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import GlobalSearch from './GlobalSearch';
import buildingAnimation from '../../../public/lottie/Red Car Drive.json';
import Image from 'next/image';
import { Mouse } from 'lucide-react';




/* --- Floating blurred blobs --- */
const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden z-30 pointer-events-none">
    <div className="absolute top-[10%] -left-24 w-72 h-72 bg-cyan-200/60 rounded-full blur-3xl animate-blob-spin dark:bg-cyan-900/40"></div>
    <div className="absolute bottom-[5%] -right-24 w-80 h-80 bg-indigo-700/40 rounded-full blur-3xl animate-blob-spin animation-delay-4000 dark:bg-indigo-950/40"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/40 rounded-full blur-3xl animate-blob-spin animation-delay-2000 dark:bg-fuchsia-900/40"></div>
  </div>
);

export default function HeroSection() {
  const t = useTranslations('HomePageV3');

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.42, 0, 0.58, 1] } 
  },
};

  const heroTitle = t.rich('heroTitle', {
    primary: (chunks) => <span className="text-primary">{chunks}</span>,
  });

  

  return (
    <section
      className="relative pt-26 pb-20 sm:h-screen min-h-screen md:h-auto flex md:min-h-[80vh] w-full items-center overflow-hidden
                 bg-gradient-to-br from-primary/30 via-background to-background sm:py-16"
    >
<motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: [0, 10, 0] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
>
  <Mouse className="h-8 w-8  animate-bounce fill-indigo-100 text-indigo-300 drop-shadow-md drop-shadow-black" />
  <span className="mt-2 text-xs uppercase tracking-wider text-primary/80">
    Scroll
  </span>
</motion.div>
      <BackgroundBlobs />

      {/* Glass overlay */}
      <div className="absolute inset-0 bg-background/60 backdrop-blur-xl z-20" />

      {/* Spline 3D background */}
      <div className="absolute hidden md:block inset-0 z-0 opacity-40 md:opacity-70 scale-105">
        <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
      </div>

      {/* Color overlay (light & dark) */}
      <div className="absolute inset-0 z-10 bg-gradient-to-br from-white/50 to-primary/20 dark:from-black/80 dark:to-black/70" />

      {/* ===== Main content ===== */}
      <div className="container relative z-40 mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 gap-12 px-6">
        {/* ==== LEFT CONTENT ==== */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.3 }}
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
          className="flex flex-col items-center text-center lg:items-start lg:text-left"
        >
          <motion.h1
            variants={fadeUp}
            className="text-2xl sm:text-5xl lg:text-5xl font-extrabold leading-tight tracking-tight"
          >
            {heroTitle}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-base sm:text-lg text-muted-foreground"
          >
            {t('heroSubtitle')}
          </motion.p>

          <motion.div variants={fadeUp} className="mt-8 w-full max-w-xl">
            <GlobalSearch />
          </motion.div>

          {/* Rating + avatars */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex items-center justify-center gap-4 lg:justify-start"
          >
            <div className="flex -space-x-2">
              {[
                'https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?w=256&h=256&q=80',
                'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&h=256&q=80',
                'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=256&h=256&q=80',
              ].map((src, i) => (
                <div key={i} className="relative h-10 w-10">
                  <Image
                    src={src}
                    alt={`Happy customer ${i + 1}`}
                    fill
                    sizes="40px"
                    className="rounded-full ring-2 ring-white dark:ring-slate-800 object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center text-yellow-400">
                <FaStar /><FaStar /><FaStar /><FaStar /><FaStarHalfAlt />
                <span className="ml-2 font-bold text-slate-800 dark:text-slate-200">4.8/5</span>
              </div>
              <p>
                Loved by <strong>12k</strong> users
              </p>
            </div>
          </motion.div>

{/* Store Buttons – leveled up */}
<motion.div
  variants={fadeUp}
  className="mt-10 flex w-full  sm:flex-row justify-center  lg:justify-start gap-2 sm:gap-6"
>
  <Button
    variant="outline"
    className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-primary/40
               bg-gradient-to-br from-white/20 via-white/10 to-transparent
               px-7 py-6 text-primary shadow-xl backdrop-blur
               transition-all duration-300 hover:scale-105 hover:border-primary
               hover:shadow-[0_0_35px_theme(colors.primary.DEFAULT)]"
  >
    {/* Bigger, colored Google Play icon */}
    <FaGooglePlay className="h-8 w-8 text-green-500 group-hover:text-green-400 transition-colors" />
    <div className="text-left">
      <p className="text-[0.7rem] uppercase tracking-wider text-primary/80">
        Get it on
      </p>
      <p className="text-base font-bold text-primary">Google Play</p>
    </div>
  </Button>

  <Button
    variant="outline"
    className="group flex items-center gap-4 rounded-2xl border-2 border-dashed border-primary/40
               bg-gradient-to-br from-white/20 via-white/10 to-transparent
               px-7 py-6 text-primary shadow-xl backdrop-blur
               transition-all duration-300 hover:scale-105 hover:border-primary
               hover:shadow-[0_0_35px_theme(colors.primary.DEFAULT)]"
  >
    {/* Bigger, colored Apple icon */}
    <FaApple className="h-9 w-9 text-black group-hover:text-gray-700 transition-colors" />
    <div className="text-left">
      <p className="text-[0.7rem] uppercase tracking-wider text-primary/80">
        Download on the
      </p>
      <p className="text-base font-bold text-primary">App Store</p>
    </div>
  </Button>
</motion.div>

        </motion.div>

        {/* ==== RIGHT CONTENT ==== */}
        <motion.div
          initial={{ opacity: 0, scale: 0.6 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
          className="flex justify-center"
        >
          <Lottie animationData={buildingAnimation} className="w-[20rem] md:w-2xl  drop-shadow-2xl" />
        </motion.div>
      </div>
    </section>
  );
}
