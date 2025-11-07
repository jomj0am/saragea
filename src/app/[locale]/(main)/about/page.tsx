// app/[locale]/(main)/about/page.tsx
import { getTranslations } from 'next-intl/server';
import { setRequestLocale } from 'next-intl/server';
import Image from 'next/image';
import HowItWorksSection from '@/components/about/HowItWorksSection'; 
import Spline from '@splinetool/react-spline';
import { ComfortLottie, HandLottie, ScrollMouse, SecurityLottie } from '@/components/about/AboutLotties';
import { BackgroundBlobs } from '../contact/page';



export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const { locale } = resolvedParams;


    
    setRequestLocale(locale);
    const t = await getTranslations('AboutPage');

    return (
        <div className="bg-background -mt-18">
            {/* 1. Hero Section */}
            <section className="relative h-120 pt-12 flex items-center justify-center text-center">
                            <div className="absolute inset-0 z-0 opacity-50">
                <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
            </div>
                <Image src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80" alt="SARAGEA Appartments building exterior" fill className="object-cover" />
                <div className="absolute inset-0 bg-black/60"></div>
                <div className="relative text-white px-4">
                    <h1 className="text-5xl md:text-6xl font-extrabold">{t('heroTitle')}</h1>
                    <p className="mt-4 text-lg md:text-xl max-w-2xl mx-auto">{t('heroSubtitle')}</p>
                </div>
                <ScrollMouse />
            </section>

            {/* 2. Our Story Section */}
<section className="relative py-20  overflow-hidden">

  {/* Animated gradient background that adapts to light/dark */}
  <div className="absolute inset-0">
    {/* gradient mesh blobs */}
    <div className="absolute -top-32 -left-32 w-[40rem] h-[40rem] bg-gradient-to-br from-primary/30 via-pink-400/10 to-purple-600/10 blur-3xl rounded-full dark:from-primary/20 dark:via-purple-400/10 dark:to-indigo-700/20 animate-pulse"></div>
    <div className="absolute top-1/2 right-0 w-[30rem] h-[30rem] bg-gradient-to-tl from-pink-500/20 via-orange-400/10 to-primary/20 blur-3xl rounded-full dark:from-pink-600/20 dark:via-purple-600/10 dark:to-primary/20 animate-pulse delay-1000"></div>

    {/* optional subtle texture */}
                                       <div 
                                className="absolute z-0 inset-0 bg-repeat opacity-[0.04]" 
                                style={{backgroundImage: "url('/assets/patterns/pattern.jpeg')"}}
                               />
  </div>

  <div className="container relative z-10 mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center px-6">
    {/* Text Card with Glassmorphism */}
    <div className="   transition-all hover:scale-[1.02]">
      <h2 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-primary to-pink-500 bg-clip-text text-transparent mb-6">
        {t('storyTitle')}
      </h2>
      <p className="text-lg text-muted-foreground leading-relaxed mb-4">
        {t('storyParagraph1')}
      </p>
      <p className="text-lg text-muted-foreground leading-relaxed">
        {t('storyParagraph2')}
      </p>
    </div>

    {/* Image with floating effect */}
    <div className="relative h-96 w-full rounded-3xl overflow-hidden  group">
      <Image
        src="https://images.unsplash.com/photo-1605276374104-5de67d60924f?q=80"
        alt="Interior of a modern apartment"
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent dark:from-black/40"></div>
    </div>
  </div>
</section>

            
            <HowItWorksSection />

            {/* 4. Our Values Section */}
            <section className="relative py-24">
                                <BackgroundBlobs />
                               <div 
                                className="absolute z-0 inset-0 bg-repeat opacity-[0.05]" 
                                style={{backgroundImage: "url('/assets/patterns/circuit.jpg')"}}
                               />
                <div className="container mx-auto text-center">
                    <h2 className="text-4xl font-bold mb-12">{t('valuesTitle')}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center">
                            <div ><SecurityLottie /></div>
                            <h3 className="text-2xl font-semibold text-shadow-xs orboto text-shadow-black">{t('value1Title')}</h3>
                            <p className="text-muted-foreground mt-2 px-8">{t('value1Desc')}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div ><ComfortLottie  /></div>
                            <h3 className="text-2xl font-semibold text-shadow-xs orboto text-shadow-black">{t('value2Title')}</h3>
                            <p className="text-muted-foreground mt-2 px-8">{t('value2Desc')}</p>
                        </div>
                        <div className="flex flex-col items-center">
                            <div ><HandLottie  /></div>
                            <h3 className="text-2xl  font-semibold text-shadow-xs orboto text-shadow-black ">{t('value3Title')}</h3>
                            <p className="text-muted-foreground mt-2 px-8">{t('value3Desc')}</p>
                        </div>
                    </div>
                </div>
            </section>
            
        </div>
    );
}