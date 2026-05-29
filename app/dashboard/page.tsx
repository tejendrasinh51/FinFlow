'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MetricCard } from '@/components/dashboard/MetricCard'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts'
import { generateSparkData } from '@/lib/utils'
import { RefreshCw, Calendar, Filter } from 'lucide-react'

const metrics = [
  {
    title: 'MRR',
    value: '1.24M',
    prefix: '$',
    trend: 12.4,
    trendLabel: 'vs last month',
    sparkData: generateSparkData(14, 1000000, 80000),
  },
  {
    title: 'ARR',
    value: '14.9M',
    prefix: '$',
    trend: 8.2,
    trendLabel: 'vs last year',
    sparkData: generateSparkData(14, 14000000, 500000),
  },
  {
    title: 'Churn Rate',
    value: '2.1',
    suffix: '%',
    trend: -0.3,
    trendLabel: 'pp vs last month',
    sparkData: generateSparkData(14, 2.5, 0.3),
  },
  {
    title: 'DAU',
    value: '10,247',
    trend: 18.6,
    trendLabel: 'vs last month',
    sparkData: generateSparkData(14, 8000, 1000),
  },
]

const revenueData = [
  { month: 'Jan', revenue: 820000, expense: 520000, profit: 300000 },
  { month: 'Feb', revenue: 880000, expense: 545000, profit: 335000 },
  { month: 'Mar', revenue: 920000, expense: 560000, profit: 360000 },
  { month: 'Apr', revenue: 980000, expense: 590000, profit: 390000 },
  { month: 'May', revenue: 1050000, expense: 620000, profit: 430000 },
  { month: 'Jun', revenue: 1100000, expense: 640000, profit: 460000 },
  { month: 'Jul', revenue: 1150000, expense: 665000, profit: 485000 },
  { month: 'Aug', revenue: 1180000, expense: 680000, profit: 500000 },
  { month: 'Sep', revenue: 1210000, expense: 700000, profit: 510000 },
  { month: 'Oct', revenue: 1240000, expense: 720000, profit: 520000 },
  { month: 'Nov', revenue: 1260000, expense: 735000, profit: 525000 },
  { month: 'Dec', revenue: 1240000, expense: 742000, profit: 498000 },
]

const expenseData = [
  { name: 'Payroll', value: 40, color: '#EF4444' },
  { name: 'Infrastructure', value: 27, color: '#00D4FF' },
  { name: 'Marketing', value: 18, color: '#F59E0B' },
  { name: 'Other', value: 15, color: '#3A4A5C' },
]

const plRows = [
  { item: 'Total Revenue', oct: 412000, nov: 438000, dec: 486000 },
  { item: 'COGS', oct: -120000, nov: -130000, dec: -142000 },
  { item: 'Gross Profit', oct: 292000, nov: 308000, dec: 344000 },
  { item: 'Operating Expenses', oct: -121000, nov: -128000, dec: -130000 },
  { item: 'Net Profit', oct: 171000, nov: 180000, dec: 214000 },
]

const fmt = (v: number) =>
  v < 0
    ? `-$${Math.abs(v / 1000).toFixed(0)}K`
    : `$${(v / 1000).toFixed(0)}K`

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  return (
    <div className="card p-3 text-xs font-mono shadow-cyan-md">
      <div className="text-text-secondary mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-tertiary capitalize">{p.name}:</span>
          <span className="text-text-primary ml-auto">
            ${(p.value / 1000).toFixed(0)}K
          </span>
        </div>
      ))}
    </div>
  )
}

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
}

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

import { useMetrics } from '@/hooks/useMetrics'

export default function DashboardPage() {
  const { liveValues, isLive, isLoading: metricsLoading } = useMetrics({
    types: ['mrr', 'arr', 'churn', 'dau'],
  })
  
  const [loading, setLoading] = useState(true)
  const [updatedMetric, setUpdatedMetric] = useState<number | null>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  // Highlight updated card when live values fluctuate
  useEffect(() => {
    if (Object.keys(liveValues).length === 0) return
    // Flash a random updated metric card indicator
    const idx = Math.floor(Math.random() * metrics.length)
    setUpdatedMetric(idx)
    const t = setTimeout(() => setUpdatedMetric(null), 800)
    return () => clearTimeout(t)
  }, [liveValues])

  const displayMetrics = metrics.map((m, i) => {
    const typeMap: Record<string, string> = {
      'MRR': 'mrr',
      'ARR': 'arr',
      'Churn Rate': 'churn',
      'DAU': 'dau',
    }
    const key = typeMap[m.title]
    const liveValue = liveValues[key]
    
    let formattedVal = m.value
    if (liveValue !== undefined) {
      if (key === 'churn') {
        formattedVal = liveValue.toFixed(1)
      } else if (key === 'mrr') {
        formattedVal = liveValue >= 1000000 ? `${(liveValue / 1000000).toFixed(2)}M` : `${(liveValue / 1000).toFixed(0)}K`
      } else if (key === 'arr') {
        formattedVal = liveValue >= 1000000 ? `${(liveValue / 1000000).toFixed(1)}M` : `${(liveValue / 1000).toFixed(0)}K`
      } else if (key === 'dau') {
        formattedVal = Math.round(liveValue).toLocaleString()
      }
    }
    
    return {
      ...m,
      value: formattedVal,
    }
  })

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Executive Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={isLive ? "live-dot" : "w-2 h-2 rounded-full bg-neutral animate-pulse inline-block"} />
            <p className="text-text-secondary text-sm font-mono">
              {isLive ? 'Real-time WebSocket stream active' : 'Offline · Reconnecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
            <Calendar size={14} />
            Last 12 months
          </button>
          <button className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
            <Filter size={14} />
            Filter
          </button>
          <button className="btn-ghost text-sm py-2 px-3">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Metric cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {displayMetrics.map((m, i) => (
          <motion.div key={m.title} variants={cardVariants}>
            <MetricCard
              {...m}
              loading={loading || metricsLoading}
              updated={updatedMetric === i}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {/* Revenue area chart */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6 xl:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">
                Revenue vs Expenses
              </div>
              <div className="font-display font-semibold text-lg">12-Month Overview</div>
            </div>
            <div className="flex gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-cyan" />
                <span className="text-text-tertiary">Revenue</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-negative" />
                <span className="text-text-tertiary">Expense</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-positive" />
                <span className="text-text-tertiary">Profit</span>
              </div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fill: '#3A4A5C', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v/1000).toFixed(0)}K`}
                tick={{ fill: '#3A4A5C', fontSize: 10, fontFamily: 'JetBrains Mono' }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" stroke="#00D4FF" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={1.5} fill="url(#expGrad)" dot={false} />
              <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={1.5} fill="url(#profGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expense donut */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card p-6"
        >
          <div className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">
            Expense Breakdown
          </div>
          <div className="font-display font-semibold text-lg mb-4">Category Split</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={expenseData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                isAnimationActive
              >
                {expenseData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={0.85} />
                ))}
              </Pie>
              <Tooltip
                formatter={(v) => `${v}%`}
                contentStyle={{
                  background: 'var(--color-bg-overlay)',
                  border: '1px solid var(--color-border-strong)',
                  borderRadius: '0.5rem',
                  fontFamily: 'JetBrains Mono',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {expenseData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                  <span className="text-text-secondary">{item.name}</span>
                </div>
                <span className="text-text-primary font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* P&L Table */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">
              Financial Summary
            </div>
            <div className="font-display font-semibold text-lg">P&L Statement — Q4 2024</div>
          </div>
          <button className="btn-ghost text-sm py-2 px-4">
            Export →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)]">
                <th className="data-table-header text-left py-3 pr-8">Line Item</th>
                <th className="data-table-header text-right py-3 px-4">Oct 2024</th>
                <th className="data-table-header text-right py-3 px-4">Nov 2024</th>
                <th className="data-table-header text-right py-3 px-4">Dec 2024</th>
                <th className="data-table-header text-right py-3 pl-4">Q4 Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {plRows.map((row) => {
                const q4 = row.oct + row.nov + row.dec
                const isProfit = row.item === 'Net Profit'
                const isGross = row.item === 'Gross Profit'
                const isNeg = row.oct < 0

                return (
                  <tr
                    key={row.item}
                    className={`data-table-row transition-colors ${isProfit ? 'bg-cyan/[0.03]' : ''}`}
                  >
                    <td
                      className={`py-3 pr-8 ${
                        isProfit ? 'text-cyan font-medium' :
                        isGross ? 'text-text-primary' :
                        'text-text-secondary'
                      }`}
                    >
                      {row.item}
                    </td>
                    {[row.oct, row.nov, row.dec, q4].map((v, i) => (
                      <td
                        key={i}
                        className={`py-3 px-4 text-right ${
                          isProfit ? 'text-positive font-medium' :
                          isNeg ? 'text-negative' :
                          'text-text-primary'
                        }`}
                      >
                        {fmt(v)}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}
