'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Info, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react'

export function UnitEconomics() {
  const [arpu, setArpu] = useState(150) // Average Revenue Per User (monthly)
  const [grossMargin, setGrossMargin] = useState(78) // Gross Margin %
  const [churn, setChurn] = useState(1.8) // Monthly Churn %
  const [cac, setCac] = useState(3240) // CAC

  // Calculations
  const ltv = Math.round((arpu * (grossMargin / 100)) / (churn / 100))
  const ratio = parseFloat((ltv / cac).toFixed(2))
  const payback = parseFloat((cac / (arpu * (grossMargin / 100))).toFixed(1))

  // Determine health scores
  const getRatioStatus = (r: number) => {
    if (r >= 4) return { label: 'Outstanding (Best in Class)', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' }
    if (r >= 3) return { label: 'Healthy (VC Standard)', color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30' }
    if (r >= 1.5) return { label: 'Moderate', color: 'text-amber-400 bg-amber-500/10 border-amber-500/30' }
    return { label: 'Danger Zone (Inflow < CAC)', color: 'text-red-400 bg-red-500/10 border-red-500/30' }
  }

  const getPaybackStatus = (p: number) => {
    if (p <= 8) return { label: 'Excellent (< 8 months)', color: 'text-emerald-400' }
    if (p <= 12) return { label: 'Good (8 - 12 months)', color: 'text-cyan-400' }
    if (p <= 18) return { label: 'Moderate (12 - 18 months)', color: 'text-amber-400' }
    return { label: 'Sub-Optimal (> 18 months)', color: 'text-red-400' }
  }

  const ratioStatus = getRatioStatus(ratio)
  const paybackStatus = getPaybackStatus(payback)

  return (
    <div className="card p-5 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
        <div>
          <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider">Unit Economics Simulator</h3>
          <p className="text-[10px] font-mono text-text-tertiary">Calibrate inputs to project LTV:CAC efficiency</p>
        </div>
        <div className={`px-2.5 py-1 rounded border text-[10px] font-mono font-bold transition-colors ${ratioStatus.color}`}>
          LTV:CAC — {ratioStatus.label}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Interactive Sliders */}
        <div className="space-y-4 font-mono">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Average Monthly ARPU</span>
              <span className="text-text-primary font-bold">${arpu} / mo</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="10"
              value={arpu}
              onChange={(e) => setArpu(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Gross Margin %</span>
              <span className="text-text-primary font-bold">{grossMargin}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="95"
              step="1"
              value={grossMargin}
              onChange={(e) => setGrossMargin(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Monthly Logo Churn %</span>
              <span className="text-text-primary font-bold">{churn}%</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={churn}
              onChange={(e) => setChurn(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-text-secondary">Customer Acquisition Cost (CAC)</span>
              <span className="text-text-primary font-bold">${cac.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="500"
              max="15000"
              step="250"
              value={cac}
              onChange={(e) => setCac(Number(e.target.value))}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
            />
          </div>
        </div>

        {/* Real-time Outputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">Customer LTV</span>
              <span className="text-xl font-bold font-mono text-[#00D4FF]">${ltv.toLocaleString()}</span>
            </div>
            <div className="text-[9px] font-mono text-text-tertiary mt-2">
              Based on gross profit per month over customer lifespan.
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">LTV:CAC Ratio</span>
              <span className={`text-xl font-bold font-mono ${ratio >= 3 ? 'text-emerald-400' : ratio >= 1.5 ? 'text-amber-400' : 'text-red-400'}`}>
                {ratio}x
              </span>
            </div>
            <div className="text-[9px] font-mono text-text-tertiary mt-2">
              VCs look for &gt;3.0x for high-growth SaaS.
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">Payback Period</span>
              <span className={`text-xl font-bold font-mono ${paybackStatus.color}`}>{payback} mos</span>
            </div>
            <div className="text-[9px] font-mono text-text-tertiary mt-2">
              Months of gross profit required to recoup acquisition CAC.
            </div>
          </div>

          <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/30 flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">Max Affordable CAC</span>
              <span className="text-xl font-bold font-mono text-[#8B5CF6]">${Math.round(ltv / 3).toLocaleString()}</span>
            </div>
            <div className="text-[9px] font-mono text-text-tertiary mt-2">
              Upper CAC threshold to preserve a healthy 3.0x efficiency.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
