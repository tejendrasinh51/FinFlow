'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ExportMenu } from '@/components/ui/ExportMenu'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { FunnelChart } from '@/components/dashboard/FunnelChart'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend
} from 'recharts'
import { 
  TrendingUp, Activity, BarChart3, HelpCircle, Layers, Sliders, Sparkles 
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────
const forecastData = [
  // Historical Actuals
  { month: 'Jun', actual: 235000 },
  { month: 'Jul', actual: 250000 },
  { month: 'Aug', actual: 245000 },
  { month: 'Sep', actual: 260000 },
  { month: 'Oct', actual: 275000 },
  { month: 'Nov', actual: 270000 },
  { month: 'Dec (Actual)', actual: 284500, forecast: 284500, range: [284500, 284500] },
  // Projected Forecast
  { month: 'Jan (F)', forecast: 295000, range: [288000, 302000] },
  { month: 'Feb (F)', forecast: 308000, range: [298000, 318000] },
  { month: 'Mar (F)', forecast: 322000, range: [308000, 336000] },
  { month: 'Apr (F)', forecast: 335000, range: [318000, 352000] },
  { month: 'May (F)', forecast: 348000, range: [328000, 368000] },
  { month: 'Jun (F)', forecast: 362000, range: [338000, 386000] },
]

const planSegmentData = [
  { name: 'Starter Plan ($49/mo)', value: 15, color: '#3B82F6' },
  { name: 'Growth Plan ($199/mo)', value: 40, color: '#10B981' },
  { name: 'Professional ($499/mo)', value: 25, color: '#8B5CF6' },
  { name: 'Enterprise (Custom)', value: 20, color: '#00D4FF' },
]

const industrySegmentData = [
  { name: 'Financial Services', value: 32, color: '#00D4FF' },
  { name: 'Technology & SaaS', value: 28, color: '#10B981' },
  { name: 'Retail & E-commerce', value: 18, color: '#F59E0B' },
  { name: 'Healthcare Systems', value: 14, color: '#EC4899' },
  { name: 'Other Segments', value: 8, color: '#3A4A5C' },
]

const companySizeData = [
  { name: 'SMBs (<100 seats)', value: 22 },
  { name: 'Mid-Market (100-500)', value: 43 },
  { name: 'Enterprise (>500)', value: 35 },
]

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs font-mono shadow-cyan-md bg-[#0F172A]/90 border border-slate-700/50 backdrop-blur-md">
      <div className="text-text-secondary mb-2 font-semibold">{label}</div>
      {payload.map((p: any) => {
        if (p.value === undefined) return null
        let formattedVal = `$${(p.value / 1000).toFixed(1)}k`
        if (p.name === 'Range') {
          const [low, high] = p.value
          formattedVal = `$${(low / 1000).toFixed(1)}k - $${(high / 1000).toFixed(1)}k`
        }
        return (
          <div key={p.name} className="flex items-center gap-2 mb-0.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: p.color }} />
            <span className="text-text-tertiary capitalize">{p.name}:</span>
            <span className="text-text-primary ml-auto font-bold">{formattedVal}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function AnalyticsPage() {
  const [modelType, setModelType] = useState<'linear' | 'monte_carlo' | 'exponential'>('linear')
  const [confidenceLevel, setConfidenceLevel] = useState<'90' | '95' | '99'>('95')

  // Recalculate forecast data multipliers based on options for simulator effect
  const modelMultiplier = modelType === 'exponential' ? 1.04 : modelType === 'monte_carlo' ? 0.98 : 1.0
  const errorSpread = confidenceLevel === '99' ? 1.4 : confidenceLevel === '90' ? 0.7 : 1.0

  const processedForecast = forecastData.map(row => {
    if (row.actual) return row
    const forecastVal = Math.round((row.forecast ?? 0) * modelMultiplier)
    const baseDiff = Math.abs((row.forecast ?? 0) - (row.range?.[0] ?? 0)) * errorSpread
    return {
      ...row,
      forecast: forecastVal,
      range: [Math.round(forecastVal - baseDiff), Math.round(forecastVal + baseDiff)]
    }
  })

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Breadcrumbs crumbs={[{ label: 'Analytics' }]} />
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Advanced Analytics</h1>
          <p className="text-text-secondary text-xs md:text-sm font-mono mt-1">
            Machine learning projections, cohort models, and segmentation matrixes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu />
        </div>
      </div>

      {/* Alert */}
      <AlertBanner
        type="info"
        title="ML Predictive Analytics Active"
        message="FinFlow's econometric forecast algorithms have completed compiling the 12-month projections."
      />

      {/* Predictive Forecasting Panel */}
      <div className="card p-5 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-700/50 pb-4 gap-4">
          <div>
            <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-cyan animate-pulse" />
              Algorithmic Revenue Forecasting
            </h3>
            <p className="text-[10px] font-mono text-text-tertiary">
              Projected MRR timeline utilizing regression modeling and historical variance
            </p>
          </div>
          
          {/* Controllers */}
          <div className="flex flex-wrap items-center gap-3 font-mono text-xs">
            <div className="flex items-center gap-2">
              <span className="text-text-tertiary text-[10px] uppercase">Engine:</span>
              <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700/50">
                {(['linear', 'exponential', 'monte_carlo'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setModelType(type)}
                    className={`px-2 py-1 rounded-md text-[10px] transition-colors ${
                      modelType === type ? 'bg-cyan text-slate-950 font-bold' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {type.toUpperCase().replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-text-tertiary text-[10px] uppercase">Confidence Interval:</span>
              <select
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value as any)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-[10px] text-text-secondary focus:outline-none focus:border-cyan/30"
              >
                <option value="90">90% CI</option>
                <option value="95">95% CI</option>
                <option value="99">99% CI</option>
              </select>
            </div>
          </div>
        </div>

        {/* The Forecasting Chart */}
        <div className="h-[280px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={processedForecast} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.06} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
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
                domain={[200000, 410000]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontFamily: 'monospace', fontSize: '10px', color: '#94A3B8' }}
              />

              {/* Shaded Confidence Band (low value to high value area) */}
              <Area
                name="Confidence Range"
                type="monotone"
                dataKey="range"
                stroke="transparent"
                fill="#00D4FF"
                fillOpacity={0.08}
              />

              {/* Historical actual line */}
              <Line
                name="Historical Actual MRR"
                type="monotone"
                dataKey="actual"
                stroke="#10B981"
                strokeWidth={2.5}
                dot={{ r: 4, stroke: '#05080F', strokeWidth: 1.5, fill: '#10B981' }}
                activeDot={{ r: 6 }}
              />

              {/* Algorithmic Forecast line */}
              <Line
                name="Econometric Forecast"
                type="monotone"
                dataKey="forecast"
                stroke="#00D4FF"
                strokeDasharray="4 4"
                strokeWidth={2}
                dot={{ r: 3, stroke: '#05080F', strokeWidth: 1, fill: '#00D4FF' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-700/50 pt-5 text-center font-mono text-xs">
          <div className="p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl">
            <span className="text-[9px] text-text-tertiary uppercase tracking-wider block mb-1">Projected Growth Velocity</span>
            <span className="text-sm font-bold text-emerald-400">
              {modelType === 'exponential' ? '+27.2% YoY' : modelType === 'monte_carlo' ? '+18.6% YoY' : '+23.5% YoY'}
            </span>
          </div>
          <div className="p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl">
            <span className="text-[9px] text-text-tertiary uppercase tracking-wider block mb-1">Forecast Variance</span>
            <span className="text-sm font-bold text-text-primary">
              ± {confidenceLevel === '99' ? '5.4%' : confidenceLevel === '90' ? '2.8%' : '3.8%'}
            </span>
          </div>
          <div className="p-3 bg-slate-800/20 border border-slate-700/30 rounded-xl">
            <span className="text-[9px] text-text-tertiary uppercase tracking-wider block mb-1">Model Accuracy Rating</span>
            <span className="text-sm font-bold text-cyan">94.8% R² Score</span>
          </div>
        </div>
      </div>

      {/* Funnel & Segments comparison row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Conversion Funnel */}
        <FunnelChart />

        {/* Customer Segmentation Analysis */}
        <div className="card p-5 space-y-6">
          <div className="border-b border-slate-700/50 pb-3">
            <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider flex items-center gap-1.5">
              <Layers size={14} className="text-cyan" />
              ARR Customer Segmentation
            </h3>
            <p className="text-[10px] font-mono text-text-tertiary">
              Subscription values broken down by plans and customer size profiles
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Split by Subscription Plan */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block border-b border-slate-700/30 pb-1">
                Value by Tier
              </span>
              <div className="h-[120px] relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={planSegmentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={25}
                      outerRadius={45}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {planSegmentData.map((entry, idx) => (
                        <Cell key={idx} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 font-mono text-[9px]">
                {planSegmentData.map((item) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 truncate">
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: item.color }} />
                      <span className="text-text-tertiary truncate">{item.name}</span>
                    </div>
                    <span className="text-text-primary font-bold">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Split by Company Size */}
            <div className="space-y-3">
              <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block border-b border-slate-700/30 pb-1">
                Value by Company Size
              </span>
              <div className="space-y-3 pt-2 font-mono text-xs">
                {companySizeData.map((size, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-text-secondary">{size.name}</span>
                      <span className="text-text-primary font-bold">{size.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          idx === 0 ? 'bg-blue-400' : idx === 1 ? 'bg-cyan' : 'bg-emerald-400'
                        }`} 
                        style={{ width: `${size.value}%` }} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Industry Split Progress Bar */}
          <div className="border-t border-slate-700/50 pt-5 space-y-3">
            <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider block">
              Inflow Composition by Vertical Industry
            </span>
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex">
              {industrySegmentData.map((sec, idx) => (
                <div
                  key={idx}
                  className="h-full first:rounded-l last:rounded-r"
                  style={{ width: `${sec.value}%`, background: sec.color }}
                  title={`${sec.name}: ${sec.value}%`}
                />
              ))}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 font-mono text-[9px] text-text-tertiary">
              {industrySegmentData.map((sec, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: sec.color }} />
                  <span>{sec.name} ({sec.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
