'use client'

import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useRef } from 'react'
import { FadeIn } from '@/components/motion/FadeIn'
import { ArrowRight, Zap, Lock, Download } from 'lucide-react'

const callouts = [
  {
    icon: Zap,
    label: 'Real-time P&L',
    desc: 'Updates in <200ms via WebSocket',
    position: 'top-[15%] left-[-8%]',
  },
  {
    icon: Lock,
    label: 'RBAC Role Selector',
    desc: 'Admin / Analyst / Viewer controls',
    position: 'top-[40%] right-[-10%]',
  },
  {
    icon: Download,
    label: 'One-Click Export',
    desc: 'PDF · CSV · Excel in seconds',
    position: 'bottom-[15%] left-[-6%]',
  },
]

export function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const y = useTransform(scrollYProgress, [0, 1], ['0px', '-40px'])

  return (
    <section id="platform" className="py-32 relative overflow-hidden">
      {/* Dark bg */}
      <div className="absolute inset-0 bg-surface" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-6 justify-center">Dashboard Preview</div>
            <h2 className="text-h2 mb-4">
              Everything your team needs,{' '}
              <span className="gradient-text">in one view.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              The unified executive dashboard that replaced seven tools overnight.
            </p>
          </div>
        </FadeIn>

        {/* Screenshot + callouts */}
        <div ref={ref} className="relative max-w-5xl mx-auto">
          <motion.div style={{ y }} className="relative">
            {/* Browser frame */}
            <div className="rounded-2xl border border-[var(--color-border-strong)] overflow-hidden shadow-[0_50px_120px_rgba(0,0,0,0.7)]">
              {/* Chrome bar */}
              <div className="bg-elevated border-b border-[var(--color-border)] px-5 py-3.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-negative/50" />
                  <div className="w-3 h-3 rounded-full bg-warning/50" />
                  <div className="w-3 h-3 rounded-full bg-positive/50" />
                </div>
                <div className="flex-1 h-6 bg-canvas rounded flex items-center justify-center">
                  <span className="text-text-tertiary font-mono text-xs">app.finflow.io/dashboard</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="live-dot" />
                  <span className="text-positive font-mono text-xs">live</span>
                </div>
              </div>

              {/* Dashboard image */}
              <div className="relative bg-canvas">
                <Image
                  src="/dashboard-preview.png"
                  alt="FinFlow Analytics Dashboard showing real-time P&L, MRR/ARR metrics, expense breakdown, and user activity"
                  width={1200}
                  height={700}
                  className="w-full"
                  priority
                  onError={(e) => {
                    // Fallback to inline mockup if image not found
                    e.currentTarget.style.display = 'none'
                  }}
                />
                {/* Fallback inline mockup */}
                <DashboardInlineMockup />
              </div>
            </div>

            {/* Callout labels */}
            {callouts.map((callout) => (
              <motion.div
                key={callout.label}
                initial={{ opacity: 0, x: callout.position.includes('left') ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className={`absolute ${callout.position} hidden lg:block`}
              >
                <div className="card p-3 flex items-center gap-3 min-w-[200px] shadow-cyan-sm">
                  <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
                    <callout.icon size={14} className="text-cyan" />
                  </div>
                  <div>
                    <div className="text-text-primary text-xs font-medium">{callout.label}</div>
                    <div className="text-text-tertiary text-[10px] font-mono mt-0.5">{callout.desc}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA overlay */}
          <FadeIn direction="up" delay={0.4}>
            <div className="mt-12 text-center">
              <a href="#demo" className="btn-primary text-base py-3.5 px-10 inline-flex">
                Try the Demo <ArrowRight size={18} />
              </a>
              <p className="text-text-tertiary text-sm mt-3 font-mono">
                No credit card required · Full-featured sandbox
              </p>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}

function DashboardInlineMockup() {
  return (
    <div className="p-6 min-h-[500px]">
      <div className="flex gap-4 h-full">
        {/* Sidebar */}
        <div className="w-36 flex-shrink-0 space-y-1">
          {['Overview', 'Finance', 'Reports', 'Users', 'Settings'].map((item, i) => (
            <div
              key={item}
              className={`px-3 py-2 rounded-lg text-xs font-mono cursor-pointer transition-colors ${i === 0
                  ? 'bg-cyan/10 text-cyan border-l-2 border-cyan'
                  : 'text-text-tertiary hover:text-text-secondary hover:bg-elevated'
                }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 space-y-4">
          {/* KPI cards */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: 'MRR', value: '$1.24M', trend: '+12.4%' },
              { label: 'ARR', value: '$14.9M', trend: '+8.2%' },
              { label: 'Churn', value: '2.1%', trend: '−0.3pp' },
              { label: 'DAU', value: '10,247', trend: '+18.6%' },
            ].map((m) => (
              <div key={m.label} className="metric-card card p-3">
                <div className="text-text-tertiary text-[10px] font-mono">{m.label}</div>
                <div className="text-text-primary font-mono font-medium text-base my-1">{m.value}</div>
                <div className="text-positive text-[10px] font-mono">↑ {m.trend}</div>
                <div className="mt-2 h-8 flex items-end gap-px">
                  {[40, 55, 45, 65, 55, 72, 65, 80, 70, 88, 78, 95, 85, 100].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${h}%`,
                        background: `rgba(0,212,255,${0.3 + i * 0.04})`,
                        minWidth: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Chart + Donut row */}
          <div className="grid grid-cols-3 gap-3">
            {/* Area chart */}
            <div className="col-span-2 card p-4">
              <div className="text-text-secondary text-xs font-mono mb-3">Revenue — 12 Month Trend</div>
              <div className="h-36 flex items-end gap-1 relative">
                {[28, 32, 38, 35, 45, 42, 55, 58, 62, 70, 75, 88].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end relative">
                    <div
                      className="rounded-t-sm w-full"
                      style={{
                        height: `${h}%`,
                        background: `linear-gradient(to top, rgba(0,212,255,0.7), rgba(0,212,255,0.1))`,
                      }}
                    />
                  </div>
                ))}
                {/* Trend line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <polyline
                    points={[28, 32, 38, 35, 45, 42, 55, 58, 62, 70, 75, 88].map((h, i, arr) =>
                      `${(i / (arr.length - 1)) * 100},${100 - h}`
                    ).join(' ')}
                    fill="none"
                    stroke="rgba(0,212,255,0.8)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </div>
            </div>

            {/* Donut */}
            <div className="card p-4">
              <div className="text-text-secondary text-xs font-mono mb-3">Expense Split</div>
              <div className="flex items-center justify-center h-28">
                <svg viewBox="0 0 80 80" className="w-24 h-24">
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(239,68,68,0.6)" strokeWidth="12" strokeDasharray="75 113" strokeDashoffset="0" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(0,212,255,0.6)" strokeWidth="12" strokeDasharray="50 113" strokeDashoffset="-75" />
                  <circle cx="40" cy="40" r="30" fill="none" stroke="rgba(245,158,11,0.6)" strokeWidth="12" strokeDasharray="38 113" strokeDashoffset="-125" />
                  <text x="40" y="44" textAnchor="middle" fill="#E8EDF5" fontSize="8" fontFamily="JetBrains Mono">Split</text>
                </svg>
              </div>
              <div className="space-y-1">
                {[
                  { c: 'rgba(239,68,68,0.7)', l: 'Payroll', v: '40%' },
                  { c: 'rgba(0,212,255,0.7)', l: 'Infra', v: '27%' },
                  { c: 'rgba(245,158,11,0.7)', l: 'Other', v: '20%' },
                ].map(item => (
                  <div key={item.l} className="flex items-center justify-between text-[10px] font-mono">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full" style={{ background: item.c }} />
                      <span className="text-text-tertiary">{item.l}</span>
                    </div>
                    <span className="text-text-secondary">{item.v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L table */}
          <div className="card p-4">
            <div className="text-text-secondary text-xs font-mono mb-3">P&L Summary — Q4 2026</div>
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  {['Item', 'Oct', 'Nov', 'Dec', 'Total'].map(h => (
                    <th key={h} className="text-left text-text-tertiary py-1.5 pr-4 font-normal">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { item: 'Revenue', oct: '$412K', nov: '$438K', dec: '$486K', total: '$1.34M', color: 'text-positive' },
                  { item: 'Expenses', oct: '$241K', nov: '$258K', dec: '$272K', total: '$771K', color: 'text-negative' },
                  { item: 'Net Profit', oct: '$171K', nov: '$180K', dec: '$214K', total: '$565K', color: 'text-cyan' },
                ].map((row) => (
                  <tr key={row.item} className="data-table-row border-b border-[var(--color-border)] last:border-0">
                    <td className="py-2 pr-4 text-text-secondary">{row.item}</td>
                    <td className={`py-2 pr-4 ${row.color}`}>{row.oct}</td>
                    <td className={`py-2 pr-4 ${row.color}`}>{row.nov}</td>
                    <td className={`py-2 pr-4 ${row.color}`}>{row.dec}</td>
                    <td className={`py-2 font-medium ${row.color}`}>{row.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
