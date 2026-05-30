'use client'

import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Info } from 'lucide-react'

// Cohort retention data: rows=acquisition month, cols=months since acquisition
const generateCohortData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const data = months.map((month, cohortIdx) => {
    const maxMonths = 12 - cohortIdx
    const baseRetention = 0.78 + (cohortIdx * 0.01) // improving cohorts over time
    const row: { month: string; retention: (number | null)[] } = {
      month,
      retention: Array.from({ length: 12 }, (_, i) => {
        if (i >= maxMonths) return null
        if (i === 0) return 1.0
        const decay = Math.pow(baseRetention, i) * (1 - Math.random() * 0.04)
        return Math.min(1, Math.max(0, decay))
      }),
    }
    return row
  })
  return data
}

const cohortData = generateCohortData()

const getColor = (value: number | null) => {
  if (value === null) return 'transparent'
  if (value >= 0.9) return 'rgba(0,212,255,0.9)'
  if (value >= 0.75) return 'rgba(0,212,255,0.65)'
  if (value >= 0.60) return 'rgba(0,212,255,0.42)'
  if (value >= 0.45) return 'rgba(245,158,11,0.55)'
  if (value >= 0.30) return 'rgba(239,68,68,0.45)'
  return 'rgba(239,68,68,0.25)'
}

export function CohortHeatmap() {
  const [hovered, setHovered] = useState<{ row: number; col: number; val: number } | null>(null)

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display font-semibold text-sm text-text-primary">Cohort Retention Heatmap</h3>
        <div className="group relative">
          <Info size={13} className="text-text-tertiary cursor-help" />
          <div className="absolute left-5 top-0 z-20 w-56 card p-2.5 text-[10px] font-mono text-text-secondary invisible group-hover:visible shadow-cyan-md">
            Each row is a user cohort acquired in that month. Each column shows % still active N months later.
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Column headers */}
          <div className="flex mb-1 ml-10">
            {Array.from({ length: 12 }, (_, i) => (
              <div key={i} className="flex-1 text-center text-[9px] font-mono text-text-tertiary">
                M{i}
              </div>
            ))}
          </div>

          {/* Rows */}
          {cohortData.map((cohort, ri) => (
            <div key={cohort.month} className="flex items-center mb-0.5">
              {/* Row label */}
              <div className="w-10 text-[9px] font-mono text-text-tertiary flex-shrink-0">{cohort.month}</div>
              {/* Cells */}
              {cohort.retention.map((val, ci) => (
                <motion.div
                  key={ci}
                  className="flex-1 h-6 mx-px rounded-sm flex items-center justify-center cursor-default relative"
                  style={{ background: getColor(val) }}
                  onMouseEnter={() => val !== null && setHovered({ row: ri, col: ci, val })}
                  onMouseLeave={() => setHovered(null)}
                  whileHover={{ scale: val !== null ? 1.1 : 1, zIndex: 10 }}
                >
                  {val !== null && val >= 0.5 && (
                    <span className="text-[8px] font-mono font-bold text-canvas/90">
                      {Math.round(val * 100)}
                    </span>
                  )}
                  {val !== null && val < 0.5 && (
                    <span className="text-[8px] font-mono font-bold text-text-secondary">
                      {Math.round(val * 100)}
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-30 card px-3 py-2 text-xs font-mono shadow-cyan-md border border-cyan/20 whitespace-nowrap">
          <span className="text-text-secondary">{cohortData[hovered.row].month} cohort · M{hovered.col} →</span>{' '}
          <span className="text-cyan font-bold">{Math.round(hovered.val * 100)}%</span>
          <span className="text-text-tertiary ml-1">retained</span>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-3 mt-3 flex-wrap">
        <span className="text-[9px] font-mono text-text-tertiary">Retention:</span>
        {[
          { label: '90%+', color: 'rgba(0,212,255,0.9)' },
          { label: '75%+', color: 'rgba(0,212,255,0.55)' },
          { label: '60%+', color: 'rgba(0,212,255,0.35)' },
          { label: '45%+', color: 'rgba(245,158,11,0.55)' },
          { label: '<45%', color: 'rgba(239,68,68,0.45)' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-sm" style={{ background: l.color }} />
            <span className="text-[9px] font-mono text-text-tertiary">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
