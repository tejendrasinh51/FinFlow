'use client'

import { motion, useAnimation } from 'framer-motion'
import { useEffect } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SparkLine } from '@/components/ui/SparkLine'

export interface MetricCardProps {
  title: string
  value: string
  trend: number
  trendLabel?: string
  sparkData?: number[]
  prefix?: string
  suffix?: string
  loading?: boolean
  updated?: boolean
}

export function MetricCard({
  title,
  value,
  trend,
  trendLabel = 'vs last month',
  sparkData = [],
  prefix = '',
  suffix = '',
  loading = false,
  updated = false,
}: MetricCardProps) {
  const controls = useAnimation()

  useEffect(() => {
    if (updated) {
      controls.start({
        backgroundColor: ['transparent', 'rgba(0,212,255,0.08)', 'transparent'],
        transition: { duration: 0.8 },
      })
    }
  }, [updated, controls])

  const trendColor =
    trend > 0 ? 'var(--color-positive)' :
    trend < 0 ? 'var(--color-negative)' :
    'var(--color-neutral)'

  const TrendIcon = trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendSign = trend > 0 ? '+' : ''

  if (loading) {
    return (
      <div className="metric-card card p-5">
        <div className="skeleton h-3 w-20 mb-4" />
        <div className="skeleton h-8 w-28 mb-2" />
        <div className="skeleton h-3 w-16 mb-4" />
        <div className="skeleton h-12 w-full" />
      </div>
    )
  }

  return (
    <motion.div
      animate={controls}
      className="metric-card card p-5 transition-all duration-200"
    >
      <div className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-3">
        {title}
      </div>

      <div className="font-mono font-medium text-2xl text-text-primary mb-1.5">
        {prefix}{value}{suffix}
      </div>

      <div className="flex items-center gap-1.5 mb-4">
        <TrendIcon size={12} style={{ color: trendColor }} />
        <span className="font-mono text-xs font-medium" style={{ color: trendColor }}>
          {trendSign}{Math.abs(trend).toFixed(1)}%
        </span>
        <span className="text-text-tertiary text-xs font-mono">{trendLabel}</span>
      </div>

      {/* Sparkline */}
      {sparkData && sparkData.length > 0 && (
        <SparkLine data={sparkData} />
      )}
    </motion.div>
  )
}

