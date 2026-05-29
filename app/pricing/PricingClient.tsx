'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import { CheckCircle2, X, Zap, Building2, Rocket } from 'lucide-react'

const plans = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Rocket,
    desc: 'Perfect for early-stage fintech teams getting their data house in order.',
    monthlyPrice: 149,
    annualPrice: 99,
    color: 'var(--color-text-secondary)',
    border: 'border-[var(--color-border)]',
    cta: 'Start free trial',
    ctaStyle: 'btn-ghost',
    popular: false,
    features: [
      { text: 'Up to 3 users',              included: true },
      { text: '5 saved reports',            included: true },
      { text: 'Core metric dashboards',     included: true },
      { text: 'CSV export',                 included: true },
      { text: '7-day data retention',       included: true },
      { text: 'Email support',              included: true },
      { text: 'Real-time WebSocket data',   included: false },
      { text: 'Role-based access control',  included: false },
      { text: 'PDF & Excel export',         included: false },
      { text: 'API access',                 included: false },
      { text: 'Custom integrations',        included: false },
      { text: 'SLA guarantee',              included: false },
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: Zap,
    desc: 'For scaling teams that need real-time data and full collaboration features.',
    monthlyPrice: 499,
    annualPrice: 349,
    color: 'var(--color-cyan)',
    border: 'border-cyan/40',
    cta: 'Start free trial',
    ctaStyle: 'btn-primary',
    popular: true,
    features: [
      { text: 'Up to 15 users',             included: true },
      { text: 'Unlimited reports',          included: true },
      { text: 'All metric dashboards',      included: true },
      { text: 'CSV, PDF & Excel export',    included: true },
      { text: '12-month data retention',    included: true },
      { text: 'Priority email support',     included: true },
      { text: 'Real-time WebSocket data',   included: true },
      { text: 'Role-based access control',  included: true },
      { text: 'PDF & Excel export',         included: true },
      { text: 'API access (10K req/mo)',    included: true },
      { text: 'Custom integrations',        included: false },
      { text: 'SLA guarantee',              included: false },
    ],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Building2,
    desc: 'Built for enterprise fintech with custom SLAs, unlimited scale, and dedicated support.',
    monthlyPrice: null,
    annualPrice: null,
    color: 'var(--color-positive)',
    border: 'border-positive/30',
    cta: 'Contact sales',
    ctaStyle: 'btn-secondary',
    popular: false,
    features: [
      { text: 'Unlimited users',            included: true },
      { text: 'Unlimited reports',          included: true },
      { text: 'All metric dashboards',      included: true },
      { text: 'CSV, PDF & Excel export',    included: true },
      { text: 'Unlimited data retention',   included: true },
      { text: 'Dedicated account manager',  included: true },
      { text: 'Real-time WebSocket data',   included: true },
      { text: 'Role-based access control',  included: true },
      { text: 'PDF & Excel export',         included: true },
      { text: 'Unlimited API access',       included: true },
      { text: 'Custom integrations',        included: true },
      { text: '99.9% SLA guarantee',        included: true },
    ],
  },
]

const comparisonRows = [
  { feature: 'Users',               starter: '3',        growth: '15',       enterprise: 'Unlimited' },
  { feature: 'Saved reports',       starter: '5',        growth: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'Data retention',      starter: '7 days',   growth: '12 months', enterprise: 'Unlimited' },
  { feature: 'API requests / mo',   starter: '—',        growth: '10,000',   enterprise: 'Unlimited' },
  { feature: 'Real-time WebSocket', starter: '✗',        growth: '✓',        enterprise: '✓' },
  { feature: 'RBAC',                starter: '✗',        growth: '✓',        enterprise: '✓' },
  { feature: 'PDF export',          starter: '✗',        growth: '✓',        enterprise: '✓' },
  { feature: 'Custom integrations', starter: '✗',        growth: '✗',        enterprise: '✓' },
  { feature: 'SLA',                 starter: '—',        growth: '99.5%',    enterprise: '99.9%' },
  { feature: 'Support',             starter: 'Email',    growth: 'Priority', enterprise: 'Dedicated CSM' },
]

export default function PricingClient() {
  const [annual, setAnnual] = useState(true)

  return (
    <div className="pt-28 pb-32 relative overflow-hidden">
      {/* Background */}
      <div className="hero-grid opacity-30 absolute inset-0" />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 60% 30% at 50% 0%, rgba(0,212,255,0.07), transparent 60%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {/* Header */}
        <FadeIn>
          <div className="text-center mb-14">
            <div className="section-label mb-6 justify-center">Pricing</div>
            <h1 className="text-display mb-4">
              Simple, transparent{' '}
              <span className="gradient-text">pricing.</span>
            </h1>
            <p className="text-text-secondary text-xl max-w-xl mx-auto">
              No hidden fees. No usage surprises. Scale as your team grows.
            </p>

            {/* Toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <span className={`text-sm font-medium ${!annual ? 'text-text-primary' : 'text-text-tertiary'}`}>Monthly</span>
              <button
                onClick={() => setAnnual(!annual)}
                className={`relative w-12 h-6 rounded-full transition-all ${annual ? 'bg-cyan/70' : 'bg-elevated border border-[var(--color-border)]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${annual ? 'left-7' : 'left-1'}`} />
              </button>
              <span className={`text-sm font-medium ${annual ? 'text-text-primary' : 'text-text-tertiary'}`}>
                Annual
              </span>
              <span className="text-xs font-mono bg-positive/10 border border-positive/20 text-positive px-2 py-0.5 rounded-full">
                Save up to 30%
              </span>
            </div>
          </div>
        </FadeIn>

        {/* Plan cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {plans.map((plan, i) => (
            <FadeIn key={plan.id} direction="up" delay={i * 0.1}>
              <motion.div
                whileHover={{ y: -4 }}
                className={`card p-8 relative h-full flex flex-col ${plan.popular ? 'border-cyan/40 shadow-cyan-md' : ''}`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-cyan text-canvas text-xs font-mono font-medium px-3 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                {/* Plan header */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${plan.color}15`, border: `1px solid ${plan.color}30` }}
                  >
                    <plan.icon size={18} style={{ color: plan.color }} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-lg">{plan.name}</h2>
                  </div>
                </div>

                <p className="text-text-secondary text-sm leading-relaxed mb-6">{plan.desc}</p>

                {/* Price */}
                <div className="mb-6">
                  {plan.monthlyPrice ? (
                    <>
                      <div className="flex items-baseline gap-1">
                        <span className="font-mono font-bold text-4xl text-text-primary">
                          ${annual ? plan.annualPrice : plan.monthlyPrice}
                        </span>
                        <span className="text-text-tertiary text-sm font-mono">/mo</span>
                      </div>
                      {annual && (
                        <p className="text-text-tertiary text-xs font-mono mt-1">
                          Billed annually (${plan.annualPrice! * 12}/yr)
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="font-display font-bold text-3xl text-text-primary">Custom pricing</div>
                  )}
                </div>

                <a
                  href={plan.id === 'enterprise' ? '#contact' : '/login'}
                  className={`${plan.ctaStyle} text-sm py-3 justify-center mb-8`}
                >
                  {plan.cta}
                </a>

                {/* Features */}
                <div className="flex-1 space-y-2.5">
                  {plan.features.map(f => (
                    <div key={f.text} className="flex items-center gap-2.5">
                      {f.included
                        ? <CheckCircle2 size={14} className="text-positive flex-shrink-0" />
                        : <X size={14} className="text-text-tertiary flex-shrink-0" />
                      }
                      <span className={`text-sm ${f.included ? 'text-text-secondary' : 'text-text-tertiary'}`}>
                        {f.text}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </FadeIn>
          ))}
        </div>

        {/* Comparison table */}
        <FadeIn direction="up" delay={0.3}>
          <div className="card overflow-hidden">
            <div className="px-8 py-6 border-b border-[var(--color-border)]">
              <h2 className="font-display font-semibold text-xl">Full feature comparison</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-elevated">
                    <th className="text-left data-table-header px-8 py-4 w-1/3">Feature</th>
                    {plans.map(p => (
                      <th key={p.id} className="data-table-header px-6 py-4 text-center">{p.name}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {comparisonRows.map(row => (
                    <tr key={row.feature} className="data-table-row">
                      <td className="px-8 py-3.5 text-text-secondary">{row.feature}</td>
                      {[row.starter, row.growth, row.enterprise].map((val, i) => (
                        <td key={i} className="px-6 py-3.5 text-center">
                          {val === '✓' ? <CheckCircle2 size={15} className="text-positive mx-auto" /> :
                           val === '✗' ? <X size={15} className="text-text-tertiary mx-auto" /> :
                           <span className={`${i === 1 ? 'text-cyan' : i === 2 ? 'text-positive' : 'text-text-secondary'}`}>{val}</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </FadeIn>

        {/* FAQ / CTA */}
        <FadeIn direction="up" delay={0.4}>
          <div className="text-center mt-20">
            <h2 className="text-h2 mb-4">Still have questions?</h2>
            <p className="text-text-secondary text-lg mb-8">
              Our team is happy to walk you through the right plan for your scale.
            </p>
            <div className="flex items-center justify-center gap-4">
              <a href="#contact" className="btn-primary text-base py-3.5 px-10">Talk to sales →</a>
              <a href="/login" className="btn-ghost text-base py-3.5 px-10">Start free trial</a>
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  )
}
