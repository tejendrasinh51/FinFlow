'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
import { Calendar, TrendingUp, TrendingDown, ChevronDown, ChevronRight, Calculator, RefreshCw } from 'lucide-react'

// Advanced dashboard components
import { RuleOf40 } from '@/components/dashboard/RuleOf40'
import { UnitEconomics } from '@/components/dashboard/UnitEconomics'

// ── Data ──────────────────────────────────────────────────────────
const mrrData = [
  { month: 'Jan', mrr: 820000, new: 95000, expansion: 42000, churn: -28000, contraction: -12000 },
  { month: 'Feb', mrr: 917000, new: 110000, expansion: 55000, churn: -32000, contraction: -16000 },
  { month: 'Mar', mrr: 1034000, new: 145000, expansion: 61000, churn: -38000, contraction: -11000 },
  { month: 'Apr', mrr: 1191000, new: 168000, expansion: 72000, churn: -45000, contraction: -18000 },
  { month: 'May', mrr: 1368000, new: 205000, expansion: 88000, churn: -52000, contraction: -14000 },
  { month: 'Jun', mrr: 1595000, new: 248000, expansion: 101000, churn: -61000, contraction: -21000 },
  { month: 'Jul', mrr: 1862000, new: 310000, expansion: 120000, churn: -78000, contraction: -25000 },
  { month: 'Aug', mrr: 2014000, new: 190000, expansion: 88000, churn: -85000, contraction: -19000 },
  { month: 'Sep', mrr: 2188000, new: 220000, expansion: 95000, churn: -91000, contraction: -22000 },
  { month: 'Oct', mrr: 2390000, new: 258000, expansion: 102000, churn: -98000, contraction: -28000 },
  { month: 'Nov', mrr: 2624000, new: 290000, expansion: 115000, churn: -108000, contraction: -31000 },
  { month: 'Dec', mrr: 2890000, new: 332000, expansion: 130000, churn: -118000, contraction: -36000 },
]

const cashflowData = [
  { month: 'Jan', inflow: 920000, outflow: -620000, net: 300000 },
  { month: 'Feb', inflow: 980000, outflow: -650000, net: 330000 },
  { month: 'Mar', inflow: 1050000, outflow: -690000, net: 360000 },
  { month: 'Apr', inflow: 1120000, outflow: -720000, net: 400000 },
  { month: 'May', inflow: 1200000, outflow: -760000, net: 440000 },
  { month: 'Jun', inflow: 1310000, outflow: -800000, net: 510000 },
  { month: 'Jul', inflow: 1450000, outflow: -855000, net: 595000 },
  { month: 'Aug', inflow: 1520000, outflow: -895000, net: 625000 },
  { month: 'Sep', inflow: 1620000, outflow: -940000, net: 680000 },
  { month: 'Oct', inflow: 1740000, outflow: -985000, net: 755000 },
  { month: 'Nov', inflow: 1880000, outflow: -1030000, net: 850000 },
  { month: 'Dec', inflow: 2010000, outflow: -1080000, net: 930000 },
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
    <div className="card p-3 text-xs font-mono shadow-cyan-md bg-[#0F172A]/90 border border-slate-700/50 backdrop-blur-md">
      <div className="text-text-secondary mb-2 font-medium">{label}</div>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-4 mb-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: p.color ?? p.fill }} />
            <span className="text-text-tertiary capitalize">{p.name}</span>
          </div>
          <span className="text-text-primary font-bold">{fmt(p.value)}</span>
        </div>
      ))}
    </div>
  )
}

const TABS = [
  { id: 'pl', label: 'P&L Statement' },
  { id: 'mrr', label: 'MRR / ARR Trends' },
  { id: 'cashflow', label: 'Cashflow Dynamics' },
]

export default function FinancePage({ defaultTab = 'pl' }: { defaultTab?: string }) {
  const [tab, setTab] = useState(defaultTab)
  const [fiscalYear, setFiscalYear] = useState<'2023' | '2026' | '2025'>('2026')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // P&L Drill-down state
  const [opexExpanded, setOpexExpanded] = useState(false)
  const [cogsExpanded, setCogsExpanded] = useState(false)

  // Sensitivity Analysis Inputs
  const [sensGrowth, setSensGrowth] = useState(25)     // Target YoY growth %
  const [sensChurn, setSensChurn] = useState(1.8)     // Target Monthly churn %
  const [sensExpansion, setSensExpansion] = useState(15) // Target annual expansion rate %

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Scaling multipliers based on target year
  const multiplier = fiscalYear === '2023' ? 0.82 : fiscalYear === '2025' ? 1.15 : 1.0

  // 1. Scaled KPIs
  const metrics = [
    { title: 'MRR', value: (2.89 * multiplier).toFixed(2) + 'M', prefix: '$', trend: fiscalYear === '2023' ? 8.4 : fiscalYear === '2025' ? 12.8 : 10.1, sparkData: generateSparkData(14, 2000000 * multiplier, 200000) },
    { title: 'ARR', value: (34.7 * multiplier).toFixed(1) + 'M', prefix: '$', trend: fiscalYear === '2023' ? 8.4 : fiscalYear === '2025' ? 12.8 : 10.1, sparkData: generateSparkData(14, 30000000 * multiplier, 2000000) },
    { title: 'Gross Margin', value: (78.5 * (fiscalYear === '2023' ? 0.98 : fiscalYear === '2025' ? 1.02 : 1.0)).toFixed(1), suffix: '%', trend: fiscalYear === '2023' ? 1.8 : fiscalYear === '2025' ? 2.9 : 2.3, sparkData: generateSparkData(14, 68 * (fiscalYear === '2023' ? 0.98 : fiscalYear === '2025' ? 1.02 : 1.0), 3) },
    { title: 'Net Profit', value: (2.01 * multiplier).toFixed(2) + 'M', prefix: '$', trend: fiscalYear === '2023' ? 24.2 : fiscalYear === '2025' ? 36.4 : 30.5, sparkData: generateSparkData(14, 1500000 * multiplier, 300000) },
  ]

  // 2. Scaled Datasets
  const scaledQuarterlyChartData = [
    { q: 'Q1', revenue: Math.round(2750000 * multiplier), profit: Math.round(780000 * multiplier) },
    { q: 'Q2', revenue: Math.round(3610000 * multiplier), profit: Math.round(1160000 * multiplier) },
    { q: 'Q3', revenue: Math.round(4550000 * multiplier), profit: Math.round(1540000 * multiplier) },
    { q: 'Q4', revenue: Math.round(5630000 * multiplier), profit: Math.round(2010000 * multiplier) },
  ]

  const scaledMrrData = mrrData.map(row => ({
    ...row,
    mrr: Math.round(row.mrr * multiplier),
    new: Math.round(row.new * multiplier),
    expansion: Math.round(row.expansion * multiplier),
    churn: Math.round(row.churn * multiplier),
    contraction: Math.round(row.contraction * multiplier),
  }))

  const scaledCashflowData = cashflowData.map(row => ({
    ...row,
    inflow: Math.round(row.inflow * multiplier),
    outflow: Math.round(row.outflow * multiplier),
    net: Math.round(row.net * multiplier),
  }))

  const scaledCashflowSummary = [
    { label: 'Total Inflows', value: '$' + (18.78 * multiplier).toFixed(2) + 'M', trend: fiscalYear === '2023' ? '+38.4%' : fiscalYear === '2025' ? '+48.2%' : '+42.3%', positive: true, icon: TrendingUp },
    { label: 'Total Outflows', value: '$' + (10.85 * multiplier).toFixed(2) + 'M', trend: fiscalYear === '2023' ? '+28.5%' : fiscalYear === '2025' ? '+35.1%' : '+31.8%', positive: false, icon: TrendingDown },
    { label: 'Net Cashflow', value: '$' + (7.93 * multiplier).toFixed(2) + 'M', trend: fiscalYear === '2023' ? '+52.1%' : fiscalYear === '2025' ? '+62.4%' : '+57.6%', positive: true, icon: TrendingUp },
  ]

  // P&L Drill-down Data Model
  const baseRevenue = 5630000 * multiplier
  
  // Cost items
  const cogsDetail = {
    hosting: Math.round(-620000 * multiplier),
    support: Math.round(-480000 * multiplier),
    licensing: Math.round(-520000 * multiplier),
  }
  const totalCogs = cogsDetail.hosting + cogsDetail.support + cogsDetail.licensing
  const grossProfit = baseRevenue + totalCogs

  // OpEx items
  const opexDetail = {
    rd: Math.round(-740000 * multiplier),
    sm: Math.round(-650000 * multiplier),
    ga: Math.round(-340000 * multiplier),
  }
  const totalOpex = opexDetail.rd + opexDetail.sm + opexDetail.ga
  const operatingProfit = grossProfit + totalOpex
  const taxInterest = Math.round(-270000 * multiplier)
  const netProfit = operatingProfit + taxInterest

  // Sensitivity Projected Ending ARR (12 months from now)
  // Formula: currentARR * (1 + Growth/100) * (1 - Churn*12/100) * (1 + Expansion/100)
  const currentARR = 34700000 * multiplier
  const projectedARR = currentARR * (1 + sensGrowth / 100) * (1 - (sensChurn * 12) / 100) * (1 + sensExpansion / 100)

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Breadcrumbs crumbs={[{ label: 'Finance' }]} />
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Financial Overview</h1>
          <p className="text-text-secondary text-xs md:text-sm font-mono mt-1">Full Year {fiscalYear} · Live fiscal forecasting</p>
        </div>
        <div className="flex items-center gap-3">
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="btn-secondary text-xs md:text-sm py-2 px-4 flex items-center gap-2 border border-[var(--color-border)] rounded-lg hover:border-cyan/30 transition-all"
            >
              <Calendar size={14} className="text-cyan" />
              FY {fiscalYear}
            </button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 6, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.97 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 top-12 w-48 card shadow-cyan-md z-50 overflow-hidden bg-[#0F172A]/95 border border-slate-700/50 backdrop-blur-md"
                >
                  <div className="p-1">
                    {[
                      { year: '2023', label: 'FY 2023', desc: 'Historical Data' },
                      { year: '2026', label: 'FY 2026', desc: 'Active Baseline' },
                      { year: '2025', label: 'FY 2025', desc: 'Forecast Projection' }
                    ].map(opt => (
                      <button
                        key={opt.year}
                        onClick={() => {
                          setFiscalYear(opt.year as any)
                          setDropdownOpen(false)
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${fiscalYear === opt.year
                            ? 'bg-cyan/10 text-cyan'
                            : 'hover:bg-elevated text-text-primary'
                          }`}
                      >
                        <div>
                          <div className="text-xs font-semibold">{opt.label}</div>
                          <div className="text-[9px] text-text-tertiary font-mono">{opt.desc}</div>
                        </div>
                        {fiscalYear === opt.year && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan" />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <ExportMenu />
        </div>
      </div>

      {/* Alert */}
      <AlertBanner
        type="success"
        title="Fiscal Optimization Active"
        message={`FY ${fiscalYear} financial modeling loaded. Use the simulator tools below to review sensitivity matrixes.`}
        action={{ label: 'Review Guidelines', onClick: () => { } }}
      />

      {/* KPIs — 2 col mobile, 4 col xl */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div key={m.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <MetricCard {...m} />
          </motion.div>
        ))}
      </div>

      {/* Tab switcher — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
        <Tabs tabs={TABS} activeTab={tab} onChange={setTab} />
      </div>

      {/* P&L View */}
      {tab === 'pl' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Collapsible Drill-down P&L Table (Left) */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <div className="text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-1">
                    Profit & Loss Statement
                  </div>
                  <h2 className="font-display font-semibold text-base md:text-lg">Collapsible Statement · FY {fiscalYear}</h2>
                </div>
                <ExportMenu variant="ghost" />
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-700/50 pb-2 text-text-tertiary uppercase">
                      <th className="text-left py-3 pr-8 font-semibold">Line Item</th>
                      <th className="text-right py-3 px-3 font-semibold">FY Baseline</th>
                      <th className="text-right py-3 px-3 font-semibold">Margin %</th>
                      <th className="text-right py-3 pl-3 font-semibold">Type</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/20">
                    
                    {/* Revenue Row */}
                    <tr className="bg-cyan/[0.02] hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 pr-8 font-bold text-cyan flex items-center gap-1 cursor-default">
                        <span className="w-4" /> {/* spacer */}
                        Total Revenue
                      </td>
                      <td className="py-3 px-3 text-right font-bold text-cyan">{fmt(baseRevenue)}</td>
                      <td className="py-3 px-3 text-right font-semibold text-text-secondary">100.0%</td>
                      <td className="py-3 pl-3 text-right text-text-tertiary">Top Line</td>
                    </tr>

                    {/* COGS Collapsible Parent */}
                    <tr 
                      className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                      onClick={() => setCogsExpanded(!cogsExpanded)}
                    >
                      <td className="py-3 pr-8 font-semibold text-text-primary flex items-center gap-1.5">
                        {cogsExpanded ? <ChevronDown size={12} className="text-cyan" /> : <ChevronRight size={12} className="text-text-tertiary" />}
                        Cost of Goods Sold (COGS)
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-negative">{fmt(totalCogs)}</td>
                      <td className="py-3 px-3 text-right text-text-secondary">
                        {((totalCogs / baseRevenue) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 pl-3 text-right text-[#EF4444] font-bold">Cost</td>
                    </tr>

                    {/* COGS Children */}
                    {cogsExpanded && (
                      <>
                        <tr className="bg-slate-800/10 text-text-tertiary">
                          <td className="py-2.5 pr-8 pl-8 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Hosting & Cloud Infrastructure
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(cogsDetail.hosting)}</td>
                          <td className="py-2.5 px-3 text-right">{((cogsDetail.hosting / baseRevenue) * 100).toFixed(1)}%</td>
                          <td className="py-2.5 pl-3 text-right text-[10px]">Infrastructure</td>
                        </tr>
                        <tr className="bg-slate-800/10 text-text-tertiary">
                          <td className="py-2.5 pr-8 pl-8 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Customer Support Operations
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(cogsDetail.support)}</td>
                          <td className="py-2.5 px-3 text-right">{((cogsDetail.support / baseRevenue) * 100).toFixed(1)}%</td>
                          <td className="py-2.5 pl-3 text-right text-[10px]">Support</td>
                        </tr>
                        <tr className="bg-slate-800/10 text-text-tertiary">
                          <td className="py-2.5 pr-8 pl-8 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Data Provider & Licensing Fees
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(cogsDetail.licensing)}</td>
                          <td className="py-2.5 px-3 text-right">{((cogsDetail.licensing / baseRevenue) * 100).toFixed(1)}%</td>
                          <td className="py-2.5 pl-3 text-right text-[10px]">Licensing</td>
                        </tr>
                      </>
                    )}

                    {/* Gross Profit Row */}
                    <tr className="bg-slate-800/30 font-bold hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 pr-8 text-text-primary flex items-center gap-1">
                        <span className="w-4" />
                        Gross Profit
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400">{fmt(grossProfit)}</td>
                      <td className="py-3 px-3 text-right text-emerald-400">
                        {((grossProfit / baseRevenue) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 pl-3 text-right text-emerald-400 font-bold">Profit</td>
                    </tr>

                    {/* OpEx Collapsible Parent */}
                    <tr 
                      className="hover:bg-slate-800/20 transition-colors cursor-pointer"
                      onClick={() => setOpexExpanded(!opexExpanded)}
                    >
                      <td className="py-3 pr-8 font-semibold text-text-primary flex items-center gap-1.5">
                        {opexExpanded ? <ChevronDown size={12} className="text-cyan" /> : <ChevronRight size={12} className="text-text-tertiary" />}
                        Operating Expenses (OpEx)
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-negative">{fmt(totalOpex)}</td>
                      <td className="py-3 px-3 text-right text-text-secondary">
                        {((totalOpex / baseRevenue) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 pl-3 text-right text-[#EF4444] font-bold">Cost</td>
                    </tr>

                    {/* OpEx Children */}
                    {opexExpanded && (
                      <>
                        <tr className="bg-slate-800/10 text-text-tertiary">
                          <td className="py-2.5 pr-8 pl-8 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Research & Development (R&D)
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(opexDetail.rd)}</td>
                          <td className="py-2.5 px-3 text-right">{((opexDetail.rd / baseRevenue) * 100).toFixed(1)}%</td>
                          <td className="py-2.5 pl-3 text-right text-[10px]">Product</td>
                        </tr>
                        <tr className="bg-slate-800/10 text-text-tertiary">
                          <td className="py-2.5 pr-8 pl-8 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            Sales & Marketing (S&M)
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(opexDetail.sm)}</td>
                          <td className="py-2.5 px-3 text-right">{((opexDetail.sm / baseRevenue) * 100).toFixed(1)}%</td>
                          <td className="py-2.5 pl-3 text-right text-[10px]">Growth</td>
                        </tr>
                        <tr className="bg-slate-800/10 text-text-tertiary">
                          <td className="py-2.5 pr-8 pl-8 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            General & Administrative (G&A)
                          </td>
                          <td className="py-2.5 px-3 text-right">{fmt(opexDetail.ga)}</td>
                          <td className="py-2.5 px-3 text-right">{((opexDetail.ga / baseRevenue) * 100).toFixed(1)}%</td>
                          <td className="py-2.5 pl-3 text-right text-[10px]">Overhead</td>
                        </tr>
                      </>
                    )}

                    {/* Operating Income */}
                    <tr className="bg-slate-800/20 font-bold hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 pr-8 text-text-primary flex items-center gap-1">
                        <span className="w-4" />
                        Operating Income (EBITDA)
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-400">{fmt(operatingProfit)}</td>
                      <td className="py-3 px-3 text-right text-emerald-400">
                        {((operatingProfit / baseRevenue) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 pl-3 text-right text-emerald-400 font-bold">Profit</td>
                    </tr>

                    {/* Tax & Interest */}
                    <tr className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3 pr-8 text-text-secondary flex items-center gap-1">
                        <span className="w-4" />
                        Tax, Interest & Adjustments
                      </td>
                      <td className="py-3 px-3 text-right text-negative">{fmt(taxInterest)}</td>
                      <td className="py-3 px-3 text-right text-text-secondary">
                        {((taxInterest / baseRevenue) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3 pl-3 text-right text-text-tertiary">Adjustment</td>
                    </tr>

                    {/* Net Income / Profit */}
                    <tr className="bg-emerald-500/5 font-bold hover:bg-slate-800/10 transition-colors border-t border-slate-600">
                      <td className="py-3.5 pr-8 text-emerald-400 flex items-center gap-1">
                        <span className="w-4" />
                        Net Profit
                      </td>
                      <td className="py-3.5 px-3 text-right text-emerald-400">{fmt(netProfit)}</td>
                      <td className="py-3.5 px-3 text-right text-emerald-400">
                        {((netProfit / baseRevenue) * 100).toFixed(1)}%
                      </td>
                      <td className="py-3.5 pl-3 text-right text-emerald-400 font-extrabold uppercase">Bottom Line</td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

            {/* Rule of 40 scorecard (Right) */}
            <div>
              <RuleOf40 
                growthRate={fiscalYear === '2023' ? 18.2 : fiscalYear === '2025' ? 34.5 : 28.5} 
                profitMargin={fiscalYear === '2023' ? 12.4 : fiscalYear === '2025' ? 18.6 : 16.2} 
              />
              
              <div className="card p-5 mt-6 space-y-4">
                <div className="flex items-center gap-2 text-cyan">
                  <Calculator size={16} />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">Statement Summary</span>
                </div>
                <div className="space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Gross Margin Rate:</span>
                    <span className="text-text-primary font-bold">{((grossProfit / baseRevenue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">OpEx Efficiency Ratio:</span>
                    <span className="text-text-primary font-bold">{((Math.abs(totalOpex) / baseRevenue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Net Profit Margin:</span>
                    <span className="text-text-primary font-bold">{((netProfit / baseRevenue) * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700/50 pt-2">
                    <span className="text-text-tertiary">Annual Cash Runway:</span>
                    <span className="text-[#10B981] font-bold">18.4 mos</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sensitivity Analysis & Simulator Panel */}
          <div className="card p-5 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/50 pb-3">
              <div>
                <h3 className="font-mono text-sm font-semibold text-text-primary uppercase tracking-wider">Financial Sensitivity Simulator</h3>
                <p className="text-[10px] font-mono text-text-tertiary">Adjust metrics to forecast the 12-month projected ARR scale</p>
              </div>
              <div className="text-[10px] font-mono text-text-secondary bg-slate-800/80 border border-slate-700/40 px-2 py-0.5 rounded">
                Current ARR: <strong className="text-text-primary">${(currentARR / 1000000).toFixed(2)}M</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-secondary">Target YoY Growth Rate</span>
                    <span className="text-cyan font-bold">+{sensGrowth}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="100"
                    value={sensGrowth}
                    onChange={(e) => setSensGrowth(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                  />
                </div>
                <p className="text-[9px] text-text-tertiary">
                  Expected increase in new business logo acquisition velocity.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-secondary">Expected Logo Churn Rate</span>
                    <span className="text-negative font-bold">{sensChurn}% / mo</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="6"
                    step="0.1"
                    value={sensChurn}
                    onChange={(e) => setSensChurn(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                  />
                </div>
                <p className="text-[9px] text-text-tertiary">
                  Percentage of contract values lost due to logos cancellation.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-text-secondary">Account Expansion Rate</span>
                    <span className="text-emerald-400 font-bold">+{sensExpansion}% / yr</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="50"
                    value={sensExpansion}
                    onChange={(e) => setSensExpansion(Number(e.target.value))}
                    className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00D4FF]"
                  />
                </div>
                <p className="text-[9px] text-text-tertiary">
                  Revenue expansion from upsells, cross-sells, or seat expansion.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-700/50">
              <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider block">Projected 12M ARR</span>
                <span className="text-xl font-bold font-mono text-[#00D4FF]">${(projectedARR / 1000000).toFixed(2)}M</span>
              </div>
              <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider block">Absolute ARR Lift</span>
                <span className="text-xl font-bold font-mono text-emerald-400">
                  +${((projectedARR - currentARR) / 1000000).toFixed(2)}M
                </span>
              </div>
              <div className="p-4 bg-slate-800/40 border border-slate-700/30 rounded-xl flex flex-col justify-between">
                <span className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider block">Relative ARR Increase</span>
                <span className="text-xl font-bold font-mono text-purple-400">
                  +{(((projectedARR - currentARR) / currentARR) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>

          {/* Quarterly bar chart */}
          <div className="card p-5">
            <div className="text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-1">Quarterly Performance</div>
            <h2 className="font-display font-semibold text-lg mb-6">Revenue vs Net Profit</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={scaledQuarterlyChartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="q" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="revenue" fill="rgba(0,212,255,0.6)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* MRR View */}
      {tab === 'mrr' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Trend chart */}
            <div className="card p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-1">MRR Trend</div>
                  <h2 className="font-display font-semibold text-lg">Monthly Recurring Revenue — 12 Months</h2>
                </div>
                <div className="flex items-center gap-2 text-positive text-xs font-mono">
                  <TrendingUp size={13} /> +252% YoY
                </div>
              </div>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={scaledMrrData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={v => `$${(v / 1000000).toFixed(1)}M`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="mrr" stroke="#00D4FF" strokeWidth={2} fill="url(#mrrGrad)" dot={false} name="MRR" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Unit Economics simulator widget */}
            <div>
              <UnitEconomics />
            </div>
          </div>

          {/* MRR Movement waterfall */}
          <div className="card p-5">
            <div className="text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-1">MRR Movement</div>
            <h2 className="font-display font-semibold text-lg mb-6">New · Expansion · Churn — Monthly</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={scaledMrrData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }} barGap={2}>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(v / 1000).toFixed(0)}K`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="new" fill="rgba(0,212,255,0.7)" radius={[4, 4, 0, 0]} name="New MRR" />
                <Bar dataKey="expansion" fill="rgba(16,185,129,0.7)" radius={[4, 4, 0, 0]} name="Expansion" />
                <Bar dataKey="churn" fill="rgba(239,68,68,0.6)" radius={[0, 0, 4, 4]} name="Churn" />
                <Bar dataKey="contraction" fill="rgba(245,158,11,0.6)" radius={[0, 0, 4, 4]} name="Contraction" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Cashflow View */}
      {tab === 'cashflow' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="card p-5">
            <div className="text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-1">Operating Cashflow</div>
            <h2 className="font-display font-semibold text-lg mb-6">Inflow vs Outflow vs Net — 12 Months</h2>
            <ResponsiveContainer width="100%" height={260}>
              <ComposedChart data={scaledCashflowData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,0.03)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={v => `$${(Math.abs(v) / 1000000).toFixed(1)}M`} tick={{ fill: '#3A4A5C', fontSize: 11, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.1)" />
                <Bar dataKey="inflow" fill="rgba(0,212,255,0.5)" radius={[4, 4, 0, 0]} name="Inflow" />
                <Bar dataKey="outflow" fill="rgba(239,68,68,0.4)" radius={[0, 0, 4, 4]} name="Outflow" />
                <Area type="monotone" dataKey="net" stroke="#10B981" strokeWidth={2} fill="url(#netGrad)" dot={false} name="Net" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Cashflow summary table */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scaledCashflowSummary.map(s => (
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
