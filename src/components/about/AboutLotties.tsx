"use client";

import Lottie from "lottie-react";
import cctvanimation from "../../../public/lottie/CCTV Camera.json";
import handshakeanimation from "../../../public/lottie/men shaking hands.json";
import comfortanimation from "../../../public/lottie/a woman reading on the sofa.json";
import { motion } from 'framer-motion';
import { Mouse } from "lucide-react";

export const SecurityLottie = () => {
  return (
    <Lottie
      animationData={cctvanimation}
      className="w-full max-w-[14rem] "
    />
  );
};

export const HandLottie = () => {
  return (
    <Lottie
      animationData={handshakeanimation}
      className="w-full max-w-[14rem] "
    />
  );
};

export const ComfortLottie = () => {
  return (
    <Lottie
      animationData={comfortanimation}
      className="w-full max-w-[14rem] "
    />
  );
};


export const ScrollMouse =() =>{
    return(
                        <motion.div
  initial={{ opacity: 0, y: 10 }}
  animate={{ opacity: 1, y: [0, 10, 0] }}
  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
  className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center"
>
  <Mouse className="h-8 w-8  animate-bounce fill-indigo-100 text-indigo-300 drop-shadow-md drop-shadow-black" />
  {/* <span className="mt-2 text-xs uppercase tracking-wider text-primary/80">
    Scroll
  </span> */}
</motion.div>
    )
}