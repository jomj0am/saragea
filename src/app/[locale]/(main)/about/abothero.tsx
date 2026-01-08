"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Spline from "@splinetool/react-spline";
import { ScrollMouse } from "@/components/shared/ContactLottie";

type AboutHeroProps = {
  title: string;
  subtitle: string;
  heroImage?: string;
};

export default function AboutHero({
  title,
  subtitle,
  heroImage,
}: AboutHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section
      ref={containerRef}
      className="relative h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden"
    >
      {/* Parallax Background */}
      <motion.div style={{ y, scale }} className="absolute inset-0 z-0">
        <Image
          src={heroImage || "/assets/media/about/hero.jpeg"} // Use prop or fallback
          alt="SARAGEA Apartments"
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Cinematic Overlay */}
      <div className="absolute inset-0 z-10 bg-gradient-to-b from-black/80 via-black/40 to-background" />

      {/* Abstract Spline Layer */}
      <div className="absolute inset-0 z-10 opacity-10 mix-blend-screen pointer-events-none">
        <div className="w-full h-full scale-110">
          <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
        </div>
      </div>

      {/* Main Content */}
      <motion.div
        style={{ opacity }}
        className="relative z-20 container px-4 flex flex-col items-center text-center"
      >
        {/* Animated Title */}
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black text-white tracking-tight leading-[1.1] mb-6 drop-shadow-2xl">
          {title.split(" ").map((word, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, filter: "blur(10px)", y: 20 }}
              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 + i * 0.1 }}
              className="inline-block mr-3"
            >
              {word}
            </motion.span>
          ))}
        </h1>

        {/* --- FIXED SUBTITLE GLASS CARD --- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          // Key changes here:
          // 1. bg-white/10: Uses white alpha to catch light against the dark bg
          // 2. backdrop-blur-xl: Stronger blur to distinguish from background
          // 3. border-white/20: Stronger border for definition
          // 4. backdrop-saturate-150: Boosts colors behind the glass for a premium look
          className="max-w-2xl mx-auto p-6 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-xl backdrop-saturate-150 shadow-2xl"
        >
          <p className="text-lg md:text-xl text-slate-100 font-light leading-relaxed drop-shadow-sm">
            {subtitle}
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        style={{ opacity }}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20"
      >
        <ScrollMouse />
      </motion.div>

      {/* Bottom Fade */}
      <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
