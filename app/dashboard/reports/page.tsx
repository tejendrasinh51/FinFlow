'use client'

import { useState, useEffect } from 'react'
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
  { id: 'r1', title: 'Q4 2026 Executive Summary', type: 'revenue', status: 'published', createdBy: 'Alex Kim', updatedAt: '2h ago', views: 142, widgets: 6 },
  { id: 'r2', title: 'MRR Growth Analysis', type: 'mrr', status: 'published', createdBy: 'Sarah Chen', updatedAt: '1d ago', views: 89, widgets: 4 },
  { id: 'r3', title: 'Expense Breakdown — FY24', type: 'expense', status: 'published', createdBy: 'Alex Kim', updatedAt: '3d ago', views: 67, widgets: 5 },
  { id: 'r4', title: 'Annual Investor Report 2026', type: 'custom', status: 'draft', createdBy: 'Sarah Chen', updatedAt: '5d ago', views: 12, widgets: 8 },
  { id: 'r5', title: 'Q1 2025 Forecast', type: 'revenue', status: 'scheduled', createdBy: 'Alex Kim', updatedAt: '1w ago', views: 0, widgets: 5 },
  { id: 'r6', title: 'Cashflow Statement — Dec', type: 'expense', status: 'published', createdBy: 'James Park', updatedAt: '1w ago', views: 44, widgets: 3 },
  { id: 'r7', title: 'Churn Analysis H2 2026', type: 'mrr', status: 'published', createdBy: 'Sarah Chen', updatedAt: '2w ago', views: 56, widgets: 4 },
  { id: 'r8', title: 'Board Deck — Feb 2025', type: 'custom', status: 'draft', createdBy: 'Alex Kim', updatedAt: '2w ago', views: 3, widgets: 10 },
]

const typeIcon = { revenue: BarChart2, expense: PieChart, mrr: TrendingUp, custom: FileText } as const
import { TrendingUp } from 'lucide-react'

const typeColors: Record<Report['type'], string> = {
  revenue: 'admin',
  expense: 'danger',
  mrr: 'success',
  custom: 'default',
}

const statusVariants: Record<Report['status'], 'success' | 'warning' | 'info'> = {
  published: 'success',
  draft: 'warning',
  scheduled: 'info',
}

// ── Report Builder Modal ────────────────────────────────────────────
const CHART_TYPES = [
  { id: 'area', label: 'Area Chart', icon: BarChart2 },
  { id: 'bar', label: 'Bar Chart', icon: BarChart2 },
  { id: 'donut', label: 'Donut Chart', icon: PieChart },
  { id: 'table', label: 'Data Table', icon: Table2 },
  { id: 'kpi', label: 'KPI Card', icon: TrendingUp },
]

const METRICS = ['Revenue', 'MRR', 'ARR', 'Gross Profit', 'Net Profit', 'Churn Rate', 'DAU', 'Expenses']

function ReportBuilderModal({
  open,
  onClose,
  onReportCreated,
  onReportUpdated,
  editReport = null
}: {
  open: boolean;
  onClose: () => void;
  onReportCreated?: (report: any) => void;
  onReportUpdated?: (report: any) => void;
  editReport?: Report | null;
}) {
  const [title, setTitle] = useState('')
  const [chartType, setChart] = useState('area')
  const [metric, setMetric] = useState('Revenue')
  const [dateRange, setRange] = useState('last_12_months')
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (editReport) {
      setTitle(editReport.title || '')
      setChart(editReport.config?.chartType || 'area')
      setMetric(editReport.config?.metric || 'Revenue')
      setRange(editReport.config?.dateRange || 'last_12_months')
    } else {
      setTitle('')
      setChart('area')
      setMetric('Revenue')
      setRange('last_12_months')
    }
    setStep(1)
  }, [editReport, open])

  const handleSubmit = async () => {
    try {
      const type = chartType === 'kpi' ? 'mrr' : chartType === 'donut' ? 'expense' : 'revenue'
      if (editReport) {
        const res = await fetch(`/api/reports/${editReport.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            config: { type, chartType, metric, dateRange },
          }),
        })
        if (res.ok) {
          const body = await res.json()
          if (body.success && body.report) {
            onReportUpdated?.(body.report)
          }
        }
      } else {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            config: { type, chartType, metric, dateRange },
            is_public: false,
          }),
        })
        if (res.ok) {
          const body = await res.json()
          if (body.success && body.report) {
            onReportCreated?.(body.report)
          }
        }
      }
    } catch (err) {
      console.error('Failed to submit report:', err)
    }
    onClose()
    setStep(1)
    setTitle('')
  }

  return (
    <Modal open={open} onClose={onClose} title={editReport ? "Edit Report" : "Create New Report"} size="lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-medium border transition-all ${s <= step
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
              <option value="fy_2026">Full Year 2026</option>
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
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${chartType === c.id
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
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${metric === m
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
              { label: 'Title', value: title || '(untitled)' },
              { label: 'Date Range', value: dateRange.replace(/_/g, ' ') },
              { label: 'Chart Type', value: chartType },
              { label: 'Metric', value: metric },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between text-sm">
                <span className="text-text-tertiary font-mono">{row.label}</span>
                <span className="text-text-primary font-medium capitalize">{row.value}</span>
              </div>
            ))}
          </div>
          <p className="text-text-tertiary text-xs font-mono">
            {editReport ? "Saving changes will immediately update this report layout." : "This report will be saved as a draft. You can publish it from the Reports page."}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-border)]">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="btn-ghost text-sm py-2 px-4">← Back</button>
        ) : <div />}
        <button
          onClick={step < 3 ? () => setStep(s => s + 1) : handleSubmit}
          className="btn-primary text-sm py-2.5 px-6"
          disabled={step === 1 && !title}
        >
          {step < 3 ? 'Continue →' : editReport ? '✓ Save Changes' : '✓ Create Report'}
        </button>
      </div>
    </Modal>
  )
}

// ── View Report Drawer/Modal ─────────────────────────────────────────
interface ViewReportModalProps {
  open: boolean
  onClose: () => void
  report: any
}

function ViewReportModal({ open, onClose, report }: ViewReportModalProps) {
  const [exporting, setExporting] = useState<string | null>(null)

  if (!report) return null

  const getMockData = () => {
    const metricName = report.config?.metric || 'Revenue'
    if (metricName.toLowerCase() === 'expenses' || report.type === 'expense') {
      return [84000, 78000, 92000, 81000, 89000, 95000, 87000, 102000, 91000]
    }
    if (metricName.toLowerCase() === 'churn rate') {
      return [4.2, 3.9, 3.5, 3.2, 2.9, 2.7, 2.3, 2.1, 1.8]
    }
    return [120000, 135000, 150000, 142000, 168000, 185000, 210000, 198000, 245000]
  }

  const mockValues = getMockData()
  const svgWidth = 480
  const svgHeight = 120
  const paddingX = 20
  const paddingY = 15

  const minVal = Math.min(...mockValues) * 0.9
  const maxVal = Math.max(...mockValues) * 1.1
  const chartW = svgWidth - (paddingX * 2)
  const chartH = svgHeight - (paddingY * 2)

  const points = mockValues.map((v, i) => {
    const x = paddingX + (i / (mockValues.length - 1)) * chartW
    const y = paddingY + chartH - ((v - minVal) / (maxVal - minVal)) * chartH
    return `${x},${y}`
  })

  const pathD = points.length > 0 ? `M ${points.join(' L ')}` : ''
  const fillD = points.length > 0 ? `M ${paddingX},${paddingY + chartH} L ${points.join(' L ')} L ${paddingX + chartW},${paddingY + chartH} Z` : ''

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExporting(format)
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, title: report.title }),
      })
      if (!res.ok) throw new Error('Export trigger failed')
      const triggerData = await res.json()
      const jobId = triggerData.jobId

      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        if (attempts > 30) {
          clearInterval(poll)
          setExporting(null)
          return
        }
        const statusRes = await fetch(`/api/export/${jobId}`)
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          if (statusData.success && statusData.job) {
            const status = statusData.job.status
            if (status === 'done') {
              clearInterval(poll)
              setExporting(null)
              const downloadUrl = statusData.job.url
              if (downloadUrl) {
                const a = document.createElement('a')
                a.href = downloadUrl
                a.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format === 'excel' ? 'xlsx' : 'pdf'}`)
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
              }
            } else if (status === 'error') {
              clearInterval(poll)
              setExporting(null)
            }
          }
        }
      }, 1000)
    } catch (e) {
      console.error(e)
      setExporting(null)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={report.title} size="md">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant={report.status === 'published' ? 'success' : report.status === 'draft' ? 'warning' : 'info'} dot>
            {report.status}
          </Badge>
          <Badge variant="default">
            {report.type.toUpperCase()} Report
          </Badge>
          <span className="text-text-tertiary text-xs font-mono">
            Updated {report.updatedAt}
          </span>
        </div>

        <div className="bg-elevated border border-[var(--color-border)] rounded-xl p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Metrics Parameter</div>
            <div className="text-text-secondary text-sm font-medium mt-1 font-mono">{report.config?.metric || 'Revenue'}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Visualization Style</div>
            <div className="text-text-secondary text-sm font-medium mt-1 capitalize font-mono">{report.config?.chartType || 'Area Chart'}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Historical Scope</div>
            <div className="text-text-secondary text-sm font-medium mt-1 capitalize font-mono">{report.config?.dateRange?.replace(/_/g, ' ') || 'Last 12 Months'}</div>
          </div>
          <div>
            <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider">Associated Widgets</div>
            <div className="text-text-secondary text-sm font-medium mt-1 font-mono">{report.widgets || 4} components</div>
          </div>
        </div>

        <div className="bg-elevated border border-[var(--color-border)] rounded-xl p-4 overflow-hidden relative">
          <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan animate-pulse"></span>
            Simulated Trend Stream Preview
          </div>
          <div className="flex items-center justify-center">
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full overflow-visible">
              <defs>
                <linearGradient id="viewGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d={fillD} fill="url(#viewGrad)" />
              <path d={pathD} fill="none" stroke="#00D4FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              {points.map((p, idx) => {
                const [cx, cy] = p.split(',')
                return <circle key={idx} cx={cx} cy={cy} r="3.5" fill="#05080F" stroke="#00D4FF" strokeWidth="1.5" />
              })}
            </svg>
          </div>
        </div>

        <div className="pt-4 border-t border-[var(--color-border)] flex items-center justify-between">
          <span className="text-text-tertiary text-xs font-mono">
            Requires {report.status === 'published' ? 'export:pdf' : 'export:raw'} auth
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              disabled={!!exporting}
            >
              {exporting === 'pdf' ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Compiling…
                </>
              ) : (
                <>
                  <FileText size={12} className="text-cyan" />
                  Export PDF
                </>
              )}
            </button>
            <button
              onClick={() => handleExport('excel')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              disabled={!!exporting}
            >
              {exporting === 'excel' ? (
                <>
                  <svg className="animate-spin h-3 w-3 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Compiling…
                </>
              ) : (
                <>
                  <FileSpreadsheet size={12} className="text-cyan" />
                  Export Excel
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

// ── Delete Confirmation Modal ────────────────────────────────────────
function DeleteConfirmationModal({
  open,
  onClose,
  onConfirm,
  reportTitle,
  isDeleting
}: {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  reportTitle: string
  isDeleting: boolean
}) {
  return (
    <Modal open={open} onClose={onClose} title="Confirm Report Deletion" size="sm">
      <div className="space-y-5">
        <div className="p-3 bg-negative/5 border border-negative/20 rounded-lg flex gap-3">
          <Trash2 size={16} className="text-negative flex-shrink-0 mt-0.5" />
          <div className="text-xs text-text-secondary leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-text-primary">{reportTitle}</strong>? This action will remove the report layout and dashboard components and cannot be undone.
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
          <button onClick={onClose} className="btn-ghost text-xs py-2 px-4" disabled={isDeleting}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger text-xs py-2.5 px-4 flex items-center gap-1.5" disabled={isDeleting}>
            {isDeleting ? (
              <>
                <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Deleting…
              </>
            ) : (
              <>✕ Delete Report</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Main page ───────────────────────────────────────────────────────
export default function ReportsPage() {
  const [builderOpen, setBuilderOpen] = useState(false)
  const [reportList, setReportList] = useState<Report[]>([])

  // Dynamic state hooks for operational action flows
  const [viewReport, setViewReport] = useState<any | null>(null)
  const [editReport, setEditReport] = useState<any | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [errorBannerMsg, setErrorBannerMsg] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicatingId, setIsDuplicatingId] = useState<string | null>(null)

  // Fetch reports on mount
  useEffect(() => {
    fetch('/api/reports')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.success && data.reports) {
          const dbReports: Report[] = data.reports.map((r: any) => ({
            id: r.id,
            title: r.title,
            type: (r.config?.type as any) || 'custom',
            status: r.is_public ? 'published' : 'draft',
            createdBy: 'You',
            updatedAt: new Date(r.updated_at).toLocaleDateString(),
            views: 0,
            widgets: r.config?.widgets?.length || 4,
            config: r.config // Save configuration for Edit/View actions
          }))
          setReportList([...dbReports, ...reports])
        } else {
          setReportList(reports)
        }
      })
      .catch(err => {
        console.error('Failed to load reports:', err)
        setReportList(reports)
      })
  }, [])

  const handleReportCreated = (newDbReport: any) => {
    const mapped: Report = {
      id: newDbReport.id,
      title: newDbReport.title,
      type: (newDbReport.config?.type as any) || 'custom',
      status: newDbReport.is_public ? 'published' : 'draft',
      createdBy: 'You',
      updatedAt: 'Just now',
      views: 0,
      widgets: newDbReport.config?.widgets?.length || 4,
      config: newDbReport.config
    }
    setReportList(prev => [mapped, ...prev])
  }

  const handleReportUpdated = (updatedDbReport: any) => {
    setReportList(prev => prev.map(r => {
      if (r.id === updatedDbReport.id) {
        return {
          ...r,
          title: updatedDbReport.title,
          type: (updatedDbReport.config?.type as any) || 'custom',
          status: updatedDbReport.is_public ? 'published' : 'draft',
          widgets: updatedDbReport.config?.widgets?.length || 4,
          updatedAt: 'Just now',
          config: updatedDbReport.config
        }
      }
      return r
    }))
  }

  const handleDuplicate = async (row: any) => {
    setIsDuplicatingId(row.id)
    try {
      const type = row.type
      const chartType = row.config?.chartType || 'area'
      const metric = row.config?.metric || 'Revenue'
      const dateRange = row.config?.dateRange || 'last_12_months'

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `${row.title} (Copy)`,
          config: { type, chartType, metric, dateRange },
          is_public: false,
        }),
      })
      if (res.ok) {
        const body = await res.json()
        if (body.success && body.report) {
          const mapped: Report = {
            id: body.report.id,
            title: body.report.title,
            type: (body.report.config?.type as any) || 'custom',
            status: body.report.is_public ? 'published' : 'draft',
            createdBy: 'You',
            updatedAt: 'Just now',
            views: 0,
            widgets: body.report.config?.widgets?.length || 4,
            config: body.report.config
          }
          setReportList(prev => [mapped, ...prev])
        }
      }
    } catch (err) {
      console.error('Failed to duplicate report:', err)
    } finally {
      setIsDuplicatingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    setIsDeleting(true)
    setErrorBannerMsg(null)
    try {
      const res = await fetch(`/api/reports/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setReportList(prev => prev.filter(r => r.id !== id))
        setDeleteConfirmId(null)
      } else if (res.status === 403) {
        setErrorBannerMsg('Forbidden: Only accounts with the Admin role can delete reports.')
        setDeleteConfirmId(null)
      } else {
        const errBody = await res.json()
        setErrorBannerMsg(errBody.error || 'Failed to delete report.')
        setDeleteConfirmId(null)
      }
    } catch (err) {
      console.error('Failed to delete report:', err)
      setErrorBannerMsg('Network error: Could not complete deletion.')
      setDeleteConfirmId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns: Column<Report>[] = [
    {
      key: 'title',
      header: 'Report',
      sortable: true,
      render: row => {
        const Icon = typeIcon[row.type] || FileText
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
      <button
        onClick={() => setViewReport(row)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-cyan hover:bg-cyan/5 transition-all"
        title="View"
      >
        <Eye size={13} />
      </button>
      <button
        onClick={() => {
          setEditReport(row)
          setBuilderOpen(true)
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-elevated transition-all"
        title="Edit"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={() => handleDuplicate(row)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-elevated transition-all"
        title="Duplicate"
        disabled={isDuplicatingId === row.id}
      >
        {isDuplicatingId === row.id ? (
          <svg className="animate-spin h-3.5 w-3.5 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <Copy size={13} />
        )}
      </button>
      <button
        onClick={() => setDeleteConfirmId(row.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-negative hover:bg-negative/5 transition-all"
        title="Delete"
      >
        <Trash2 size={13} />
      </button>
    </div>
  )

  const stats = [
    { label: 'Total Reports', value: reportList.length, color: 'text-text-primary' },
    { label: 'Published', value: reportList.filter(r => r.status === 'published').length, color: 'text-positive' },
    { label: 'Drafts', value: reportList.filter(r => r.status === 'draft').length, color: 'text-warning' },
    { label: 'Scheduled', value: reportList.filter(r => r.status === 'scheduled').length, color: 'text-cyan' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Error banner alert feedback */}
      {errorBannerMsg && (
        <AlertBanner
          message={errorBannerMsg}
          variant="danger"
          onClose={() => setErrorBannerMsg(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Breadcrumbs crumbs={[{ label: 'Reports' }]} />
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Reports</h1>
          <p className="text-text-secondary text-sm font-mono mt-1">{reportList.length} reports · {reportList.filter(r => r.status === 'published').length} published</p>
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
          data={reportList}
          searchPlaceholder="Search reports…"
          pageSize={8}
          actions={rowActions}
          emptyMessage="No reports found. Create your first report above."
        />
      </motion.div>

      {/* Report Builder Modal */}
      <ReportBuilderModal
        open={builderOpen}
        onClose={() => {
          setBuilderOpen(false)
          setEditReport(null)
        }}
        onReportCreated={handleReportCreated}
        onReportUpdated={handleReportUpdated}
        editReport={editReport}
      />

      {/* View Report Modal */}
      {viewReport && (
        <ViewReportModal
          open={!!viewReport}
          onClose={() => setViewReport(null)}
          report={viewReport}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <DeleteConfirmationModal
          open={!!deleteConfirmId}
          onClose={() => setDeleteConfirmId(null)}
          onConfirm={() => handleDelete(deleteConfirmId)}
          reportTitle={reportList.find(r => r.id === deleteConfirmId)?.title || 'Selected Report'}
          isDeleting={isDeleting}
        />
      )}
    </div>
  )
}
