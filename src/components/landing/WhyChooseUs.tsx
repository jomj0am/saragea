"use client";

import Lottie from "lottie-react";
import securityAnimation from "../../../public/lottie/Cyber Security.json";
import paymentAnimation from "../../../public/lottie/Payments.json";
import supportAnimation from "../../../public/lottie/Customer Support.json";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

const features = [
  {
    title: "Secure & Trusted",
    description:
      "Your data and payments are protected with top-tier security measures.",
    animationData: securityAnimation,
    accent: "from-emerald-400 to-emerald-600",
  },
  {
    title: "Seamless Payments",
    description:
      "Pay your rent effortlessly with multiple online payment options.",
    animationData: paymentAnimation,
    accent: "from-indigo-400 to-indigo-600",
  },
  {
    title: "24/7 Support",
    description:
      "Our dedicated support team is always available to assist you.",
    animationData: supportAnimation,
    accent: "from-rose-400 to-rose-600",
  },
];

export default function WhyChooseUs() {
  const t = useTranslations("HomePageV3");
  const [particles, setParticles] = useState<
    { width: number; height: number; top: string; left: string }[]
  >([]);

  useEffect(() => {
    // generate once, on the client
    const arr = Array.from({ length: 18 }).map(() => ({
      width: Math.random() * 5 + 3,
      height: Math.random() * 5 + 3,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }));
    setParticles(arr);
  }, []);

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/20 blur-md"
            style={p}
            animate={{
              y: ["0%", "-20%", "0%"],
              x: ["0%", "10%", "-10%", "0%"],
            }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              repeatType: "loop",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl orboto md:text-4xl font-extrabold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent tracking-tight">
            {t("whyChooseUsTitle")}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t("whyChooseUsSubtitle")}
          </p>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid gap-10 max-w-7xl mx-auto md:px-12 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.2, duration: 0.6 }}
              className="group relative flex flex-col items-center rounded-2xl p-8 backdrop-blur-md  border  border-dashed border-gray-300 dark:border-white/20  hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
            >
              {/* Animated border accent */}
              <div
                className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${feature.accent} opacity-0 group-hover:opacity-20 transition-opacity`}
              />

              {/* Lottie animation */}
              <div className="relative mb-6 h-44 w-50 -mt-4">
                <Lottie
                  animationData={feature.animationData}
                  loop
                  className="h-full w-full"
                />
              </div>

              <h3 className="text-2xl font-semibold text-cyan-50 drop-shadow-sm text-shadow-sm text-shadow-black orboto -mt-11">
                {feature.title}
              </h3>
              <p className="mt-3 text-base text-muted-foreground text-center leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
