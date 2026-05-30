'use client'

import { KPICard } from './KPICard'

interface KPIGridProps {
  liveValues?: Record<string, number>
  loading?: boolean
}

export function KPIGrid({ liveValues = {}, loading = false }: KPIGridProps) {
  // Format live values if they exist
  const liveMRR = liveValues['mrr'] !== undefined ? liveValues['mrr'] : 284500
  const liveARR = liveValues['arr'] !== undefined ? liveValues['arr'] : 3414000
  const liveChurn = liveValues['churn'] !== undefined ? liveValues['churn'] : 1.82
  const liveDAU = liveValues['dau'] !== undefined ? liveValues['dau'] : 42150

  const kpis = [
    {
      title: 'Monthly Recurring Revenue (MRR)',
      value: liveMRR >= 1000000 ? (liveMRR / 1000000).toFixed(2) + 'M' : Math.round(liveMRR).toLocaleString(),
      prefix: '$',
      trend: 12.4,
      trendLabel: 'vs last month',
      sparkData: [210, 220, 235, 250, 245, 260, 275, 270, liveMRR / 1000],
      benchmark: '$250k standard',
      benchmarkLabel: 'Target',
      accentColor: '#10B981', // Emerald
      badge: 'SaaS Core',
    },
    {
      title: 'Annual Recurring Revenue (ARR)',
      value: liveARR >= 1000000 ? (liveARR / 1000000).toFixed(2) + 'M' : Math.round(liveARR).toLocaleString(),
      prefix: '$',
      trend: 14.8,
      trendLabel: 'vs last quarter',
      sparkData: [2.5, 2.6, 2.8, 3.0, 2.9, 3.1, 3.3, 3.2, liveARR / 1000000],
      benchmark: 'Top 10% SaaS',
      benchmarkLabel: 'Cohort Tier',
      accentColor: '#3B82F6', // Blue
      badge: 'Scale',
    },
    {
      title: 'Net Revenue Retention (NRR)',
      value: '114.2',
      suffix: '%',
      trend: 2.1,
      trendLabel: 'vs last month',
      sparkData: [111, 112, 112, 113, 113.5, 114, 113.8, 114.2],
      benchmark: '>110% VC standard',
      benchmarkLabel: 'Health',
      accentColor: '#8B5CF6', // Purple
      badge: 'Retention',
    },
    {
      title: 'Gross Margin',
      value: '78.5',
      suffix: '%',
      trend: -0.4,
      trendLabel: 'vs last month',
      sparkData: [79.2, 79.0, 78.8, 78.9, 78.7, 78.5],
      benchmark: '80% target',
      benchmarkLabel: 'Target',
      accentColor: '#F59E0B', // Amber
      badge: 'Profitability',
    },
    {
      title: 'Customer Lifetime Value (LTV)',
      value: '14,850',
      prefix: '$',
      trend: 8.3,
      trendLabel: 'vs last quarter',
      sparkData: [13.2, 13.5, 13.9, 14.2, 14.5, 14.85],
      benchmark: '4.5x CAC',
      benchmarkLabel: 'Efficiency',
      accentColor: '#EC4899', // Pink
      badge: 'Unit Econ',
    },
    {
      title: 'Customer Acquisition Cost (CAC)',
      value: '3,240',
      prefix: '$',
      trend: -5.2,
      trendLabel: 'vs last quarter',
      sparkData: [3.5, 3.45, 3.4, 3.32, 3.28, 3.24],
      benchmark: '<$3,500 budget',
      benchmarkLabel: 'Budget',
      accentColor: '#EF4444', // Red
      badge: 'Acquisition',
    },
    {
      title: 'Logo Churn Rate',
      value: liveChurn.toFixed(2),
      suffix: '%',
      trend: -12.5,
      trendLabel: 'vs last month',
      sparkData: [2.2, 2.1, 2.0, 1.95, 1.9, liveChurn],
      benchmark: '<2% best practice',
      benchmarkLabel: 'Standard',
      accentColor: '#06B6D4', // Cyan
      badge: 'Risk',
    },
    {
      title: 'Daily Active Users (DAU)',
      value: Math.round(liveDAU).toLocaleString(),
      trend: 18.2,
      trendLabel: 'vs last month',
      sparkData: [32, 34, 35, 38, 37, 40, 41, liveDAU / 1000],
      benchmark: '62% DAU/MAU',
      benchmarkLabel: 'Engagement',
      accentColor: '#6366F1', // Indigo
      badge: 'Usage',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, idx) => (
        <KPICard key={idx} {...kpi} loading={loading} />
      ))}
    </div>
  )
}
