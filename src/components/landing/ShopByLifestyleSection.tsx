'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion } from 'framer-motion'

const lifestyleCategories = [
  {
    titleKey: 'oceanfrontLivingTitle',
    subtitleKey: 'oceanfrontLivingSubtitle',
    imageUrl:
      'https://media.vrbo.com/lodging/22000000/21680000/21679400/21679317/3372ee58.jpg?impolicy=resizecrop&rw=575&rh=575&ra=fill',
    link: '/properties?location=Beach',
  },
  {
    titleKey: 'cityHubTitle',
    subtitleKey: 'cityHubSubtitle',
    imageUrl:
      'https://2br-2ba-apartment-in-the-city-hub.tbilisi-hotels.com/data/Pics/OriginalPhoto/15486/1548629/1548629473/2br-2ba-apartment-in-the-city-hub-tbilisi-pic-18.JPEG',
    link: '/properties?location=Masaki',
  },
  {
    titleKey: 'familyHomesTitle',
    subtitleKey: 'familyHomesSubtitle',
    imageUrl:
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070',
    link: '/properties?minRooms=3',
  },
  {
    titleKey: 'budgetFriendlyTitle',
    subtitleKey: 'budgetFriendlySubtitle',
    imageUrl:
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=2070',
    link: '/properties?maxPrice=500000',
  },
]

type Category = typeof lifestyleCategories[number]

export default function ShopByLifestyleSection() {
  const t = useTranslations('HomePageV3.ShopByLifestyle')
  const [active, setActive] = useState(0)

  // auto-slide on mobile
  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % lifestyleCategories.length)
    }, 8000)
    return () => clearInterval(id)
  }, [])

  return (
    <section className="py-24 px-4 md:px-0">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold bg-gradient-to-r from-primary orboto  to-purple-500 bg-clip-text text-transparent">
            {t('sectionTitle')}
          </h2>
          <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
            {t('sectionSubtitle')}
          </p>
        </div>

        {/* Desktop grid */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {lifestyleCategories.map((category) => (
            <LifestyleCard key={category.titleKey} category={category} t={t} />
          ))}
        </div>

        {/* Mobile hero + thumbs */}
        <div className="md:hidden flex flex-col gap-4">


          {/* Main card with smooth transform (not unmounted) */}
          <motion.div
            key={active}
            animate={{ opacity: 1, x: 0 }}
            initial={{ opacity: 0, x: 30 }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          >
            <LifestyleCard
              category={lifestyleCategories[active]}
              t={t}
              large
            />
          </motion.div>

          {/* Top dots indicator */}
          <div className="flex justify-center mb-3 gap-2">
            {lifestyleCategories.map((_, i) => (
              <button
                key={i}
                aria-label={`Slide ${i + 1}`}
                onClick={() => setActive(i)}
                className={`h-2 w-2 rounded-full transition-all ${
                  i === active ? 'bg-primary scale-110 w-4' : 'bg-gray-400/60'
                }`}
              />
            ))}
          </div>

          {/* thumbs row */}
          <div className="flex justify-center gap-3">
            {lifestyleCategories.map((cat, i) => (
              <button
                key={cat.titleKey}
                onClick={() => setActive(i)}
                className={`relative h-20 w-20 overflow-hidden rounded-lg border-2 transition-all ${
                  i === active
                    ? 'border-primary scale-105'
                    : 'border-transparent opacity-70'
                }`}
              >
                <Image
                  src={cat.imageUrl}
                  alt={t(cat.titleKey)}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function LifestyleCard({
  category,
  t,
  large = false,
}: {
  category: Category
  t: (key: string) => string
  large?: boolean
}) {
  return (
    <Link href={category.link}>
      <Card
        className={`relative overflow-hidden group rounded-2xl ${
          large ? 'h-80 sm:h-[28rem]' : 'h-96'
        }`}
      >
        <Image
          src={category.imageUrl}
          alt={t(category.titleKey)}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <h3 className="text-2xl font-bold drop-shadow-lg ">
            {t(category.titleKey)}
          </h3>
          <p className="opacity-80 text-sm mt-1">
            {t(category.subtitleKey)}
          </p>
          <div className="flex items-center mt-4 text-sm font-semibold md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            Explore
            <ArrowRight className="ml-2 h-4 w-4" />
          </div>
        </div>
      </Card>
    </Link>
  )
}
