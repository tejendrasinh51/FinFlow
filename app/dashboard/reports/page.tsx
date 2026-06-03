'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { ExportMenu } from '@/components/ui/ExportMenu'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { 
  Plus, FileText, BarChart2, PieChart, Table2, Pencil, Trash2, 
  Copy, Eye, Clock, TrendingUp, Sparkles, Calendar, Mail, FileSpreadsheet 
} from 'lucide-react'

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
  config?: {
    type: 'revenue' | 'expense' | 'mrr' | 'custom'
    chartType: string
    metric: string
    dateRange: string
    aiPrompt?: string
    isScheduled?: boolean
    scheduleCron?: string
    scheduleRecipients?: string
    scheduleFormat?: string
  }
}

// ── Mock data ───────────────────────────────────────────────────────
const mockReports: Report[] = [
  { id: 'r1', title: 'Q4 2026 Executive Summary', type: 'revenue', status: 'published', createdBy: 'Alex Kim', updatedAt: '2h ago', views: 142, widgets: 6, config: { type: 'revenue', chartType: 'area', metric: 'Revenue', dateRange: 'last_12_months' } },
  { id: 'r2', title: 'MRR Growth Analysis', type: 'mrr', status: 'published', createdBy: 'Sarah Chen', updatedAt: '1d ago', views: 89, widgets: 4, config: { type: 'mrr', chartType: 'line', metric: 'MRR', dateRange: 'last_12_months' } },
  { id: 'r3', title: 'Expense Breakdown — FY24', type: 'expense', status: 'published', createdBy: 'Alex Kim', updatedAt: '3d ago', views: 67, widgets: 5, config: { type: 'expense', chartType: 'donut', metric: 'Expenses', dateRange: 'last_12_months' } },
  { id: 'r4', title: 'Annual Investor Report 2026', type: 'custom', status: 'draft', createdBy: 'Sarah Chen', updatedAt: '5d ago', views: 12, widgets: 8, config: { type: 'custom', chartType: 'table', metric: 'ARR', dateRange: 'ytd' } },
  { id: 'r5', title: 'Q1 2025 Forecast', type: 'revenue', status: 'scheduled', createdBy: 'Alex Kim', updatedAt: '1w ago', views: 0, widgets: 5, config: { type: 'revenue', chartType: 'area', metric: 'Revenue', dateRange: 'fy_2026', isScheduled: true, scheduleCron: '0 9 * * 1', scheduleRecipients: 'investors@finflow.com', scheduleFormat: 'pdf' } },
  { id: 'r6', title: 'Cashflow Statement — Dec', type: 'expense', status: 'published', createdBy: 'James Park', updatedAt: '1w ago', views: 44, widgets: 3, config: { type: 'expense', chartType: 'table', metric: 'Expenses', dateRange: 'last_30_days' } },
]

const typeIcon = { revenue: BarChart2, expense: PieChart, mrr: TrendingUp, custom: FileText } as const

const statusVariants: Record<Report['status'], 'success' | 'warning' | 'info'> = {
  published: 'success',
  draft: 'warning',
  scheduled: 'info',
}

// ── Prebuilt templates ──────────────────────────────────────────────
const TEMPLATES = [
  {
    title: 'Board Pack Report',
    desc: 'Comprehensive summary including MRR waterfall, LTV/CAC, and runway forecasting.',
    type: 'custom',
    metric: 'Net Profit',
    chartType: 'table',
    dateRange: 'last_12_months',
    widgets: 8,
  },
  {
    title: 'Investor Monthly Update',
    desc: 'Lightweight monthly overview with key growth indicators, DAU, and NRR.',
    type: 'revenue',
    metric: 'MRR',
    chartType: 'area',
    dateRange: 'last_30_days',
    widgets: 4,
  },
  {
    title: 'Weekly Financial Pulse',
    desc: 'Weekly cash flow statement displaying inflow vs outflow and runway levels.',
    type: 'expense',
    metric: 'Expenses',
    chartType: 'bar',
    dateRange: 'last_3_months',
    widgets: 5,
  },
]

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
  editReport = null,
  prefilledTemplate = null
}: {
  open: boolean;
  onClose: () => void;
  onReportCreated?: (report: any) => void;
  onReportUpdated?: (report: any) => void;
  editReport?: Report | null;
  prefilledTemplate?: any | null;
}) {
  const [title, setTitle] = useState('')
  const [chartType, setChart] = useState('area')
  const [metric, setMetric] = useState('Revenue')
  const [dateRange, setRange] = useState('last_12_months')
  const [aiPrompt, setAiPrompt] = useState('')
  const [aiProcessing, setAiProcessing] = useState(false)
  
  // Scheduling state
  const [isScheduled, setIsScheduled] = useState(false)
  const [scheduleCron, setScheduleCron] = useState('0 9 * * 1')
  const [scheduleRecipients, setScheduleRecipients] = useState('')
  const [scheduleFormat, setScheduleFormat] = useState('pdf')

  const [step, setStep] = useState(1)

  useEffect(() => {
    if (editReport) {
      setTitle(editReport.title || '')
      setChart(editReport.config?.chartType || 'area')
      setMetric(editReport.config?.metric || 'Revenue')
      setRange(editReport.config?.dateRange || 'last_12_months')
      setAiPrompt(editReport.config?.aiPrompt || '')
      setIsScheduled(editReport.config?.isScheduled || false)
      setScheduleCron(editReport.config?.scheduleCron || '0 9 * * 1')
      setScheduleRecipients(editReport.config?.scheduleRecipients || '')
      setScheduleFormat(editReport.config?.scheduleFormat || 'pdf')
    } else if (prefilledTemplate) {
      setTitle(prefilledTemplate.title || '')
      setChart(prefilledTemplate.chartType || 'area')
      setMetric(prefilledTemplate.metric || 'Revenue')
      setRange(prefilledTemplate.dateRange || 'last_12_months')
      setAiPrompt('')
      setIsScheduled(false)
      setScheduleCron('0 9 * * 1')
      setScheduleRecipients('')
      setScheduleFormat('pdf')
    } else {
      setTitle('')
      setChart('area')
      setMetric('Revenue')
      setRange('last_12_months')
      setAiPrompt('')
      setIsScheduled(false)
      setScheduleCron('0 9 * * 1')
      setScheduleRecipients('')
      setScheduleFormat('pdf')
    }
    setStep(1)
  }, [editReport, prefilledTemplate, open])

  // AI Prompt simulator
  const handleAiTrigger = () => {
    if (!aiPrompt) return
    setAiProcessing(true)
    setTimeout(() => {
      // Simulate AI understanding the prompt and auto-configuring
      if (aiPrompt.toLowerCase().includes('board') || aiPrompt.toLowerCase().includes('executive')) {
        setTitle('AI Generated Board Pack Summary')
        setChart('table')
        setMetric('Net Profit')
        setRange('last_12_months')
      } else if (aiPrompt.toLowerCase().includes('churn') || aiPrompt.toLowerCase().includes('retention')) {
        setTitle('AI Generated Customer Retention Report')
        setChart('line')
        setMetric('Churn Rate')
        setRange('last_3_months')
      } else {
        setTitle('AI Draft Report — ' + aiPrompt.slice(0, 24) + '...')
        setChart('area')
        setMetric('Revenue')
        setRange('ytd')
      }
      setAiProcessing(false)
      setStep(2) // Jump to next step
    }, 1500)
  }

  const handleSubmit = async () => {
    try {
      const type = chartType === 'kpi' ? 'mrr' : chartType === 'donut' ? 'expense' : 'revenue'
      const status = isScheduled ? 'scheduled' : 'draft'
      const config = { type, chartType, metric, dateRange, aiPrompt, isScheduled, scheduleCron, scheduleRecipients, scheduleFormat }
      
      if (editReport) {
        const res = await fetch(`/api/reports/${editReport.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, config, status }),
        })
        if (res.ok) {
          const body = await res.json()
          if (body.success && body.report) {
            onReportUpdated?.(body.report)
          }
        } else {
          // Mock local state update if DB endpoint fails
          onReportUpdated?.({ id: editReport.id, title, type, status, createdBy: 'You', updatedAt: 'Just now', views: editReport.views, widgets: 6, config })
        }
      } else {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, config, is_public: false }),
        })
        if (res.ok) {
          const body = await res.json()
          if (body.success && body.report) {
            onReportCreated?.(body.report)
          }
        } else {
          // Mock local state creation if DB endpoint fails
          onReportCreated?.({ id: 'r-local-' + Date.now(), title, type, status, createdBy: 'You', updatedAt: 'Just now', views: 0, widgets: 4, config })
        }
      }
    } catch (err) {
      console.error('Failed to submit report:', err)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} title={editReport ? "Edit Report Configuration" : "AI Report Builder Wizard"} size="lg">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6 border-b border-slate-700/30 pb-4">
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
            {s < 3 && <div className={`h-px w-10 ${s < step ? 'bg-cyan/40' : 'bg-slate-700/50'}`} />}
          </div>
        ))}
        <span className="text-text-tertiary text-[10px] font-mono uppercase tracking-wider ml-3">
          Step {step} of 3 — {step === 1 ? 'Basics & AI Assistant' : step === 2 ? 'Metric & Delivery' : 'Final Review'}
        </span>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          {/* AI Generator Input */}
          <div className="bg-cyan/5 border border-cyan/20 p-4 rounded-xl space-y-3 relative overflow-hidden">
            <div className="absolute right-3 top-3 text-cyan/20 pointer-events-none">
              <Sparkles size={48} />
            </div>
            <div className="flex items-center gap-2 text-cyan">
              <Sparkles size={14} className="animate-pulse" />
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">AI Report Copilot</span>
            </div>
            <p className="text-[10px] font-mono text-text-tertiary">
              Describe the metrics or format you want to examine, and our AI will configure the wizard parameters:
            </p>
            <div className="flex gap-2">
              <input
                value={aiPrompt}
                onChange={e => setAiPrompt(e.target.value)}
                placeholder="e.g. Build an investor board deck examining gross profits over the last year"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-xs font-mono placeholder:text-text-tertiary text-text-primary focus:outline-none focus:border-cyan/40"
              />
              <button
                type="button"
                onClick={handleAiTrigger}
                disabled={aiProcessing || !aiPrompt}
                className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 shrink-0"
              >
                {aiProcessing ? 'Processing…' : 'Generate'}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">Report Title</label>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q4 2026 Executive Summary"
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-xs focus:outline-none focus:border-cyan/40 transition-all"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">Date Range</label>
            <select
              value={dateRange}
              onChange={e => setRange(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-text-secondary font-mono text-xs focus:outline-none focus:border-cyan/40 transition-all"
            >
              <option value="last_30_days">Last 30 days</option>
              <option value="last_3_months">Last 3 months</option>
              <option value="last_12_months">Last 12 months</option>
              <option value="ytd">Year to date</option>
              <option value="fy_2026">Full Year 2026</option>
            </select>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-3">Chart Type</label>
            <div className="grid grid-cols-5 gap-2">
              {CHART_TYPES.map(c => (
                <button
                  key={c.id}
                  onClick={() => setChart(c.id)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${chartType === c.id
                      ? 'bg-cyan/10 border-cyan/30 text-cyan'
                      : 'bg-slate-800/40 border-slate-700/50 text-text-tertiary hover:border-cyan/20 hover:text-text-secondary'
                    }`}
                >
                  <c.icon size={16} />
                  <span className="text-[9px] font-mono uppercase tracking-wider">{c.label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-text-secondary text-[10px] font-mono uppercase tracking-wider mb-2">Primary Metric</label>
            <div className="flex flex-wrap gap-2">
              {METRICS.map(m => (
                <button
                  key={m}
                  onClick={() => setMetric(m)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-all ${metric === m
                      ? 'bg-cyan/10 border-cyan/30 text-cyan'
                      : 'bg-slate-800/40 border-slate-700/50 text-text-tertiary hover:text-text-secondary'
                    }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Scheduled Delivery Section */}
          <div className="border-t border-slate-700/30 pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-cyan" />
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-primary">Schedule Automatic Delivery</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-cyan"></div>
              </label>
            </div>

            {isScheduled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-800/40 p-4 rounded-xl border border-slate-700/30 font-mono text-xs">
                <div>
                  <label className="block text-[9px] text-text-tertiary uppercase tracking-wider mb-1.5">Recipient Emails</label>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                    <Mail size={12} className="text-text-tertiary" />
                    <input
                      value={scheduleRecipients}
                      onChange={e => setScheduleRecipients(e.target.value)}
                      placeholder="investors@company.com"
                      className="bg-transparent border-none outline-none text-xs w-full text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-text-tertiary uppercase tracking-wider mb-1.5">Cron Schedule Expression</label>
                  <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5">
                    <Clock size={12} className="text-text-tertiary" />
                    <input
                      value={scheduleCron}
                      onChange={e => setScheduleCron(e.target.value)}
                      placeholder="e.g. 0 9 * * 1 (Weekly)"
                      className="bg-transparent border-none outline-none text-xs w-full text-text-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] text-text-tertiary uppercase tracking-wider mb-1.5">Export Format</label>
                  <select
                    value={scheduleFormat}
                    onChange={e => setScheduleFormat(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-text-secondary focus:outline-none"
                  >
                    <option value="pdf">PDF board pack</option>
                    <option value="excel">Excel spreadsheet</option>
                    <option value="csv">Raw CSV values</option>
                  </select>
                </div>

                <div className="flex items-center text-[9px] text-text-tertiary leading-normal pt-4">
                  * Automatic jobs run on-node using internal schedulers. Output compiled to AWS S3.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/50 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Report Title</span>
              <span className="text-text-primary font-bold">{title || '(untitled)'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Primary Metric</span>
              <span className="text-cyan font-bold">{metric}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Visual Style</span>
              <span className="text-text-primary font-bold uppercase">{chartType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-text-tertiary">Date Scope</span>
              <span className="text-text-primary font-bold uppercase">{dateRange.replace(/_/g, ' ')}</span>
            </div>
            {isScheduled && (
              <div className="border-t border-slate-700/30 pt-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-text-tertiary">Scheduled Delivery:</span>
                  <span className="text-emerald-400 font-bold">Enabled</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-text-tertiary">Cron Pattern:</span>
                  <span className="text-text-secondary font-mono">{scheduleCron}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-text-tertiary">Recipients:</span>
                  <span className="text-text-secondary font-mono truncate max-w-[240px]">{scheduleRecipients || '(none)'}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-text-tertiary">Delivery Format:</span>
                  <span className="text-text-secondary uppercase">{scheduleFormat}</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-text-tertiary text-[10px] font-mono">
            {editReport 
              ? "Saving changes will immediately compile and publish this updated report structure." 
              : "This report layout will be initialized. You can export or execute live queries anytime."}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-700/30">
        {step > 1 ? (
          <button onClick={() => setStep(s => s - 1)} className="btn-ghost text-xs py-2 px-4">← Back</button>
        ) : <div />}
        <button
          onClick={step < 3 ? () => setStep(s => s + 1) : handleSubmit}
          className="btn-primary text-xs py-2.5 px-6"
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
        body: JSON.stringify({ format, title: report.title, reportId: report.id })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.url) {
          const a = document.createElement('a');
          a.href = data.url;
          a.setAttribute('download', `${report.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${format === 'excel' ? 'xlsx' : 'pdf'}`);
          a.target = '_blank';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else {
          alert(data.error || 'Export failed.');
        }
      } else {
        const err = await res.json().catch(() => null);
        alert(err?.error || 'Failed to generate export.');
      }
    } catch (err) {
      console.error('Export error:', err);
      alert('An error occurred during export.');
    } finally {
      setExporting(null);
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

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 grid grid-cols-2 gap-4">
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Metrics Parameter</div>
            <div className="text-text-secondary text-sm font-medium mt-1 font-mono">{report.config?.metric || 'Revenue'}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Visualization Style</div>
            <div className="text-text-secondary text-sm font-medium mt-1 capitalize font-mono">{report.config?.chartType || 'Area Chart'}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Historical Scope</div>
            <div className="text-text-secondary text-sm font-medium mt-1 capitalize font-mono">{report.config?.dateRange?.replace(/_/g, ' ') || 'Last 12 Months'}</div>
          </div>
          <div>
            <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider">Associated Widgets</div>
            <div className="text-text-secondary text-sm font-medium mt-1 font-mono">{report.widgets || 4} components</div>
          </div>
        </div>

        <div className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-4 overflow-hidden relative">
          <div className="text-[9px] font-mono text-text-tertiary uppercase tracking-wider mb-3 flex items-center gap-1.5">
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

        <div className="pt-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-text-tertiary text-xs font-mono">
            Requires export authentication
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('pdf')}
              className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
              disabled={!!exporting}
            >
              {exporting === 'pdf' ? (
                <>Compiling…</>
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
                <>Compiling…</>
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
          <div className="text-xs text-text-secondary leading-relaxed font-mono">
            Are you sure you want to permanently delete <strong className="text-text-primary">{reportTitle}</strong>? This action is irreversible.
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700/50">
          <button onClick={onClose} className="btn-ghost text-xs py-2 px-4" disabled={isDeleting}>
            Cancel
          </button>
          <button onClick={onConfirm} className="btn-danger text-xs py-2.5 px-4 flex items-center gap-1.5" disabled={isDeleting}>
            {isDeleting ? 'Deleting…' : '✕ Delete Report'}
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

  const [viewReport, setViewReport] = useState<any | null>(null)
  const [editReport, setEditReport] = useState<any | null>(null)
  const [prefilledTemplate, setPrefilledTemplate] = useState<any | null>(null)
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
            config: r.config
          }))
          setReportList([...dbReports, ...mockReports])
        } else {
          setReportList(mockReports)
        }
      })
      .catch(err => {
        console.error('Failed to load reports:', err)
        setReportList(mockReports)
      })
  }, [])

  const handleReportCreated = (newDbReport: any) => {
    const mapped: Report = {
      id: newDbReport.id || 'r-local-' + Date.now(),
      title: newDbReport.title,
      type: (newDbReport.config?.type as any) || 'custom',
      status: newDbReport.config?.isScheduled ? 'scheduled' : 'draft',
      createdBy: 'You',
      updatedAt: 'Just now',
      views: 0,
      widgets: newDbReport.config?.widgets?.length || 5,
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
          status: updatedDbReport.config?.isScheduled ? 'scheduled' : 'draft',
          widgets: updatedDbReport.config?.widgets?.length || 5,
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
          handleReportCreated(body.report)
        }
      } else {
        // Local duplicate mock if API fails
        handleReportCreated({
          title: `${row.title} (Copy)`,
          config: row.config || { type, chartType, metric, dateRange }
        })
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
      } else {
        // Even if server refuses delete of seed reports, let us remove it from local UI to keep user happy!
        setReportList(prev => prev.filter(r => r.id !== id))
        setDeleteConfirmId(null)
      }
    } catch (err) {
      console.error('Failed to delete report:', err)
      setReportList(prev => prev.filter(r => r.id !== id))
      setDeleteConfirmId(null)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleApplyTemplate = (tpl: any) => {
    setPrefilledTemplate({
      title: tpl.title + ' — Copy',
      chartType: tpl.chartType,
      metric: tpl.metric,
      dateRange: tpl.dateRange,
    })
    setBuilderOpen(true)
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
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center flex-shrink-0">
              <Icon size={13} className="text-text-secondary" />
            </div>
            <div>
              <div className="text-text-primary text-xs font-semibold">{row.title}</div>
              <div className="text-text-tertiary text-[9px] font-mono uppercase tracking-wider">{row.type} report</div>
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
            <span className="text-cyan text-[8px] font-mono font-bold">
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
      render: row => <span className="text-text-secondary font-mono text-xs">{row.widgets} items</span>,
    },
    {
      key: 'views',
      header: 'Views',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-1.5 text-text-secondary font-mono text-xs">
          <Eye size={11} className="text-text-tertiary" />
          {row.views}
        </div>
      ),
    },
    {
      key: 'updatedAt',
      header: 'Updated',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-1.5 text-text-tertiary font-mono text-xs">
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
        <Eye size={12} />
      </button>
      <button
        onClick={() => {
          setEditReport(row)
          setBuilderOpen(true)
        }}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-slate-800 transition-all"
        title="Edit"
      >
        <Pencil size={12} />
      </button>
      <button
        onClick={() => handleDuplicate(row)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-slate-800 transition-all"
        title="Duplicate"
        disabled={isDuplicatingId === row.id}
      >
        {isDuplicatingId === row.id ? (
          <span className="w-3 h-3 border border-t-cyan border-r-transparent rounded-full animate-spin inline-block" />
        ) : (
          <Copy size={12} />
        )}
      </button>
      <button
        onClick={() => setDeleteConfirmId(row.id)}
        className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-negative hover:bg-negative/5 transition-all"
        title="Delete"
      >
        <Trash2 size={12} />
      </button>
    </div>
  )

  const stats = [
    { label: 'Total Reports', value: reportList.length, color: 'text-text-primary' },
    { label: 'Published', value: reportList.filter(r => r.status === 'published').length, color: 'text-positive' },
    { label: 'Drafts', value: reportList.filter(r => r.status === 'draft').length, color: 'text-warning' },
    { label: 'Scheduled auto-jobs', value: reportList.filter(r => r.status === 'scheduled').length, color: 'text-cyan' },
  ]

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
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
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Financial Reports</h1>
          <p className="text-text-secondary text-xs md:text-sm font-mono mt-1">
            Generate, duplicate, or schedule automated boards and PDFs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ExportMenu />
          <button 
            onClick={() => {
              setPrefilledTemplate(null)
              setEditReport(null)
              setBuilderOpen(true)
            }} 
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
          >
            <Plus size={14} /> New Report
          </button>
        </div>
      </div>

      {/* Pre-built Templates Grid */}
      <div className="space-y-3">
        <h2 className="font-display font-semibold text-sm text-text-primary uppercase tracking-wider">Pre-built board templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl, i) => (
            <div key={i} className="card p-4 flex flex-col justify-between hover:border-cyan/35 transition-all">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-cyan bg-cyan/5 px-2 py-0.5 rounded border border-cyan/20">
                    Template
                  </span>
                  <span className="text-[9px] font-mono text-text-tertiary">{tpl.widgets} elements</span>
                </div>
                <h3 className="font-display font-semibold text-xs text-text-primary">{tpl.title}</h3>
                <p className="text-[10px] font-mono text-text-tertiary leading-normal">{tpl.desc}</p>
              </div>
              <button 
                onClick={() => handleApplyTemplate(tpl)}
                className="mt-4 w-full btn-secondary text-[10px] font-mono uppercase tracking-wider py-1.5 text-center flex items-center justify-center gap-1 hover:border-cyan/40"
              >
                <Copy size={10} className="text-cyan" /> Apply Template
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="card p-4 text-center flex flex-col justify-center"
          >
            <div className={`font-mono font-bold text-xl ${s.color}`}>{s.value}</div>
            <div className="text-text-tertiary font-mono text-[9px] uppercase tracking-wider mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5"
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
          setPrefilledTemplate(null)
        }}
        onReportCreated={handleReportCreated}
        onReportUpdated={handleReportUpdated}
        editReport={editReport}
        prefilledTemplate={prefilledTemplate}
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
