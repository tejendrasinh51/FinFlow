'use client'

import { motion } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import { Database, Users, Download } from 'lucide-react'

const steps = [
  {
    num: '01',
    icon: Database,
    title: 'Unified Data Pipeline',
    desc: 'PostgreSQL → Redis pub/sub → WebSocket → live UI. Every data source feeds into a single, authoritative stream with sub-200ms end-to-end latency.',
    tags: ['PostgreSQL', 'Redis pub/sub', 'WebSocket', 'pg_notify'],
    detail: 'Replaced 7 fragmented tools with one real-time data pipeline. PostgreSQL NOTIFY triggers fire on every write, publishing via Redis to connected WebSocket clients — no polling required.',
  },
  {
    num: '02',
    icon: Users,
    title: 'Role-Based Access Control',
    desc: 'Admin / Analyst / Viewer roles with row-level PostgreSQL security. Executives see summaries; analysts get drill-downs; sensitive data is never over-exposed.',
    tags: ['JWT RS256', 'Row-Level Security', 'RBAC', 'Redis sessions'],
    detail: 'Three-tier permission matrix with PostgreSQL row-level security policies. Each role sees only the data they\'re authorized to access at the database level, not just the UI level.',
  },
  {
    num: '03',
    icon: Download,
    title: 'One-Click Export Engine',
    desc: 'PDF, CSV, and Excel exports via async job queue with email delivery. Generate a 10-page financial report in under 8 seconds.',
    tags: ['Puppeteer PDF', 'ExcelJS', 'AWS S3', 'AWS SES'],
    detail: 'Async export jobs queued in Redis with S3 storage and pre-signed download URLs (1hr TTL). SES delivers the download link to the requester\'s inbox automatically.',
  },
]

export function OurSolution() {
  return (
    <section id="features" className="py-32 relative">
      {/* Background glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(0,212,255,0.04) 0%, transparent 70%)',
        }}
      />

      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-20">
            <div className="section-label mb-6 justify-center">Our Solution</div>
            <h2 className="text-h2 mb-4">
              Three pillars of{' '}
              <span className="gradient-text">financial clarity.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-2xl mx-auto">
              A complete replacement for fragmented tooling — built for real-time decision making.
            </p>
          </div>
        </FadeIn>

        <div className="space-y-8">
          {steps.map((step, i) => (
            <FadeIn key={step.num} direction="up" delay={i * 0.15}>
              <motion.div
                whileHover={{ scale: 1.005 }}
                className="card p-8 relative overflow-hidden group"
              >
                {/* Hover glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background: 'radial-gradient(circle at 20% 50%, rgba(0,212,255,0.05), transparent 60%)',
                  }}
                />

                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-[auto_1fr_1fr] gap-8 items-start">
                  {/* Number */}
                  <div className="flex-shrink-0">
                    <span
                      className="font-mono font-medium text-6xl leading-none"
                      style={{
                        color: 'transparent',
                        WebkitTextStroke: '1px rgba(0,212,255,0.3)',
                      }}
                    >
                      {step.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center">
                        <step.icon size={18} className="text-cyan" />
                      </div>
                      <h3 className="font-display font-semibold text-xl text-text-primary">
                        {step.title}
                      </h3>
                    </div>
                    <p className="text-text-secondary leading-relaxed mb-4">{step.desc}</p>
                    <div className="flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <span key={tag} className="tech-tag">{tag}</span>
                      ))}
                    </div>
                  </div>

                  {/* Detail */}
                  <div className="bg-elevated rounded-xl p-5 border border-[var(--color-border)]">
                    <p className="text-text-secondary text-sm leading-relaxed">{step.detail}</p>
                  </div>
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  )
}
