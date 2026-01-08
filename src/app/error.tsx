"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { RefreshCcw,  LifeBuoy } from "lucide-react";
import Lottie from "lottie-react";
import networkErrorAnimation from "../../public/lottie/No internet connection - Empty state.json";

export default function Error({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    console.error("Network Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950 px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative max-w-lg w-full rounded-[2.75rem] bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-8 md:p-12    text-center"
      >
        {/* Glow */}
        <div className="absolute inset-0 -z-10 rounded-[3rem] bg-gradient-to-br from-blue-500/10 via-cyan-400/10 to-indigo-500/10 blur-2xl" />

        {/* Animation */}
        <div className="w-sm -mb-50 -z-10 mx-auto inset-0 opacity-40">
          <Lottie animationData={networkErrorAnimation} loop />
        </div>

        <div className="relative z-10">
          {/* Copy */}
          <h1 className="text-3xl font-bold text-shadow-2xs tracking-tight mb-3">
            Network error. Not your fault.
          </h1>

          <p className="text-muted-foreground text-base leading-relaxed mb-8">
            We couldn’t connect to our servers right now. This usually fixes
            itself — just give it another try.
            <br />
            If the problem keeps popping up, our support team’s got you.
          </p>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              size="lg"
              onClick={() => window.location.reload()}
              className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25"
            >
              <RefreshCcw className="mr-2 h-4 w-4" />
              Try Again
            </Button>

            <Button
              variant="outline"
              size="lg"
              className="rounded-full border border-dashed hover:bg-muted/50"
              onClick={() =>
                (window.location.href = "mailto:support@saragea.com")
              }
            >
              <LifeBuoy className="mr-2 h-4 w-4" />
              Contact Support
            </Button>
          </div>
        </div>
        {/* Footer hint */}
        <p className="mt-6 text-xs text-muted-foreground">
          Tip: Check your internet connection or try refreshing the page.
        </p>
      </motion.div>
    </div>
  );
}
