'use client'

import Spline from '@splinetool/react-spline'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Link } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Loader2, Eye, Star } from 'lucide-react'
import { Suspense, useEffect, useState } from 'react'

function SplineLoader() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-secondary/80 backdrop-blur-md rounded-3xl">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
    </div>
  )
}

export default function Interactive3DPreview() {
  const t = useTranslations('HomePageV3.Interactive3D')
  const [hovered, setHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [sparkles, setSparkles] = useState<{w:number; h:number; top:number; left:number}[]>([])



  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - left) / width - 0.5) * 20
    const y = ((e.clientY - top) / height - 0.5) * 15
    setMousePos({ x, y })
  }

  const handleMouseLeave = () => setMousePos({ x: 0, y: 0 })

    useEffect(() => {
    // Only runs client-side, so SSR HTML is empty/stable
    const arr = Array.from({ length: 20 }, () => ({
      w: Math.random() * 4 + 2,
      h: Math.random() * 4 + 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
    }))
    setSparkles(arr)
  }, [])

  return (
<section className="relative overflow-hidden bg-gradient-to-b from-background via-background/95 to-background/80 py-15">
      <div className="absolute inset-0 pointer-events-none">
        {sparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-primary/30 blur-md"
            style={{
              width: s.w,
              height: s.h,
              top: `${s.top}%`,
              left: `${s.left}%`,
            }}
            animate={{ y: ['0%', '-20%', '0%'], x: ['0%', '10%', '-10%', '0%'] }}
            transition={{
              duration: 8 + Math.random() * 6,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      <div className="container relative z-10 mx-auto px-4">


        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >

        {/* headline */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="mb-20 text-start"
        >
          <h2 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r orboto from-primary to-purple-500 bg-clip-text text-transparent tracking-tight">
            {t('sectionTitle')}
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            {t('sectionSubtitle')}
          </p>
        </motion.div>

                  {/* content column */}

            <h3 className="md:text-3xl text-2xl font-semibold">{t('propertyTitle')}</h3>
            <p className="text-lg text-muted-foreground roboto leading-relaxed">
              {t('propertyDescription')}
            </p>

            {/* feature list */}
            <ul className="space-y-2">
              {[t('feature1'), t('feature2'), t('feature3')].map((feat, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="flex items-center gap-3  roboto  "
                >
                  <Star className=" h-5 w-5 fill-amber-100 text-amber-300  shrink-0" />
                  {feat}
                </motion.li>
              ))}
            </ul>

 

            {/* CTA buttons */}
            <div className="flex flex-wrap gap-4 pt-6">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-primary to-purple-500 text-white shadow-xl hover:scale-105 transition-transform relative overflow-hidden"
              >
                <Link href="/properties">{t('ctaButton')}</Link>
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  window.open(
                    'https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode',
                    '_blank'
                  )
                }
                className="flex items-center gap-2 hover:scale-105 transition-transform"
              >
                <Eye className="h-5 w-5" /> View Full 3D
              </Button>
            </div>
          </motion.div>

          {/* 3D Preview stays the same */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative h-[550px] w-full rounded-3xl shadow-2xl overflow-hidden cursor-grab bg-gradient-to-tl from-purple-50 to-primary/5"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onMouseEnter={() => setHovered(true)}
          >
            <motion.div
              animate={{
                rotateY: hovered ? mousePos.x : 0,
                rotateX: hovered ? -mousePos.y : 0,
                transition: { type: 'spring', stiffness: 50, damping: 12 }
              }}
              className="absolute inset-0"
            >
              <Suspense fallback={<SplineLoader />}>
                <Spline scene="https://prod.spline.design/HqdfCmOueigtautT/scene.splinecode" />
              </Suspense>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}


