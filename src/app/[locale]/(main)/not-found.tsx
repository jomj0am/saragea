"use client";

import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Home, Search } from "lucide-react";
import Lottie from "lottie-react";
import error404Animation from "../../../../public/lottie/404-animation.json.json"; // Use a cute 404 animation

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden px-4">
      {/* Background Blobs */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl w-full text-center relative z-10"
      >
        <div className="w-full max-w-md mx-auto mb-8">
          <Lottie animationData={error404Animation} loop={true} />
        </div>

        <h1 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
          LOST IN SPACE?
        </h1>

        <p className="text-muted-foreground text-lg mb-10 max-w-md mx-auto">
          The property or page you are looking for has moved to another
          neighborhood or doesn&apos;t exist anymore.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button
            asChild
            size="lg"
            className="rounded-full px-8 shadow-lg hover:shadow-primary/20 group"
          >
            <Link href="/">
              <Home className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Back to Home
            </Link>
          </Button>

          <Button
            variant="outline"
            asChild
            size="lg"
            className="rounded-full px-8 border-dashed"
          >
            <Link href="/properties">
              <Search className="mr-2 h-5 w-5" />
              Browse Properties
            </Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
