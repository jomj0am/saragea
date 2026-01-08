"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("saragea-cookie-consent");
    if (!consent) {
      // Small delay for better UX
      setTimeout(() => setShow(true), 1000);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("saragea-cookie-consent", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl"
        >
          <div className="relative overflow-hidden rounded-2xl border border-white/20 bg-white/80 dark:bg-zinc-900/80 p-6 shadow-2xl backdrop-blur-xl">
            {/* Background Decor */}
            <div className="absolute -left-4 -top-4 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />

            <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-start gap-4">
                <div className="rounded-full bg-primary/10 p-3 text-primary">
                  <Cookie className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">We use cookies</h3>
                  <p className="text-sm text-muted-foreground">
                    To ensure you get the best experience on our website.{" "}
                    <Link
                      href="/privacy"
                      className="underline hover:text-primary"
                    >
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="ghost" onClick={() => setShow(false)}>
                  Decline
                </Button>
                <Button
                  onClick={accept}
                  className="rounded-full px-6 shadow-lg bg-primary text-white hover:bg-primary/90"
                >
                  Accept
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
