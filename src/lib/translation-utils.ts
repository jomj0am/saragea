// @/lib/translation-utils.ts
import { type Translation } from "@prisma/client"

export type TranslationCategory = "UI" | "Content" | "Error" | "SEO" | "Notification" | "System"

export const translationKeyDescriptions: Record<string, string> = {
  "heroTitle": "Main title for hero sections",
  "heroSubtitle": "Subtitle or description for hero sections",
  "buttonLabel": "Label for buttons",
  "errorMessage": "Error messages for form validation",
  "successMessage": "Success confirmation messages",
  "loadingText": "Text displayed during loading states",
  "pageTitle": "SEO page titles",
  "metaDescription": "SEO meta descriptions",
  "navigationLabel": "Labels for navigation items",
  "footerText": "Text in footer sections",
  "placeholder": "Input field placeholder text",
  "tooltip": "Tooltip text for icons and buttons",
  "alert": "Alert and notification messages",
  "confirmation": "Confirmation dialog messages",
  "emptyState": "Text for empty state components",
  "helpText": "Help and guidance text",
  "legal": "Legal and compliance text",
  "currency": "Currency and pricing related text",
  "unit": "Measurement units and labels",
  "dateFormat": "Date and time format text",
  "status": "Status indicators and labels"
}

export function formatTranslationKey(key: string): string {
  return key
    .split('.')
    .map(part =>
      part
        .replace(/([A-Z])/g, ' $1')
        .replace(/_/g, ' ')
        .trim()
    )
    .join(' › ')
    .replace(/^./, str => str.toUpperCase())
}

export function getKeyCategory(key: string): TranslationCategory {
  const lowerKey = key.toLowerCase()
  
  if (lowerKey.includes('error') || lowerKey.includes('invalid') || lowerKey.includes('failed')) {
    return "Error"
  }
  if (lowerKey.includes('title') || lowerKey.includes('description') || lowerKey.includes('meta')) {
    return "SEO"
  }
  if (lowerKey.includes('button') || lowerKey.includes('label') || lowerKey.includes('placeholder')) {
    return "UI"
  }
  if (lowerKey.includes('message') || lowerKey.includes('notification') || lowerKey.includes('alert')) {
    return "Notification"
  }
  if (lowerKey.includes('system') || lowerKey.includes('config') || lowerKey.includes('setting')) {
    return "System"
  }
  return "Content"
}

export function categorizeKeys(translations: Translation[]): Array<{
  name: TranslationCategory
  count: number
  color: string
}> {
  const categories: Record<TranslationCategory, number> = {
    UI: 0,
    Content: 0,
    Error: 0,
    SEO: 0,
    Notification: 0,
    System: 0
  }

  translations.forEach(translation => {
    const category = getKeyCategory(translation.key)
    categories[category]++
  })

  return Object.entries(categories).map(([name, count]) => ({
    name: name as TranslationCategory,
    count,
    color: getCategoryColor(name as TranslationCategory)
  }))
}

function getCategoryColor(category: TranslationCategory): string {
  switch (category) {
    case "UI": return "blue"
    case "Content": return "green"
    case "Error": return "red"
    case "SEO": return "purple"
    case "Notification": return "yellow"
    case "System": return "gray"
    default: return "gray"
  }
}

export function getCompletionStats(translations: Translation[]) {
  const total = translations.length
  const completed = translations.filter(t => t.value.trim().length > 0).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  
  return { total, completed, percentage }
}