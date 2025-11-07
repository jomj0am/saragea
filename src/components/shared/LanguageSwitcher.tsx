// components/shared/LanguageSwitcher.tsx
"use client"

import { useLocale } from "next-intl"
import { usePathname, useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useTransition } from "react"
import { motion } from "framer-motion"

// Flag emojis as quick visuals (you can replace with SVG icons later)
const LANGUAGES = [
  { value: "en", label: "English", flag: "🇺🇸" },
  { value: "sw", label: "Kiswahili", flag: "🇹🇿" },
  { value: "fr", label: "Français", flag: "🇫🇷" },
]

export default function LanguageSwitcher() {
  const [isPending, startTransition] = useTransition()
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const onSelectChange = (value: string) => {
    const segments = pathname.split("/")
    const knownLocales = ["en", "sw", "fr"]
    if (knownLocales.includes(segments[1])) {
      segments.splice(1, 1)
    }
    const newPath = segments.join("/")

    startTransition(() => {
      router.replace(`/${value}${newPath}`)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      className="inline-block"
    >
      <Select
        defaultValue={locale}
        onValueChange={onSelectChange}
        disabled={isPending}
      >
        <SelectTrigger className="w-[130px] rounded-2xl border border-zinc-200/40 bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md shadow-md hover:shadow-lg transition-all duration-300 px-3 py-2 font-medium">
          <SelectValue placeholder="Language" />
        </SelectTrigger>

        <SelectContent className="rounded-2xl border border-zinc-200/30 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl shadow-2xl p-2">
          {LANGUAGES.map(({ value, label, flag }) => (
            <SelectItem
              key={value}
              value={value}
              className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer transition-all hover:bg-gradient-to-r hover:from-indigo-500/10 hover:to-amber-500/10 focus:bg-zinc-100 dark:focus:bg-zinc-800"
            >
              <span className="text-lg">{flag}</span>
              <span>{label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  )
}
