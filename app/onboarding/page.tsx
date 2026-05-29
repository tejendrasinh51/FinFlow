'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle2, Database, Users, Bell, Rocket, ChevronRight } from 'lucide-react'

const steps = [
  {
    id: 1,
    icon: Database,
    title: 'Connect your data source',
    desc: 'Link your PostgreSQL database, Stripe account, or upload a CSV to get started.',
    content: (
      <div className="space-y-3">
        {[
          { name: 'PostgreSQL',    desc: 'Connect directly to your database', badge: 'Recommended' },
          { name: 'Stripe',        desc: 'Sync payment & subscription data', badge: null },
          { name: 'CSV Upload',    desc: 'Import a spreadsheet or data export', badge: 'Quickest' },
          { name: 'REST API',      desc: 'Push data via our REST ingest API', badge: null },
        ].map(s => (
          <div
            key={s.name}
            className="flex items-center justify-between p-4 bg-elevated border border-[var(--color-border)] rounded-xl hover:border-cyan/30 cursor-pointer transition-all group"
          >
            <div>
              <div className="text-text-primary text-sm font-medium flex items-center gap-2">
                {s.name}
                {s.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan/10 border border-cyan/20 text-cyan">{s.badge}</span>
                )}
              </div>
              <div className="text-text-tertiary text-xs mt-0.5">{s.desc}</div>
            </div>
            <ChevronRight size={15} className="text-text-tertiary group-hover:text-cyan transition-colors" />
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 2,
    icon: Users,
    title: 'Invite your team',
    desc: 'Bring your finance team on board. Assign roles to control who sees what.',
    content: (
      <div className="space-y-4">
        <div>
          <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Email addresses</label>
          <textarea
            className="w-full px-4 py-3 bg-elevated border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/40 transition-all h-28 resize-none"
            placeholder="analyst@company.io&#10;viewer@company.io&#10;cfo@company.io"
          />
          <p className="text-text-tertiary text-xs font-mono mt-1">One email per line</p>
        </div>
        <div>
          <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Default role for new members</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { r: 'viewer',  desc: 'Read-only' },
              { r: 'analyst', desc: 'Can export' },
              { r: 'admin',   desc: 'Full access' },
            ].map(({ r, desc }) => (
              <div key={r} className="p-3 rounded-xl border border-[var(--color-border)] hover:border-cyan/30 cursor-pointer transition-all text-center">
                <div className="text-text-primary text-xs font-medium capitalize">{r}</div>
                <div className="text-text-tertiary text-[10px] mt-0.5">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  },
  {
    id: 3,
    icon: Bell,
    title: 'Configure metric alerts',
    desc: 'Set thresholds so your team is notified instantly when metrics cross key boundaries.',
    content: (
      <div className="space-y-4">
        {[
          { metric: 'Churn Rate',    threshold: '>3%',    channel: 'Slack + Email', active: true },
          { metric: 'MRR Growth',    threshold: '<5% MoM', channel: 'Email',        active: true },
          { metric: 'Cashflow',      threshold: '<$50K net',channel: 'Slack',       active: false },
          { metric: 'DAU Drop',      threshold: '>15% WoW', channel: 'Email',       active: false },
        ].map(alert => (
          <div key={alert.metric} className="flex items-center justify-between p-4 bg-elevated border border-[var(--color-border)] rounded-xl">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full flex-shrink-0 ${alert.active ? 'bg-positive' : 'bg-elevated border border-[var(--color-border-strong)]'}`} />
              <div>
                <div className="text-text-primary text-sm font-medium">{alert.metric}</div>
                <div className="text-text-tertiary text-[10px] font-mono">Threshold: {alert.threshold} · {alert.channel}</div>
              </div>
            </div>
            <div className={`relative w-8 h-4 rounded-full transition-all ${alert.active ? 'bg-cyan/70' : 'bg-canvas border border-[var(--color-border)]'}`}>
              <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-all ${alert.active ? 'left-4' : 'left-0.5'}`} />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 4,
    icon: Rocket,
    title: 'Launch your dashboard',
    desc: "You're all set. Your executive dashboard is ready for your team.",
    content: (
      <div className="text-center py-6 space-y-6">
        <div className="w-20 h-20 rounded-full bg-positive/10 border border-positive/30 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} className="text-positive" />
        </div>
        <div>
          <h3 className="font-display font-bold text-xl text-text-primary mb-2">Setup complete!</h3>
          <p className="text-text-secondary text-sm max-w-sm mx-auto leading-relaxed">
            Your FinFlow dashboard is configured and ready. Real-time data will start flowing as soon as your data source is connected.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3 text-sm text-text-secondary">
          {['Data source connected', '3 team members invited', '2 alerts configured'].map(s => (
            <div key={s} className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-positive" /> {s}
            </div>
          ))}
        </div>
      </div>
    ),
  },
]

export default function OnboardingPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const currentStep = steps[step - 1]

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center p-6 relative overflow-hidden">
      <div className="hero-grid opacity-20 absolute inset-0" />
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(0,212,255,0.05), transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="font-display font-bold text-xl tracking-tight">FINFLOW <span className="text-text-tertiary font-mono font-normal text-sm">/ ANALYTICS</span></div>
          <p className="text-text-tertiary text-sm font-mono mt-1">Setup wizard · Step {step} of {steps.length}</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-8">
          {steps.map(s => (
            <div
              key={s.id}
              className="flex-1 h-1 rounded-full overflow-hidden bg-elevated"
            >
              <motion.div
                className="h-full rounded-full bg-cyan"
                initial={{ width: 0 }}
                animate={{ width: step >= s.id ? '100%' : '0%' }}
                transition={{ duration: 0.4 }}
              />
            </div>
          ))}
        </div>

        {/* Step card */}
        <div className="card p-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent" />

          {/* Step header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 border border-cyan/25 flex items-center justify-center flex-shrink-0">
              <currentStep.icon size={22} className="text-cyan" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary">{currentStep.title}</h2>
              <p className="text-text-secondary text-sm mt-0.5">{currentStep.desc}</p>
            </div>
          </div>

          {/* Step content */}
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep.content}
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-[var(--color-border)]">
            <button
              onClick={() => setStep(s => Math.max(1, s - 1))}
              disabled={step === 1}
              className="btn-ghost text-sm py-2.5 px-5 disabled:opacity-30"
            >
              ← Back
            </button>

            <div className="flex items-center gap-1">
              {steps.map(s => (
                <div
                  key={s.id}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${s.id === step ? 'bg-cyan w-4' : s.id < step ? 'bg-positive' : 'bg-elevated border border-[var(--color-border)]'}`}
                />
              ))}
            </div>

            {step < steps.length ? (
              <button
                onClick={() => setStep(s => Math.min(steps.length, s + 1))}
                className="btn-primary text-sm py-2.5 px-6"
              >
                Continue →
              </button>
            ) : (
              <button
                onClick={() => router.push('/dashboard')}
                className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2"
              >
                <Rocket size={15} /> Launch Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Skip */}
        <div className="text-center mt-5">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-text-tertiary text-sm hover:text-text-secondary transition-colors font-mono"
          >
            Skip setup → go to dashboard
          </button>
        </div>
      </div>
    </div>
  )
}
