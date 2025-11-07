// components/landing/CtaSection.tsx
'use client';

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react"; // Import session hook
import { useAuthModalStore } from "@/store/auth-modal-store"; // Import auth modal store
import { useRouter } from "@/i18n/navigation"; // Import router
import Lottie from "lottie-react";
import { motion, Variants } from "framer-motion";
import ctaAnimation from '../../../public/lottie/City Skyline.json'; 


/* --- Floating blurred blobs --- */
const BackgroundBlobs = () => (
  <div className="absolute inset-0 overflow-hidden z-10 pointer-events-none">
    <div className="absolute top-[10%] -left-24 w-72 h-72 bg-cyan-200/20 rounded-full blur-3xl animate-blob-spin dark:bg-cyan-900/40"></div>
    <div className="absolute bottom-[5%] -right-24 w-80 h-80 bg-indigo-700/20 rounded-full blur-3xl animate-blob-spin animation-delay-4000 dark:bg-indigo-950/40"></div>
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-300/10 rounded-full blur-3xl animate-blob-spin animation-delay-2000 dark:bg-fuchsia-900/20"></div>
  </div>
);
export default function CtaSection() {
    const t = useTranslations('HomePageV3'); // Tumia namespace maalum
    const { data: session, status } = useSession();
    const { openModal } = useAuthModalStore();
    const router = useRouter();

    const handleCtaClick = () => {
        // Ikiwa mtumiaji ameingia, mpeleke kwenye ukurasa wa mali
        if (session) {
            router.push('/properties');
        } else {
            // Ikiwa hajaingia, fungua modal ya usajili
            openModal('register');
        }
    };

    const FADE_UP_VARIANTS: Variants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
    };

    return (
        // --- REKEBISHO #1: Background ya Kuvutia ---
        <section className="relative py-18 sm:py-32 dark:bg-gray-900 bg-slate-50 text-white overflow-hidden  ">
            <BackgroundBlobs/>
            {/* Background Pattern */}
            <div 
                className="absolute inset-0 bg-repeat opacity-[0.05]" 
                style={{backgroundImage: "url('/assets/patterns/circuit.jpg')"}}
            />
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 dark:from-black/80 via-transparent to-transparent"></div>

            <div className="container mx-auto relative z-10 ">
                <div className=" items-center  relative z-40 mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2 px-4 md:px-20">
                    
                    {/* Sehemu ya Kushoto (Maudhui) */}
                    <motion.div
                        initial="hidden"
                        whileInView="show"
                        viewport={{ once: true, amount: 0.5 }}
                        variants={{ hidden: {}, show: { transition: { staggerChildren: 0.2 } } }}
                        className="text-center lg:text-left "
                    >
                        <motion.h2 
                            variants={FADE_UP_VARIANTS} 
                            className="text-3xl lg:text-5xl text-shadow-md bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent orboto font-extrabold tracking-tight"
                        >
                            {t('ctaTitle')}
                        </motion.h2>
                        <motion.p 
                            variants={FADE_UP_VARIANTS} 
                            className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0"
                        >
                            {t('ctaSubtitle')}
                        </motion.p>
                        <motion.div 
                            variants={FADE_UP_VARIANTS} 
                            className="mt-8"
                        >
                            <Button 
                                variant="secondary" 
                                size="lg" 
                                className="px-8 py-6 text-lg font-bold  shadow-lg rounded-full drop-shadow-lg drop-shadow-black/40 transform hover:scale-105 transition-transform"
                                onClick={handleCtaClick}
                                // Usionyeshe kitufe mpaka session iwe imepakiwa
                                disabled={status === 'loading'}
                            >
                                {t('ctaButton')}
                            </Button>
                        </motion.div>
                    </motion.div>

                    {/* Sehemu ya Kulia (Lottie Animation) */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className=" flex justify-center"
                    >
                        <Lottie animationData={ctaAnimation} className="w-full max-w-[18rem] md:max-w-[20rem]" />
                    </motion.div>
                </div>
            </div>
        </section>
    );
}