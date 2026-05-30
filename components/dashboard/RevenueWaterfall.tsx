'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { motion } from 'framer-motion'

interface WaterfallData {
  name: string
  base: number
  value: number
  displayValue: number
  type: 'total' | 'positive' | 'negative'
}

const waterfallData: WaterfallData[] = [
  { name: 'Starting MRR', base: 0, value: 250000, displayValue: 250000, type: 'total' },
  { name: 'New Business', base: 250000, value: 35000, displayValue: 35000, type: 'positive' },
  { name: 'Expansion', base: 285000, value: 15000, displayValue: 15000, type: 'positive' },
  { name: 'Contraction', base: 292000, value: 8000, displayValue: -8000, type: 'negative' },
  { name: 'Churn', base: 284500, value: 7500, displayValue: -7500, type: 'negative' },
  { name: 'Ending MRR', base: 0, value: 284500, displayValue: 284500, type: 'total' },
]

const formatCurrency = (v: number) => {
  const isNegative = v < 0
  const absVal = Math.abs(v)
  return `${isNegative ? '-' : ''}$${(absVal / 1000).toFixed(1)}k`
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null
  const data = payload[0].payload as WaterfallData
  const color = data.type === 'total' ? '#00D4FF' : data.type === 'positive' ? '#10B981' : '#EF4444'

  return (
    <div className="card p-3 text-xs font-mono shadow-cyan-md bg-[#0F172A]/90 border border-slate-700/50 backdrop-blur-md">
      <div className="text-text-secondary font-semibold mb-1">{data.name}</div>
      <div className="flex items-center gap-2">
        <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
        <span className="text-text-tertiary">Amount:</span>
        <span className="text-text-primary font-bold">
          {formatCurrency(data.displayValue)}
        </span>
      </div>
      {data.type !== 'total' && (
        <div className="text-[10px] text-text-tertiary mt-1.5 border-t border-slate-700/50 pt-1">
          Running MRR: {formatCurrency(data.base + (data.type === 'positive' ? data.value : 0))}
        </div>
      )}
    </div>
  )
}

export function RevenueWaterfall() {
  return (
    <div className="w-full h-[320px] relative">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={waterfallData}
          margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.15} vertical={false} />
          <XAxis
            dataKey="name"
            stroke="#94A3B8"
            fontSize={10}
            fontFamily="monospace"
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="#94A3B8"
            fontSize={10}
            fontFamily="monospace"
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `$${v / 1000}k`}
            domain={[0, 320000]}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#334155', opacity: 0.1 }} />
          
          {/* Base bar (transparent placeholder to stack on top of) */}
          <Bar dataKey="base" stackId="a" fill="transparent" />
          
          {/* Value bar (the colored visible portion) */}
          <Bar dataKey="value" stackId="a" radius={[4, 4, 0, 0]}>
            {waterfallData.map((entry, index) => {
              let color = '#00D4FF' // Default Total
              if (entry.type === 'positive') color = '#10B981' // Emerald
              if (entry.type === 'negative') color = '#EF4444' // Rose
              return (
                <Cell
                  key={`cell-${index}`}
                  fill={color}
                  fillOpacity={0.85}
                  stroke={color}
                  strokeWidth={1}
                />
              )
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
