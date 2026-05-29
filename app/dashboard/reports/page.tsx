'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ExportMenu } from '@/components/ui/ExportMenu'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Plus, FileText, BarChart2, PieChart, Table2, Pencil, Trash2, Copy, Eye, Clock } from 'lucide-react'

// ── Types ───────────────────────────────────────────────────────────
interface Report {
  id: string
  title: string
  type: 'revenue' | 'expense' | 'mrr' | 'custom'
  status: 'published' | 'draft' | 'scheduled'
  createdBy: string
  updatedAt: string
  views: number
  widgets: number
}

// ── Mock data ───────────────────────────────────────────────────────
const reports: Report[] = [
  { id: 'r1', title: 'Q4 2024 Executive Summary',   type: 'revenue',  status: 'published', createdBy: 'Alex Kim',    updatedAt: '2h ago',    views: 142, widgets: 6 },
  { id: 'r2', title: 'MRR Growth Analysis',          type: 'mrr',      status: 'published', createdBy: 'Sarah Chen',  updatedAt: '1d ago',    views: 89,  widgets: 4 },
  { id: 'r3', title: 'Expense Breakdown — FY24',     type: 'expense',  status: 'published', createdBy: 'Alex Kim',    updatedAt: '3d ago',    views: 67,  widgets: 5 },
  { id: 'r4', title: 'Annual Investor Report 2024',  type: 'custom',   status: 'draft',     createdBy: 'Sarah Chen',  updatedAt: '5d ago',    views: 12,  widgets: 8 },
  { id: 'r5', title: 'Q1 2025 Forecast',             type: 'revenue',  status: 'scheduled', createdBy: 'Alex Kim',    updatedAt: '1w ago',    views: 0,   widgets: 5 },
  { id: 'r6', title: 'Cashflow Statement — Dec',     type: 'expense',  status: 'published', createdBy: 'James Park',  updatedAt: '1w ago',    views: 44,  widgets: 3 },
  { id: 'r7', title: 'Churn Analysis H2 2024',       type: 'mrr',      status: 'published', createdBy: 'Sarah Chen',  updatedAt: '2w ago',    views: 56,  widgets: 4 },
  { id: 'r8', title: 'Board Deck — Feb 2025',        type: 'custom',   status: 'draft',     createdBy: 'Alex Kim',    updatedAt: '2w ago',    views: 3,   widgets: 10 },
]

const typeIcon = { revenue: BarChart2, expense: PieChart, mrr: TrendingUp, custom: FileText } as const
import { TrendingUp } from 'lucide-react'

const typeColors: Record<Report['type'], string> = {
  revenue: 'admin',
  expense: 'danger',
  mrr:     'success',
  custom:  'default',
}

const statusVariants: Record<Report['status'], 'success' | 'warning' | 'info'> = {
  published:  'success',
  draft:      'warning',
  scheduled:  'info',
}

// ── Report Builder Modal ────────────────────────────────────────────
const CHART_TYPES = [
  { id: 'area',   label: 'Area Chart',  icon: BarChart2 },
  { id: 'bar',    label: 'Bar Chart',   icon: BarChart2 },
  { id: 'donut',  label: 'Donut Chart', icon: PieChart },
  { id: 'table',  label: 'Data Table',  icon: Table2 },
  { id: 'kpi',    label: 'KPI Card',    icon: TrendingUp },
]

const METRICS = ['Revenue', 'MRR', 'ARR', 'Gross Profit', 'Net Profit', 'Churn Rate', 'DAU', 'Expenses']

function ReportBuilderModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [title, setTitle]       = useState('')
  const [chartType, setChart]   = useState('area')
  const [metric, setMetric]     = useState('Revenue')
  const [dateRange, setRange]   = useState('last_12_months')
  const [step, setStep]         = useState(1)

  const handleCreate = () => {
    // In real app: POST /api/reports
    onClose()
    setStep(1)
    setTitle('')
  }

  return (
    <Modal open={open} onClose={onClose} title="Create New Report" size="lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-medium border transition-all ${
                s <= step
                  ? 'bg-cyan/10 border-cyan/40 text-cyan'
                  : 'bg-elevated border-[var(--color-border)] text-text-tertiary'
              }`}
            >
              {s}
            </div>
            {s < 3 && <div className={`flex-1 h-px w-8 ${s < step ? 'bg-cyan/30' : 'bg-[var(--color-border)]'}`} />}
          </div>
        ))}
        <span className="text-text-tertiary text-xs font-mono ml-2">
          Step {step} of 3 — {step === 1 ? 'Basics' : step === 2 ? 'Data' : 'Review'}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Report Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q1 2025 Executive Summary"
              className="w-full px-4 py-3 bg-elevated border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setRange(e.target.value)}
              className="w-full px-4 py-3 bg-elevated border border-[var(--color-border)] rounded-lg text-text-secondary font-mono text-sm focus:outline-none focus:border-cyan/40 transition-all"
            >
              <option value="last_30_days">Last 30 days</option>
              <option value="last_3_months">Last 3 months</option>
              <option value="last_12_months">Last 12 months</option>
              <option value="ytd">Year to date</option>
              <option value="fy_2024">Full Year 2024</option>
              <option value="custom">Custom range</option>
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-5">
          <div>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-3">Chart Type</label>
            <div className="grid grid-cols-5 gap-2">
              {CHART_TYPES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setChart(c.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                    chartType === c.id
                      ? 'bg-cyan/10 border-cyan/30 text-cyan'
                      : 'bg-elevated border-[var(--color-border)] text-text-tertiary hover:border-cyan/20 hover:text-text-secondary'
                  }`}
                >
                  <c.icon size={18} />
                  <span className="text-[10px] font-mono">{c.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Primary Metric</label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${
                    metric === m
                      ? 'bg-cyan/10 border-cyan/30 text-cyan'
                      : 'bg-elevated border-[var(--color-border)] text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-elevated rounded-xl p-5 border border-[var(--color-border)] space-y-3">
            {[
              { label: 'Title',      value: title || '(untitled)' },
              { label: 'Date Range', value: dateRange.replace(/_/g, ' ') },
              { label: 'Chart Type', value: chartType },
              { label: 'Metric',     value: metric },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary font-mono">{row.label}</span>
                <span className="text-text-primary font-medium capitalize">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-text-tertiary text-xs font-mono">
            This report will be saved as a draft. You can publish it from the Reports page.
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="btn-ghost text-sm py-2 px-4">← Back</button>
        ) : <div />}
        <button
          onClick={step < 3 ? () => setStep(s => s + 1) : handleCreate}
          className="btn-primary text-sm py-2.5 px-6"
          disabled={step === 1 && !title}
        >
          {step < 3 ? 'Continue →' : '✓ Create Report'}
        </button>
      </div>
    </Modal>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function ReportsPage() {
  const [builderOpen, setBuilderOpen] = useState(false)

  const columns: Column<Report>[] = [
    {
      key: 'title',
      header: 'Report',
      sortable: true,
      render: row => {
        const Icon = typeIcon[row.type]
        return (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-elevated border border-[var(--color-border)] flex items-center justify-center flex-shrink-0">
              <Icon size={14} className="text-text-secondary" />
            </div>
            <div>
              <div className="text-text-primary text-xs font-medium">{row.title}</div>
              <div className="text-text-tertiary text-[10px] font-mono capitalize">{row.type} report</div>
            </div>
          </div>
        )
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: row => <Badge variant={statusVariants[row.status]} dot>{row.status}</Badge>,
    },
    {
      key: 'createdBy',
      header: 'Author',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center">
            <span className="text-cyan text-[9px] font-mono font-bold">
              {row.createdBy.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <span className="text-text-secondary text-xs">{row.createdBy}</span>
        </div>
      ),
    },
    {
      key: 'widgets',
      header: 'Widgets',
      sortable: true,
      render: row => <span className="text-text-secondary">{row.widgets} widgets</span>,
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-1.5 text-text-secondary">
          <Eye size={12} className="text-text-tertiary" />
          {row.views}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-1.5 text-text-tertiary text-xs">
          <Clock size={11} /> {row.updatedAt}
        </div>
      ),
    },
  ]

  const rowActions = (row: Report) => (
    <div className="flex items-center gap-1 justify-end">
      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-cyan hover:bg-cyan/5 transition-all" title="View">
        <Eye size={13} />
      </button>
      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-elevated transition-all" title="Edit">
        <Pencil size={13} />
      </button>
      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-elevated transition-all" title="Duplicate">
        <Copy size={13} />
      </button>
      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-negative hover:bg-negative/5 transition-all" title="Delete">
        <Trash2 size={13} />
      </button>
    </div>
  )

  const stats = [
    { label: 'Total Reports', value: reports.length, color: 'text-text-primary' },
    { label: 'Published',     value: reports.filter(r => r.status === 'published').length,  color: 'text-positive' },
    { label: 'Drafts',        value: reports.filter(r => r.status === 'draft').length,      color: 'text-warning' },
    { label: 'Scheduled',     value: reports.filter(r => r.status === 'scheduled').length,  color: 'text-cyan' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Breadcrumbs crumbs={[{ label: 'Reports' }]} />
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Reports</h1>
          <p className="text-text-secondary text-sm font-mono mt-1">{reports.length} reports · {reports.filter(r => r.status === 'published').length} published</p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu />
          <button onClick={() => setBuilderOpen(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
            <Plus size={15} /> New Report
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-4 text-center"
          >
            <div className={`font-mono font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-text-tertiary text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <DataTable
          columns={columns}
          data={reports}
          searchPlaceholder="Search reports…"
          pageSize={8}
          actions={rowActions}
          emptyMessage="No reports found. Create your first report above."
        />
      </motion.div>

      {/* Report Builder Modal */}
      <ReportBuilderModal open={builderOpen} onClose={() => setBuilderOpen(false)} />
    </div>
  )
}
