'use client'

import { motion } from 'framer-motion'
import { ArrowDown, HelpCircle, TrendingUp } from 'lucide-react'

interface FunnelStage {
  stage: string
  volume: number
  label: string
}

const defaultStages: FunnelStage[] = [
  { stage: 'Unique Visitors', volume: 120000, label: 'Top of Funnel' },
  { stage: 'Signups / Trials', volume: 28400, label: '23.6% Conv' },
  { stage: 'Active Onboarding', volume: 18200, label: '64.1% Conv' },
  { stage: 'Paid Subscriptions', volume: 5460, label: '30.0% Conv' },
  { stage: 'Contract Expansion', volume: 1380, label: '25.2% Conv' },
]

export function FunnelChart() {
  const maxVolume = defaultStages[0].volume

  return (
    <div className="card p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div>
          <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider">Conversion Funnel</h3>
          <p className="text-[10px] font-mono text-text-tertiary">Performance across the growth and expansion funnel</p>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <TrendingUp size={12} />
          <span>Total Funnel Yield: 1.15%</span>
        </div>
      </div>

      <div className="space-y-4">
        {defaultStages.map((stage, idx) => {
          const widthPercent = (stage.volume / maxVolume) * 100
          // Calculate step-to-step conversion
          const stepConversion = idx === 0 ? null : (stage.volume / defaultStages[idx - 1].volume) * 100
          const overallConversion = (stage.volume / maxVolume) * 100

          return (
            <div key={idx} className="space-y-1">
              {/* Step indicator */}
              {idx > 0 && stepConversion !== null && (
                <div className="flex items-center justify-center -my-1">
                  <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700/40 rounded-full px-2 py-0.5 text-[9px] font-mono text-text-secondary shadow-sm">
                    <ArrowDown size={10} className="text-cyan-400" />
                    <span>Conversion Rate: <strong>{stepConversion.toFixed(1)}%</strong></span>
                    <span className="text-[8px] text-text-tertiary">({100 - stepConversion}% drop-off)</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-12 gap-3 items-center">
                {/* Stage Label */}
                <div className="col-span-3 font-mono text-xs">
                  <span className="text-text-primary font-semibold block leading-tight">{stage.stage}</span>
                  <span className="text-[9px] text-text-tertiary">{stage.label}</span>
                </div>

                {/* Funnel Bar */}
                <div className="col-span-6 relative h-7 bg-slate-800/20 border border-slate-800 rounded-lg overflow-hidden flex items-center">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${widthPercent}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1, ease: 'easeOut' }}
                    className="h-full bg-gradient-to-r from-cyan-500/40 to-blue-600/40 border-r-2 border-cyan-400/80 rounded-r"
                  />
                  <span className="absolute left-3 text-[10px] font-mono font-bold text-text-primary">
                    {stage.volume.toLocaleString()}
                  </span>
                </div>

                {/* Performance Stats */}
                <div className="col-span-3 text-right font-mono text-[10px]">
                  <span className="text-text-secondary block">Overall Yield</span>
                  <span className="text-text-primary font-semibold">
                    {overallConversion === 100 ? 'Baseline (100%)' : `${overallConversion.toFixed(2)}%`}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
