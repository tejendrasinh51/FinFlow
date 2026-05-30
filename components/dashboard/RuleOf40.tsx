'use client'

import { motion } from 'framer-motion'
import { Award, Zap, HelpCircle } from 'lucide-react'

interface RuleOf40Props {
  growthRate?: number
  profitMargin?: number
}

export function RuleOf40({ growthRate = 28.5, profitMargin = 16.2 }: RuleOf40Props) {
  const score = growthRate + profitMargin
  const passed = score >= 40

  return (
    <div className="card p-5 relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
      {/* Background glowing spot */}
      <div 
        className="absolute -right-16 -top-16 w-32 h-32 rounded-full blur-[80px]" 
        style={{ background: passed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)' }}
      />

      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider">Rule of 40 Score</h3>
          <p className="text-[10px] font-mono text-text-tertiary">Growth Rate + EBITDA Margin</p>
        </div>
        <div className={`p-1.5 rounded-full border ${
          passed ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'
        }`}>
          <Award size={16} />
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-4 font-mono">
        <span className={`text-4xl font-bold tracking-tight ${passed ? 'text-emerald-400' : 'text-amber-400'}`}>
          {score.toFixed(1)}%
        </span>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded uppercase border ${
          passed ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : 'text-amber-400 bg-amber-500/10 border-amber-500/30'
        }`}>
          {passed ? 'Efficient Scale' : 'Needs Optimization'}
        </span>
      </div>

      {/* Visual Bar Breakdown */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-[10px] font-mono text-text-tertiary">
          <span>YoY Growth: {growthRate}%</span>
          <span>Profit Margin: {profitMargin}%</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-700/50 flex overflow-hidden">
          <div 
            className="h-full bg-cyan-400" 
            style={{ width: `${(growthRate / score) * 100}%` }}
            title={`Growth: ${growthRate}%`}
          />
          <div 
            className="h-full bg-indigo-500" 
            style={{ width: `${(profitMargin / score) * 100}%` }}
            title={`Profit Margin: ${profitMargin}%`}
          />
        </div>
      </div>

      {/* Benchmark Reference */}
      <div className="text-[10px] font-mono text-text-tertiary border-t border-slate-700/50 pt-3 flex items-start gap-2">
        <Zap size={12} className="text-amber-400 mt-0.5 shrink-0" />
        <span>
          {passed 
            ? 'Excellent! Combined score exceeds the 40% venture threshold. The business is scaling efficiently.'
            : 'Combined score is below 40%. Consider increasing expansion revenue or optimizing cost structures to lift margins.'
          }
        </span>
      </div>
    </div>
  )
}
