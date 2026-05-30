'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { SparkLine } from '@/components/ui/SparkLine'

interface KPICardProps {
  title: string
  value: string
  prefix?: string
  suffix?: string
  trend?: number
  trendLabel?: string
  sparkData?: number[]
  benchmark?: string
  benchmarkLabel?: string
  accentColor?: string
  loading?: boolean
  badge?: string
  badgeColor?: string
}

export function KPICard({
  title, value, prefix = '', suffix = '', trend, trendLabel,
  sparkData, benchmark, benchmarkLabel, accentColor = '#00D4FF',
  loading, badge, badgeColor,
}: KPICardProps) {
  const trendPositive = trend !== undefined ? trend >= 0 : true
  const TrendIcon = trend === undefined ? Minus : trend > 0 ? TrendingUp : TrendingDown

  return (
    <div
      className="metric-card card p-4 relative overflow-hidden group cursor-default"
      style={{ '--kpi-accent': accentColor } as React.CSSProperties}
    >
      {/* Left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full opacity-60 group-hover:opacity-100 transition-opacity"
        style={{ background: accentColor }}
      />

      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <div className="text-text-tertiary text-[10px] font-mono uppercase tracking-wider">{title}</div>
        {badge && (
          <span
            className="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase"
            style={{
              color: badgeColor ?? accentColor,
              borderColor: (badgeColor ?? accentColor) + '40',
              background: (badgeColor ?? accentColor) + '10',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      {/* Value */}
      {loading ? (
        <div className="h-7 w-24 skeleton rounded mb-2" />
      ) : (
        <div className="flex items-baseline gap-0.5 mb-2">
          {prefix && <span className="text-text-tertiary text-sm font-mono">{prefix}</span>}
          <span className="font-mono font-bold text-xl text-text-primary leading-none">{value}</span>
          {suffix && <span className="text-text-tertiary text-sm font-mono">{suffix}</span>}
        </div>
      )}

      {/* Trend */}
      {trend !== undefined && !loading && (
        <div className={`flex items-center gap-1 text-[10px] font-mono mb-3 ${
          trendPositive ? 'text-positive' : 'text-negative'
        }`}>
          <TrendIcon size={10} />
          <span>{Math.abs(trend)}%</span>
          {trendLabel && <span className="text-text-tertiary ml-0.5">{trendLabel}</span>}
        </div>
      )}

      {/* Sparkline */}
      {sparkData && !loading && (
        <SparkLine data={sparkData} color={accentColor} height={36} />
      )}

      {/* Benchmark */}
      {benchmark && !loading && (
        <div className="mt-2 pt-2 border-t border-[var(--color-border)] flex items-center justify-between">
          <span className="text-text-tertiary text-[9px] font-mono">{benchmarkLabel ?? 'Benchmark'}</span>
          <span className="text-text-tertiary text-[9px] font-mono">{benchmark}</span>
        </div>
      )}
    </div>
  )
}
