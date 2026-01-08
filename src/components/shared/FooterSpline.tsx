"use client";

import Spline from "@splinetool/react-spline";

export default function FooterSpline() {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none opacity-50 dark:opacity-30">
      <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent" />
    </div>
  );
}
