'use client'

import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'

const techItems = [
  {
    category: 'Frontend',
    color: '#00D4FF',
    items: [
      { name: 'Next.js 14', desc: 'App Router · RSC · SSR/ISG' },
      { name: 'TypeScript', desc: 'Full type safety end-to-end' },
      { name: 'Tailwind CSS', desc: 'Utility-first design system' },
      { name: 'Framer Motion', desc: 'Production-grade animations' },
      { name: 'Recharts', desc: 'Responsive data visualisation' },
      { name: 'TanStack Table', desc: 'Virtualised 100K+ rows' },
    ],
  },
  {
    category: 'Backend & API',
    color: '#10B981',
    items: [
      { name: 'PostgreSQL 16', desc: 'Primary datastore + RLS' },
      { name: 'Redis 7', desc: 'Cache · pub/sub · sessions' },
      { name: 'WebSocket (ws)', desc: 'Real-time bidirectional push' },
      { name: 'JWT RS256', desc: '15-min tokens + refresh' },
      { name: 'Zod', desc: 'Schema validation on all inputs' },
      { name: 'Next.js API Routes', desc: 'Type-safe route handlers' },
    ],
  },
  {
    category: 'Infrastructure',
    color: '#F59E0B',
    items: [
      { name: 'AWS ECS Fargate', desc: 'Containerised · auto-scale 2–20' },
      { name: 'AWS RDS', desc: 'Multi-AZ PostgreSQL cluster' },
      { name: 'AWS ElastiCache', desc: 'Managed Redis cluster' },
      { name: 'AWS S3', desc: 'Export storage + audit logs' },
      { name: 'AWS CloudFront', desc: 'CDN + WAF + custom cache' },
      { name: 'Terraform', desc: 'IaC for all AWS resources' },
    ],
  },
]

export function TechStack() {
  return (
    <section id="tech-stack" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-6 justify-center">Tech Stack</div>
            <h2 className="text-h2 mb-4">
              Built on{' '}
              <span className="gradient-text">enterprise-grade</span> foundations.
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Every technology choice made for performance, reliability, and security at scale.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {techItems.map((category, ci) => (
            <FadeIn key={category.category} direction="up" delay={ci * 0.12}>
              <div className="card p-6 h-full">
                <div
                  className="font-mono text-xs font-medium uppercase tracking-widest mb-5 pb-4 border-b border-[var(--color-border)]"
                  style={{ color: category.color }}
                >
                  {category.category}
                </div>
                <div className="space-y-3">
                  {category.items.map((item, i) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.05 * i + ci * 0.1 }}
                      className="flex items-start gap-3 group"
                    >
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0 transition-all group-hover:scale-150"
                        style={{ background: category.color }}
                      />
                      <div>
                        <div className="text-text-primary text-sm font-medium">{item.name}</div>
                        <div className="text-text-tertiary text-xs font-mono mt-0.5">{item.desc}</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>

        {/* Architecture summary */}
        <FadeIn direction="up" delay={0.4}>
          <div className="mt-8 card p-6 relative overflow-hidden">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 50% 50%, rgba(0,212,255,0.04), transparent 70%)',
              }}
            />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-4 text-center md:text-left">
              <div className="flex-1">
                <div className="section-label mb-2">Architecture Summary</div>
                <p className="text-text-secondary text-sm leading-relaxed">
                  Data Source → PostgreSQL trigger → pg_notify → Node listener
                  → Redis pub/sub publish → WebSocket server broadcasts
                  → Connected browser clients update UI{' '}
                  <strong className="text-text-primary">(no full re-render)</strong>
                </p>
              </div>
              <div className="flex-shrink-0">
                <div className="font-mono text-xs text-text-tertiary space-y-1">
                  <div className="text-cyan font-medium">End-to-end latency</div>
                  <div className="text-3xl font-medium text-text-primary">&lt;200ms</div>
                </div>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
