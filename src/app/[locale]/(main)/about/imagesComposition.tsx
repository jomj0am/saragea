"use client";

import { motion } from "framer-motion";
import Image from "next/image";

type AdvancedImageCompositionProps = {
  mainImage?: string;
  secondaryImage?: string;
  statValue?: string;
  statLabel?: string;
};

export default function AdvancedImageComposition({
  mainImage = "/assets/media/about/story.avif",
  secondaryImage = "/assets/media/about/story2.avif",
  statValue = "10+",
  statLabel = "Years of Excellence",
}: AdvancedImageCompositionProps) {
  return (
    <div className="relative h-[400px] lg:h-[500px] w-full">
      {/* Decorative Background Elements */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -z-10 animate-pulse" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-500/20 rounded-full blur-[80px] -z-10" />

      {/* Main Large Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-0 right-0 w-[85%] h-[80%] rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-zinc-900 z-10"
      >
        <Image
          src={mainImage}
          alt="Main Visual"
          fill
          className="object-cover transition-transform duration-700 hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
      </motion.div>

      {/* Secondary Image */}
      <motion.div
        initial={{ opacity: 0, y: 50, x: -30 }}
        whileInView={{ opacity: 1, y: 0, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        className="absolute bottom-4 left-0 w-[45%] h-[45%] rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-4 border-white dark:border-zinc-900 z-20"
      >
        <Image
          src={secondaryImage}
          alt="Secondary Visual"
          fill
          className="object-cover transition-transform duration-700 hover:scale-110"
        />
      </motion.div>

      {/* Floating Stat Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="absolute top-12 -left-4 md:left-4 z-30"
      >
        <div className="bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl border border-white/20 p-5 rounded-2xl shadow-xl flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-full text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <div>
            <p className="text-3xl font-extrabold text-foreground">
              {statValue}
            </p>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {statLabel}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Decorative Dot Grid */}
      <div className="absolute bottom-0 right-10 -z-10 opacity-20">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary" />
          ))}
        </div>
      </div>
    </div>
  );
}
