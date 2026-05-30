'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ExportMenu } from '@/components/ui/ExportMenu'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts'
import { RefreshCw, Calendar, Filter } from 'lucide-react'

// Advanced dashboard components
import { KPIGrid } from '@/components/dashboard/KPIGrid'
import { RevenueWaterfall } from '@/components/dashboard/RevenueWaterfall'
import { CohortHeatmap } from '@/components/dashboard/CohortHeatmap'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { BurnGauge } from '@/components/dashboard/BurnGauge'
import { FunnelChart } from '@/components/dashboard/FunnelChart'

import { useMetrics } from '@/hooks/useMetrics'

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
    <div className="card p-3 text-xs font-mono shadow-cyan-md bg-[#0F172A]/90 border border-slate-700/50 backdrop-blur-md">
      <div className="text-text-secondary mb-2">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center gap-2 mb-0.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span className="text-text-tertiary capitalize">{p.name}:</span>
          <span className="text-text-primary ml-auto font-bold">
            ${(p.value / 1000).toFixed(0)}K
          </span>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { liveValues, isLive, isLoading: metricsLoading } = useMetrics({
    types: ['mrr', 'arr', 'churn', 'dau'],
  })

  const [loading, setLoading] = useState(true)
  const [rangeOpen, setRangeOpen] = useState(false)
  const [selectedRange, setSelectedRange] = useState('Last 12 months')
  const [filterOpen, setFilterOpen] = useState(false)
  const [visibleSeries, setVisibleSeries] = useState({
    revenue: true,
    expense: true,
    profit: true,
  })
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Granular CFO/SaaS Filter States
  const [selectedPlan, setSelectedPlan] = useState('all')
  const [selectedSegment, setSelectedSegment] = useState('all')
  const [selectedRegion, setSelectedRegion] = useState('all')

  // Calculate dynamic scaling multiplier to simulate real-time filtering effects!
  let filterMultiplier = 1.0;
  if (selectedPlan !== 'all') {
    if (selectedPlan === 'starter') filterMultiplier *= 0.15;
    else if (selectedPlan === 'growth') filterMultiplier *= 0.40;
    else if (selectedPlan === 'professional') filterMultiplier *= 0.25;
    else if (selectedPlan === 'enterprise') filterMultiplier *= 0.20;
  }
  if (selectedSegment !== 'all') {
    if (selectedSegment === 'smb') filterMultiplier *= 0.22;
    else if (selectedSegment === 'midmarket') filterMultiplier *= 0.43;
    else if (selectedSegment === 'enterprise') filterMultiplier *= 0.35;
  }
  if (selectedRegion !== 'all') {
    if (selectedRegion === 'us') filterMultiplier *= 0.55;
    else if (selectedRegion === 'eu') filterMultiplier *= 0.25;
    else if (selectedRegion === 'apac') filterMultiplier *= 0.12;
    else if (selectedRegion === 'other') filterMultiplier *= 0.08;
  }

  // Create a filtered copy of liveValues for the KPIGrid!
  const filteredLiveValues = {
    mrr: (liveValues['mrr'] !== undefined ? liveValues['mrr'] : 284500) * filterMultiplier,
    arr: (liveValues['arr'] !== undefined ? liveValues['arr'] : 3414000) * filterMultiplier,
    churn: (liveValues['churn'] !== undefined ? liveValues['churn'] : 1.82) * (selectedPlan === 'enterprise' ? 0.6 : 1.0),
    dau: (liveValues['dau'] !== undefined ? liveValues['dau'] : 42150) * filterMultiplier,
  }

  const controlsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    const clickOutside = (e: MouseEvent) => {
      if (controlsRef.current && !controlsRef.current.contains(e.target as Node)) {
        setRangeOpen(false)
        setFilterOpen(false)
      }
    }
    document.addEventListener('mousedown', clickOutside)
    return () => document.removeEventListener('mousedown', clickOutside)
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setLoading(true)
    await new Promise(r => setTimeout(r, 600))
    setLoading(false)
    setIsRefreshing(false)
  }

  const getFilteredRevenueData = () => {
    let data = revenueData
    if (selectedRange === 'Last 3 months') {
      data = revenueData.slice(-3)
    } else if (selectedRange === 'Last 30 days') {
      data = revenueData.slice(-1)
    }
    
    // Scale chart data based on selected filters!
    return data.map(row => ({
      ...row,
      revenue: Math.round(row.revenue * filterMultiplier),
      expense: Math.round(row.expense * filterMultiplier),
      profit: Math.round(row.profit * filterMultiplier),
    }))
  }

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-xl md:text-2xl text-text-primary">Executive Overview</h1>
          <div className="flex items-center gap-2 mt-1">
            <span className={isLive ? "live-dot" : "w-2 h-2 rounded-full bg-neutral animate-pulse inline-block"} />
            <p className="text-text-secondary text-xs md:text-sm font-mono">
              {isLive ? 'Real-time WebSocket stream active' : 'Offline · Reconnecting...'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 relative" ref={controlsRef}>
          {/* Calendar Range Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setRangeOpen(!rangeOpen); setFilterOpen(false) }}
              className="btn-ghost text-xs md:text-sm py-2 px-2 md:px-4 flex items-center gap-1.5 md:gap-2"
            >
              <Calendar size={13} />
              <span className="hidden sm:inline">{selectedRange}</span>
            </button>
            <AnimatePresence>
              {rangeOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-11 z-50 card shadow-cyan-md p-2 space-y-1 bg-surface w-48 border border-[var(--color-border-strong)]"
                >
                  {['Last 30 days', 'Last 3 months', 'Last 12 months', 'Year to date'].map(r => (
                    <button
                      key={r}
                      onClick={() => {
                        setSelectedRange(r)
                        setRangeOpen(false)
                      }}
                      className={`w-full text-left px-3 py-2 text-xs font-mono rounded-md transition-colors ${selectedRange === r ? 'text-cyan bg-cyan/5 font-semibold' : 'text-text-secondary hover:bg-elevated hover:text-text-primary'}`}
                    >
                      {r}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Filter Series Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setFilterOpen(!filterOpen); setRangeOpen(false) }}
              className="btn-ghost text-xs md:text-sm py-2 px-2 md:px-4 flex items-center gap-1.5 md:gap-2"
            >
              <Filter size={13} />
              <span className="hidden sm:inline">
                {selectedPlan !== 'all' || selectedSegment !== 'all' || selectedRegion !== 'all' ? 'Filters Active' : 'More Filters'}
              </span>
              {(selectedPlan !== 'all' || selectedSegment !== 'all' || selectedRegion !== 'all') && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse" />
              )}
            </button>
            <AnimatePresence>
              {filterOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-11 z-50 card shadow-cyan-md p-4 space-y-4 bg-surface w-72 md:w-80 border border-[var(--color-border-strong)] text-xs font-mono bg-[#0F172A]/95 backdrop-blur-md"
                >
                  {/* Part 1: Chart Series Toggle */}
                  <div>
                    <div className="text-text-tertiary uppercase text-[9px] font-bold tracking-wider pb-1.5 border-b border-slate-700/50 mb-2">
                      Toggle Chart Series
                    </div>
                    <div className="flex gap-3">
                      {([
                        { key: 'revenue', label: 'Revenue', color: 'bg-cyan' },
                        { key: 'expense', label: 'Expense', color: 'bg-negative' },
                        { key: 'profit', label: 'Profit', color: 'bg-positive' },
                      ] as const).map(s => (
                        <label key={s.key} className="flex items-center gap-1.5 py-1 px-1.5 rounded hover:bg-elevated cursor-pointer text-text-secondary hover:text-text-primary">
                          <input
                            type="checkbox"
                            checked={visibleSeries[s.key]}
                            onChange={() => setVisibleSeries(v => ({ ...v, [s.key]: !v[s.key] }))}
                            className="rounded border-[var(--color-border)] text-cyan focus:ring-cyan/30 bg-elevated"
                          />
                          <div className={`w-1.5 h-1.5 rounded-full ${s.color}`} />
                          <span>{s.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Part 2: Granular Filters */}
                  <div className="space-y-3">
                    <div className="text-text-tertiary uppercase text-[9px] font-bold tracking-wider pb-1.5 border-b border-slate-700/50">
                      CFO Segment Filters
                    </div>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="block text-[9px] text-text-tertiary uppercase mb-1">Subscription Plan</label>
                        <select
                          value={selectedPlan}
                          onChange={(e) => setSelectedPlan(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-cyan/30"
                        >
                          <option value="all">All Plans (100%)</option>
                          <option value="starter">Starter Plan (15%)</option>
                          <option value="growth">Growth Plan (40%)</option>
                          <option value="professional">Professional (25%)</option>
                          <option value="enterprise">Enterprise (20%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-text-tertiary uppercase mb-1">Customer Size Profile</label>
                        <select
                          value={selectedSegment}
                          onChange={(e) => setSelectedSegment(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-cyan/30"
                        >
                          <option value="all">All Sizes (100%)</option>
                          <option value="smb">SMB Profile (22%)</option>
                          <option value="midmarket">Mid-Market (43%)</option>
                          <option value="enterprise">Enterprise Core (35%)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[9px] text-text-tertiary uppercase mb-1">Geographic Region</label>
                        <select
                          value={selectedRegion}
                          onChange={(e) => setSelectedRegion(e.target.value)}
                          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-text-secondary focus:outline-none focus:border-cyan/30"
                        >
                          <option value="all">All Regions (100%)</option>
                          <option value="us">North America (55%)</option>
                          <option value="eu">Europe (25%)</option>
                          <option value="apac">Asia-Pacific (12%)</option>
                          <option value="other">Other regions (8%)</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Part 3: Reset Actions */}
                  {(selectedPlan !== 'all' || selectedSegment !== 'all' || selectedRegion !== 'all') && (
                    <button
                      onClick={() => {
                        setSelectedPlan('all')
                        setSelectedSegment('all')
                        setSelectedRegion('all')
                      }}
                      className="w-full btn-secondary text-[10px] font-mono uppercase tracking-wider py-1 text-center"
                    >
                      ✓ Reset All Filters
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="btn-ghost text-sm py-2 px-2 md:px-3 disabled:opacity-50"
          >
            <RefreshCw size={13} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Grid of 8 advanced KPI cards */}
      <KPIGrid liveValues={filteredLiveValues} loading={loading || metricsLoading} />

      {/* Primary Row: Revenue/Expenses & Runway Gauge / Expenses Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue area chart */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <div className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">
                Capital Inflow vs Outflow
              </div>
              <div className="font-display font-semibold text-base md:text-lg">Revenue vs Expenses Overview</div>
            </div>
            <div className="flex gap-4 text-[10px] font-mono">
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
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={getFilteredRevenueData()} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
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
                stroke="#94A3B8"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                stroke="#94A3B8"
                fontSize={10}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              {visibleSeries.revenue && (
                <Area type="monotone" dataKey="revenue" stroke="#00D4FF" strokeWidth={2} fill="url(#revGrad)" dot={false} />
              )}
              {visibleSeries.expense && (
                <Area type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={1.5} fill="url(#expGrad)" dot={false} />
              )}
              {visibleSeries.profit && (
                <Area type="monotone" dataKey="profit" stroke="#10B981" strokeWidth={1.5} fill="url(#profGrad)" dot={false} />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Burn Rate & Runway Gauge card */}
        <div className="card p-5 flex flex-col justify-between">
          <BurnGauge burnRate={450000} mrr={284500} cashOnHand={4800000} />
          
          <div className="border-t border-slate-700/50 pt-4 mt-4">
            <div className="text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">Expense Split</div>
            <div className="flex items-center gap-6">
              <div className="w-[100px] h-[100px] shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={45}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {expenseData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} opacity={0.85} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 flex-1 font-mono text-[9px]">
                {expenseData.map((item) => (
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
          </div>
        </div>
      </div>

      {/* Secondary Row: Revenue Waterfall (MRR analysis) & Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-4">
            <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider">MRR Waterfall Analysis</h3>
            <p className="text-[10px] font-mono text-text-tertiary">SaaS growth logic: new, expansion, contraction, churn components</p>
          </div>
          <RevenueWaterfall />
        </div>
        <div>
          <FunnelChart />
        </div>
      </div>

      {/* Tertiary Row: Cohort Heatmap & Live Activity Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CohortHeatmap />
        </div>
        <div className="card p-5 h-full">
          <ActivityFeed />
        </div>
      </div>

      {/* Financial Summary (P&L) */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <div className="text-text-secondary text-xs font-mono uppercase tracking-wider mb-1">
              Financial Summary
            </div>
            <div className="font-display font-semibold text-base md:text-lg">P&L Statement — Q4 2026</div>
          </div>
          <ExportMenu variant="ghost" reportTitle="P&L Statement Q4 2026" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-slate-700/50 pb-2 text-text-tertiary">
                <th className="text-left py-3 pr-8 font-semibold uppercase tracking-wider">Line Item</th>
                <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider">Oct 2026</th>
                <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider">Nov 2026</th>
                <th className="text-right py-3 px-4 font-semibold uppercase tracking-wider">Dec 2026</th>
                <th className="text-right py-3 pl-4 font-semibold uppercase tracking-wider">Q4 Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/30">
              {plRows.map((row) => {
                const q4 = row.oct + row.nov + row.dec
                const isProfit = row.item === 'Net Profit'
                const isGross = row.item === 'Gross Profit'
                const isNeg = row.oct < 0

                return (
                  <tr
                    key={row.item}
                    className={`transition-colors hover:bg-slate-800/10 ${isProfit ? 'bg-cyan/[0.02]' : ''}`}
                  >
                    <td
                      className={`py-3 pr-8 font-medium ${
                        isProfit ? 'text-cyan font-bold' : isGross ? 'text-text-primary' : 'text-text-secondary'
                      }`}
                    >
                      {row.item}
                    </td>
                    {[row.oct, row.nov, row.dec, q4].map((v, i) => (
                      <td
                        key={i}
                        className={`py-3 px-4 text-right font-semibold ${
                          isProfit ? 'text-positive font-bold' : v < 0 ? 'text-negative' : 'text-text-primary'
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
      </div>
    </div>
  )
}
