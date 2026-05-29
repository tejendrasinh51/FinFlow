'use client'

import { motion } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import { AlertTriangle, Clock, Shield, Eye } from 'lucide-react'

const painPoints = [
  {
    num: '01',
    icon: AlertTriangle,
    title: '7 disconnected tools',
    desc: 'Accounting software, payments processor, spreadsheet exports, and three internal databases — all isolated.',
    color: 'var(--color-negative)',
  },
  {
    num: '02',
    icon: Clock,
    title: '3–4h reporting cycle',
    desc: 'Every executive report required manual data assembly across multiple systems and painful reconciliation.',
    color: 'var(--color-warning)',
  },
  {
    num: '03',
    icon: Shield,
    title: 'No access control',
    desc: 'No safe way to delegate reporting without exposing the entire financial dataset to every analyst.',
    color: 'var(--color-negative)',
  },
  {
    num: '04',
    icon: Eye,
    title: 'Zero real-time visibility',
    desc: 'Data was always stale — 24–48 hour lags meant decision-makers operated on yesterday\'s numbers.',
    color: 'var(--color-warning)',
  },
]

export function TheChallenge() {
  return (
    <section id="challenge" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Pain points */}
          <div>
            <FadeIn direction="left">
              <div className="section-label mb-6">The Challenge</div>
              <h2 className="text-h2 mb-4">
                Fragmented data.{' '}
                <span className="gradient-text">No unified view.</span>
              </h2>
              <p className="text-text-secondary text-lg leading-relaxed mb-12">
                The client's financial data was scattered across 7 disconnected tools with no
                single source of truth, no real-time visibility, and no way to delegate
                reporting safely.
              </p>
            </FadeIn>

            <div className="space-y-6">
              {painPoints.map((point, i) => (
                <FadeIn key={point.num} direction="left" delay={0.1 * i}>
                  <div className="flex gap-5 group">
                    <div className="flex-shrink-0">
                      <span
                        className="font-mono text-sm font-medium"
                        style={{ color: point.color }}
                      >
                        {point.num}
                      </span>
                    </div>
                    <div className="flex-1 pb-6 border-b border-[var(--color-border)] last:border-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <point.icon size={15} style={{ color: point.color }} />
                        <h3 className="font-display font-semibold text-text-primary text-base">
                          {point.title}
                        </h3>
                      </div>
                      <p className="text-text-secondary text-sm leading-relaxed">
                        {point.desc}
                      </p>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Right: Fragmented tools diagram */}
          <FadeIn direction="right" delay={0.2}>
            <div className="relative">
              <div className="card p-8 relative overflow-hidden">
                <div className="section-label mb-6 text-negative" style={{ color: 'var(--color-negative)' }}>
                  Before FinFlow
                </div>

                {/* Tool boxes */}
                <div className="grid grid-cols-3 gap-3 mb-8">
                  {[
                    'Accounting SW', 'Payment Proc.', 'Spreadsheets',
                    'Internal DB 1', 'Internal DB 2', 'Internal DB 3',
                    'CRM Data', '', '',
                  ].map((tool, i) => (
                    tool ? (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.07 }}
                        viewport={{ once: true }}
                        className="bg-elevated border border-[var(--color-border)] rounded-lg p-2.5 text-center"
                      >
                        <div className="w-6 h-6 rounded bg-negative/10 border border-negative/20 mx-auto mb-1.5 flex items-center justify-center">
                          <div className="w-2 h-2 rounded-sm bg-negative/60"></div>
                        </div>
                        <span className="text-text-tertiary text-[10px] font-mono">{tool}</span>
                      </motion.div>
                    ) : <div key={i} />
                  ))}
                </div>

                {/* Chaos arrows */}
                <div className="text-center py-4">
                  <div className="text-negative font-mono text-2xl mb-2">⚡ 3–4 hours</div>
                  <div className="text-text-tertiary text-sm">to produce a single report</div>
                </div>

                {/* Confused exec */}
                <div className="flex items-center gap-3 p-3 bg-warning/5 border border-warning/20 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-warning/10 border border-warning/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-warning text-lg">😤</span>
                  </div>
                  <div>
                    <div className="text-warning text-sm font-medium">Executive Review</div>
                    <div className="text-text-tertiary text-xs font-mono">"Which number is correct?"</div>
                  </div>
                </div>

                {/* Background decoration */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 80% 20%, rgba(239,68,68,0.08), transparent 60%)',
                  }}
                />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
