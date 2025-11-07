"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { Loader2, Languages, Info } from "lucide-react"
import { type Translation } from "@prisma/client"
import { locales } from "@/i18n/config"
import {
  formatTranslationKey,
  translationKeyDescriptions,
} from "@/lib/translation-keys"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

type GroupedTranslations = Record<string, Translation[]>

export default function TranslationEditor({
  initialTranslations,
}: {
  initialTranslations: GroupedTranslations
}) {
  const [translations, setTranslations] = useState(initialTranslations)
  const [savingKey, setSavingKey] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()

  const handleInputChange = (
    namespace: string,
    key: string,
    locale: string,
    value: string
  ) => {
    setTranslations((prev) => ({
      ...prev,
      [namespace]: prev[namespace].map((group) => {
        if (group.key === key && group.locale === locale) {
          return { ...group, value }
        }
        return group
      }),
    }))
  }

  const getTranslation = (
    namespace: string,
    key: string,
    locale: string
  ): Translation => {
    const group = translations[namespace]
    return (
      group.find((t) => t.key === key && t.locale === locale) || {
        id: `${key}-${locale}`,
        key,
        locale,
        value: "",
      }
    )
  }

  const handleSaveNamespace = async (namespace: string) => {
    setSavingKey(namespace)
    const namespaceTranslations = translations[namespace]

    try {
      const payload = namespaceTranslations.map((t) => ({
        key: t.key,
        locale: t.locale,
        value: t.value,
      }))

      const response = await fetch("/api/translations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!response.ok) throw new Error("Failed to save.")

      toast({
        title: "✅ Success!",
        description: `Translations for '${namespace}' saved.`,
      })
      router.refresh()
    } catch  {
      toast({
        variant: "destructive",
        title: "⚠ Error",
        description: `Could not save translations.`,
      })
    } finally {
      setSavingKey(null)
    }
  }

  const shouldUseTextarea = (key: string): boolean => {
    const lowerCaseKey = key.toLowerCase()
    return (
      lowerCaseKey.includes("description") ||
      lowerCaseKey.includes("subtitle") ||
      lowerCaseKey.includes("content")
    )
  }

  const uniqueKeysInNamespace = (namespace: string) => [
    ...new Set(translations[namespace].map((t) => t.key)),
  ]

  return (
    <Accordion
      type="multiple"
      defaultValue={Object.keys(translations).slice(0, 1)}
      className="w-full space-y-6"
    >
      {Object.keys(translations)
        .sort()
        .map((namespace) => (
          <AccordionItem
            value={namespace}
            key={namespace}
            className="rounded-2xl border bg-card/70 shadow-md backdrop-blur-sm transition hover:shadow-lg"
          >
            <AccordionTrigger className="px-6 py-4 text-lg font-semibold hover:no-underline flex items-center gap-3">
              <Languages className="h-5 w-5 text-primary" />
              <span className="capitalize">{namespace}</span>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-10">
                {uniqueKeysInNamespace(namespace)
                  .sort()
                  .map((key) => (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className="space-y-3 border-t pt-6"
                    >
                      <div className="flex items-center gap-2">
                        <Label className="text-base font-semibold">
                          {formatTranslationKey(key)}
                        </Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            {translationKeyDescriptions[key] ||
                              "No description available."}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {locales.map((locale) => {
                          const translation = getTranslation(
                            namespace,
                            key,
                            locale
                          )
                          const InputComponent = shouldUseTextarea(key)
                            ? Textarea
                            : Input

                          return (
                            <motion.div
                              key={locale}
                              whileHover={{ scale: 1.02 }}
                              className="space-y-2 rounded-xl border bg-muted/20 p-4 shadow-sm transition"
                            >
                              <Badge
                                variant="secondary"
                                className="uppercase text-[10px] tracking-wide bg-gradient-to-r from-primary/70 to-purple-400/60 text-white"
                              >
                                {locale}
                              </Badge>
                              <InputComponent
                                value={translation.value}
                                onChange={(e) =>
                                  handleInputChange(
                                    namespace,
                                    key,
                                    locale,
                                    e.target.value
                                  )
                                }
                                className="mt-1 resize-none focus:ring-2 focus:ring-primary/40 transition rounded-lg"
                                rows={shouldUseTextarea(key) ? 3 : undefined}
                                placeholder={`Enter ${locale.toUpperCase()} translation...`}
                              />
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  ))}
              </div>
              <div className="flex justify-end mt-10">
                <motion.div
                  animate={{
                    scale: savingKey === namespace ? [1, 1.05, 1] : 1,
                  }}
                  transition={{
                    repeat: savingKey === namespace ? Infinity : 0,
                    duration: 0.8,
                  }}
                >
                  <Button
                    onClick={() => handleSaveNamespace(namespace)}
                    disabled={savingKey === namespace}
                    className="rounded-full px-8 shadow-lg hover:shadow-primary/30"
                  >
                    {savingKey === namespace && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Save Changes
                  </Button>
                </motion.div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
    </Accordion>
  )
}
