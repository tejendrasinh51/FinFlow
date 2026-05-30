'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

interface BurnGaugeProps {
  burnRate: number      // monthly burn in dollars
  cashOnHand: number   // total cash
  mrr: number          // monthly revenue
}

export function BurnGauge({ burnRate = 1240000, cashOnHand = 18500000, mrr = 2890000 }: BurnGaugeProps) {
  const netBurn = Math.max(0, burnRate - mrr)
  const runway = netBurn > 0 ? cashOnHand / netBurn : 999
  const isHealthy = runway > 18
  const isWarning = runway > 9 && runway <= 18
  const isDanger = runway <= 9

  const gaugeColor = isDanger ? '#EF4444' : isWarning ? '#F59E0B' : '#10B981'
  const pct = Math.min(1, runway / 36) // normalize 0-36 months

  // SVG arc calculations
  const r = 56
  const cx = 80
  const cy = 75
  const startAngle = Math.PI
  const endAngle = 2 * Math.PI
  const sweep = endAngle - startAngle

  const arcPath = (angle: number) => {
    const x = cx + r * Math.cos(startAngle + angle * sweep)
    const y = cy + r * Math.sin(startAngle + angle * sweep)
    return `${x.toFixed(2)},${y.toFixed(2)}`
  }

  const bgArc = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${cx + r},${cy}`
  const fillEnd = arcPath(pct)
  const fillArc = `M ${cx - r},${cy} A ${r},${r} 0 0,1 ${fillEnd}`

  const fmtM = (v: number) => `$${(v / 1000000).toFixed(1)}M`
  const fmtK = (v: number) => v >= 1000000 ? fmtM(v) : `$${(v / 1000).toFixed(0)}K`

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-display font-semibold text-sm text-text-primary">Burn Rate & Runway</h3>
        {isHealthy && <CheckCircle2 size={13} className="text-positive" />}
        {isWarning && <AlertTriangle size={13} className="text-warning" />}
        {isDanger && <AlertTriangle size={13} className="text-negative" />}
      </div>

      <div className="flex items-center gap-6">
        {/* Gauge SVG */}
        <div className="flex-shrink-0">
          <svg width="160" height="90" viewBox="0 0 160 90">
            {/* Background track */}
            <path d={bgArc} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
            {/* Colored fill */}
            <motion.path
              d={fillArc}
              fill="none"
              stroke={gaugeColor}
              strokeWidth="10"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: pct }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              style={{ filter: `drop-shadow(0 0 6px ${gaugeColor}60)` }}
            />
            {/* Center label */}
            <text x={cx} y={cy - 8} textAnchor="middle" fill={gaugeColor} fontSize="18" fontWeight="700" fontFamily="JetBrains Mono">
              {runway >= 99 ? '∞' : Math.floor(runway)}
            </text>
            <text x={cx} y={cy + 8} textAnchor="middle" fill="#3A4A5C" fontSize="8" fontFamily="JetBrains Mono">
              months runway
            </text>
          </svg>
        </div>

        {/* Stats */}
        <div className="space-y-3 flex-1">
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">Monthly Burn</div>
            <div className="font-mono font-bold text-sm text-negative">{fmtK(burnRate)}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">Cash on Hand</div>
            <div className="font-mono font-bold text-sm text-text-primary">{fmtM(cashOnHand)}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-0.5">Net Burn / mo</div>
            <div className={`font-mono font-bold text-sm flex items-center gap-1 ${netBurn > 0 ? 'text-warning' : 'text-positive'}`}>
              {netBurn > 0 ? <AlertTriangle size={11} /> : <TrendingUp size={11} />}
              {netBurn > 0 ? `-${fmtK(netBurn)}` : 'Cash flow+'}
            </div>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <div className={`mt-3 px-3 py-1.5 rounded-lg text-[10px] font-mono flex items-center gap-2 ${
        isHealthy ? 'bg-positive/8 text-positive border border-positive/15' :
        isWarning ? 'bg-warning/8 text-warning border border-warning/15' :
        'bg-negative/8 text-negative border border-negative/15'
      }`}>
        {isHealthy && '✓ Healthy runway — above 18 months threshold'}
        {isWarning && '⚠ Monitor closely — runway below 18 months'}
        {isDanger && '✗ Critical — raise capital or cut burn immediately'}
      </div>
    </div>
  )
}
