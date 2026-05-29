'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { ExportMenu } from '@/components/ui/ExportMenu'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Tabs } from '@/components/ui/Tabs'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { generateSparkData } from '@/lib/utils'
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine
} from 'recharts'
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────
const mrrData = [
  { month: 'Jan', mrr: 820000,  new: 95000,  expansion: 42000, churn: -28000, contraction: -12000 },
  { month: 'Feb', mrr: 917000,  new: 110000, expansion: 55000, churn: -32000, contraction: -16000 },
  { month: 'Mar', mrr: 1034000, new: 145000, expansion: 61000, churn: -38000, contraction: -11000 },
  { month: 'Apr', mrr: 1191000, new: 168000, expansion: 72000, churn: -45000, contraction: -18000 },
  { month: 'May', mrr: 1368000, new: 205000, expansion: 88000, churn: -52000, contraction: -14000 },
  { month: 'Jun', mrr: 1595000, new: 248000, expansion: 101000,churn: -61000, contraction: -21000 },
  { month: 'Jul', mrr: 1862000, new: 310000, expansion: 120000,churn: -78000, contraction: -25000 },
  { month: 'Aug', mrr: 2014000, new: 190000, expansion: 88000, churn: -85000, contraction: -19000 },
  { month: 'Sep', mrr: 2188000, new: 220000, expansion: 95000, churn: -91000, contraction: -22000 },
  { month: 'Oct', mrr: 2390000, new: 258000, expansion: 102000,churn: -98000, contraction: -28000 },
  { month: 'Nov', mrr: 2624000, new: 290000, expansion: 115000,churn: -108000,contraction: -31000 },
  { month: 'Dec', mrr: 2890000, new: 332000, expansion: 130000,churn: -118000,contraction: -36000 },
]

const cashflowData = [
  { month: 'Jan', inflow: 920000,  outflow: -620000, net: 300000 },
  { month: 'Feb', inflow: 980000,  outflow: -650000, net: 330000 },
  { month: 'Mar', inflow: 1050000, outflow: -690000, net: 360000 },
  { month: 'Apr', inflow: 1120000, outflow: -720000, net: 400000 },
  { month: 'May', inflow: 1200000, outflow: -760000, net: 440000 },
  { month: 'Jun', inflow: 1310000, outflow: -800000, net: 510000 },
  { month: 'Jul', inflow: 1450000, outflow: -855000, net: 595000 },
  { month: 'Aug', inflow: 1520000, outflow: -895000, net: 625000 },
  { month: 'Sep', inflow: 1620000, outflow: -940000, net: 680000 },
  { month: 'Oct', inflow: 1740000, outflow: -985000, net: 755000 },
  { month: 'Nov', inflow: 1880000, outflow: -1030000,net: 850000 },
  { month: 'Dec', inflow: 2010000, outflow: -1080000,net: 930000 },
]

const plData = [
  { category: 'Revenue',         q1: 2750000, q2: 3610000, q3: 4550000, q4: 5630000, type: 'revenue' },
  { category: 'COGS',            q1: -810000, q2: -1040000,q3: -1320000,q4: -1620000,type: 'cost' },
  { category: 'Gross Profit',    q1: 1940000, q2: 2570000, q3: 3230000, q4: 4010000, type: 'profit' },
  { category: 'R&D',             q1: -420000, q2: -510000, q3: -620000, q4: -740000, type: 'cost' },
  { category: 'Sales & Mktg',   q1: -380000, q2: -450000, q3: -540000, q4: -650000, type: 'cost' },
  { category: 'G&A',             q1: -210000, q2: -250000, q3: -295000, q4: -340000, type: 'cost' },
  { category: 'Operating Profit',q1: 930000,  q2: 1360000, q3: 1775000, q4: 2280000, type: 'profit' },
  { category: 'Net Profit',      q1: 780000,  q2: 1160000, q3: 1540000, q4: 2010000, type: 'profit' },
]

const fmt = (v: number) => {
  const abs = Math.abs(v)
  const sign = v < 0 ? '−' : ''
  if (abs >= 1000000) return `${sign}$${(abs / 1000000).toFixed(2)}M`
  return `${sign}$${(abs / 1000).toFixed(0)}K`
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs font-mono shadow-cyan-md min-w-[160px]">
      <div className="text-text-secondary mb-2 font-medium">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            <span className="text-text-tertiary capitalize">{p.name}</span>
          </div>
          <span className="text-text-primary">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const TABS = [
  { id: 'pl',        label: 'P&L' },
  { id: 'mrr',       label: 'MRR / ARR' },
  { id: 'cashflow',  label: 'Cashflow' },
]

export default function FinancePage() {
  const [tab, setTab] = useState('pl')

  const metrics = [
    { title: 'MRR',         value: '2.89M',  prefix: '$', trend: 10.1, sparkData: generateSparkData(14, 2000000, 200000) },
    { title: 'ARR',         value: '34.7M',  prefix: '$', trend: 10.1, sparkData: generateSparkData(14, 30000000, 2000000) },
    { title: 'Gross Margin',value: '71.2',   suffix: '%', trend: 2.3,  sparkData: generateSparkData(14, 68, 3) },
    { title: 'Net Profit',  value: '2.01M',  prefix: '$', trend: 30.5, sparkData: generateSparkData(14, 1500000, 300000) },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Breadcrumbs crumbs={[{ label: 'Finance' }]} />
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Financial Overview</h1>
          <p className="text-text-secondary text-sm font-mono mt-1">Full Year 2024 · Live data</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
            <Calendar size={14} /> FY 2024
          </button>
          <ExportMenu />
        </div>
      </div>

      {/* Alert */}
      <AlertBanner
        type="success"
        title="Record Quarter"
        message="Q4 2024 net profit of $2.01M represents a 30.5% QoQ improvement — exceeding the annual target."
        action={{ label: 'View Q4 report', onClick: () => {} }}
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* Tab switcher */}
      <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />

      {/* P&L View */}
      {tab === 'pl' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="section-label mb-1">Profit & Loss Statement</div>
                <h2 className="font-display font-semibold text-lg">Full Year 2024</h2>
              </div>
              <ExportMenu variant="ghost" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)]">
                    {['Line Item', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024', 'FY Total'].map(h => (
                      <th key={h} className={`data-table-header py-3 ${h === 'Line Item' ? 'text-left' : 'text-right'} px-3`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {plData.map(row => {
                    const fy = row.q1 + row.q2 + row.q3 + row.q4
                    const isProfit = row.type === 'profit'
                    const isCost   = row.type === 'cost'
                    const isTopLine= row.category === 'Revenue'
                    return (
                      <tr key={row.category} className={`data-table-row ${isProfit && !isTopLine ? 'bg-positive/[0.02]' : ''} ${isTopLine ? 'bg-cyan/[0.02]' : ''}`}>
                        <td className={`py-3 px-3 ${isProfit ? 'font-medium' : ''} ${isTopLine ? 'text-cyan' : isProfit ? 'text-positive' : isCost ? 'text-text-secondary' : 'text-text-primary'}`}>
                          {row.category}
                        </td>
                        {[row.q1, row.q2, row.q3, row.q4, fy].map((v, i) => (
                          <td key={i} className={`py-3 px-3 text-right ${isTopLine ? 'text-cyan' : isProfit ? 'text-positive font-medium' : isCost ? 'text-negative' : 'text-text-primary'}`}>
                            {fmt(v)}
                          </td>
                        ))}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quarterly bar chart */}
          <div className="card p-6">
            <div className="section-label mb-1">Quarterly Performance</div>
            <h2 className="font-display font-semibold text-lg mb-6">Revenue vs Net Profit</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={[
                { q: 'Q1', revenue: 2750000, profit: 780000 },
                { q: 'Q2', revenue: 3610000, profit: 1160000 },
                { q: 'Q3', revenue: 4550000, profit: 1540000 },
                { q: 'Q4', revenue: 5630000, profit: 2010000 },
              ]} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="q" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="rgba(0,212,255,0.6)" radius={[4,4,0,0]} />
                <Bar dataKey="profit"  fill="rgba(16,185,129,0.7)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* MRR View */}
      {tab === 'mrr' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="section-label mb-1">MRR Trend</div>
                <h2 className="font-display font-semibold text-lg">Monthly Recurring Revenue — 12 Months</h2>
              </div>
              <div className="flex items-center gap-2 text-positive text-xs font-mono">
                <TrendingUp size={13} /> +252% YoY
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={mrrData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000000).toFixed(1)}M`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="mrr" stroke="#00D4FF" strokeWidth={2} fill="url(#mrrGrad)" dot={false} name="MRR" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* MRR Movement waterfall */}
          <div className="card p-6">
            <div className="section-label mb-1">MRR Movement</div>
            <h2 className="font-display font-semibold text-lg mb-6">New · Expansion · Churn — Monthly</h2>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={mrrData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v/1000).toFixed(0)}K`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="new"         fill="rgba(0,212,255,0.7)"   radius={[4,4,0,0]} name="New MRR" />
                <Bar dataKey="expansion"   fill="rgba(16,185,129,0.7)"  radius={[4,4,0,0]} name="Expansion" />
                <Bar dataKey="churn"       fill="rgba(239,68,68,0.6)"   radius={[0,0,4,4]} name="Churn" />
                <Bar dataKey="contraction" fill="rgba(245,158,11,0.6)"  radius={[0,0,4,4]} name="Contraction" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Cashflow View */}
      {tab === 'cashflow' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="card p-6">
            <div className="section-label mb-1">Operating Cashflow</div>
            <h2 className="font-display font-semibold text-lg mb-6">Inflow vs Outflow vs Net — 12 Months</h2>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={cashflowData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(Math.abs(v)/1000000).toFixed(1)}M`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="inflow"  fill="rgba(0,212,255,0.5)"   radius={[4,4,0,0]} name="Inflow" />
                <Bar dataKey="outflow" fill="rgba(239,68,68,0.4)"   radius={[0,0,4,4]} name="Outflow" />
                <Area type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} fill="url(#netGrad)" dot={false} name="Net" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Cashflow summary table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Total Inflows',  value: '$18.78M', trend: '+42.3%', positive: true,  icon: TrendingUp },
              { label: 'Total Outflows', value: '$10.85M', trend: '+31.8%', positive: false, icon: TrendingDown },
              { label: 'Net Cashflow',   value: '$7.93M',  trend: '+57.6%', positive: true,  icon: TrendingUp },
            ].map(s => (
              <div key={s.label} className="metric-card card p-5 text-center">
                <div className="text-text-tertiary text-xs font-mono uppercase tracking-wider mb-3">{s.label}</div>
                <div className="font-mono font-medium text-2xl text-text-primary mb-1">{s.value}</div>
                <div className={`flex items-center justify-center gap-1 font-mono text-xs ${s.positive ? 'text-positive' : 'text-negative'}`}>
                  <s.icon size={12} /> {s.trend} YoY
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
