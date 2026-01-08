"use client";

import { motion } from "framer-motion";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center">
        {/* Animated Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-4 border-primary/20 border-t-primary rounded-full"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          className="absolute w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full"
        />

        {/* Pulsing Logo Text */}
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute font-black text-sm tracking-tighter text-primary"
        >
          SARAGEA
        </motion.div>
      </div>

      <p className="mt-6 text-sm font-medium text-muted-foreground animate-pulse uppercase tracking-[0.2em]">
        Loading Excellence...
      </p>
    </div>
  );
}
