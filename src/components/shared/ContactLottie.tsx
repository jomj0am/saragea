"use client";

import Lottie from "lottie-react";
import contactanimation from "../../../public/lottie/contact us.json";
import { motion } from 'framer-motion';
import { Mouse } from "lucide-react";

export const ContactLottie = () => {
  return (
    <Lottie
      animationData={contactanimation}
      className="w-full max-w-md "
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