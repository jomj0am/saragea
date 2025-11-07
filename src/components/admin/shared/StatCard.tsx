'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

interface StatCardProps {
  title: string
  value: string
  icon: React.ReactNode
  description?: string
  bgColor?: string
  progress?: number // 0-100 for radial progress
  progressColor?: string
}

export default function StatCard({
  title,
  value,
  icon,
  description,
  bgColor = 'from-purple-500 to-indigo-500',
  progress,
  progressColor = '#4f46e5', // default purple
}: StatCardProps) {
  return (
    <Card className="relative overflow-hidden group shadow-lg hover:shadow-xl transition-shadow">
      {/* Top Gradient Stripe */}
      <div
        className={`absolute -top-1 -left-1 right-1 h-1.5 rounded-full bg-gradient-to-r ${bgColor} opacity-80`}
      />

      <CardHeader className="flex justify-between items-center pb-2 relative z-10">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-muted/20 rounded-full text-muted-foreground">{icon}</div>
      </CardHeader>

      <CardContent className="relative z-10 flex flex-col items-center gap-2">

        

        <div className="flex w-full items-center justify-between">
<div className=" ">
                    {/* Animated Value */}
        <motion.div
          className="text-3xl font-bold"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {value}
        </motion.div>
        {/* Optional description */}
        {description && (
          <p className="text-xs text-muted-foreground text-center">{description}</p>
        )}
</div>
        {/* Radial progress */}
        {progress !== undefined && (
          <div className="w-16 h-16 mt-2 text-blue-500">
            <CircularProgressbar
              value={progress}
              text={`${progress}%`}
              strokeWidth={6}
              styles={buildStyles({
                textSize: '24px',
                pathColor: progressColor,
                trailColor: '#e5e7eb',
              })}
            />
          </div>
        )}
        </div>

      </CardContent>

      {/* Hover shine */}
      <div className="absolute inset-0 pointer-events-none rounded-lg bg-gradient-to-tr from-white/0 via-white/10 to-white/0 opacity-0 group-hover:opacity-10 transition-opacity" />
    </Card>
  )
}
