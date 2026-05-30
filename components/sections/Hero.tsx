'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ArrowRight, Play } from 'lucide-react'

function scrollToSection(id: string) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function LiveBadge() {
  const [count, setCount] = useState(10247)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3) - 1)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.5 }}
      className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-[var(--color-border-strong)] bg-surface/80 backdrop-blur-sm text-sm"
    >
      <span className="live-dot"></span>
      <span className="text-positive font-mono font-medium">LIVE</span>
      <span className="text-text-secondary font-mono">
        {count.toLocaleString()} Active Sessions Today
      </span>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-0 overflow-hidden"
    >
      {/* Animated grid background */}
      <div className="hero-grid" aria-hidden />

      {/* Radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 40% at 50% -10%, rgba(0,212,255,0.08) 0%, transparent 60%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <LiveBadge />

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-display mt-8 mb-6"
        >
          Real-time financial
          <br />
          intelligence for{' '}
          <span className="gradient-text">10K+ teams.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10"
        >
          Fragmented data → unified executive view. Replace 7 disconnected tools with
          one real-time analytics platform.{' '}
          <strong className="text-text-primary">60% faster reporting.</strong>{' '}
          <strong className="text-text-primary">99.9% uptime.</strong>
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <a
            href="#demo"
            onClick={(e) => { e.preventDefault(); scrollToSection('#demo') }}
            className="btn-primary text-base py-3 px-8"
          >
            Request Demo <ArrowRight size={18} />
          </a>
          <a
            href="#results"
            onClick={(e) => { e.preventDefault(); scrollToSection('#results') }}
            className="btn-secondary text-base py-3 px-8"
          >
            <Play size={16} />
            View Case Study ↓
          </a>
        </motion.div>

        {/* Trust signals */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.6 }}
          className="mt-12 flex items-center justify-center gap-8 flex-wrap"
        >
          {[
            { value: '10K+', label: 'Daily Active Users' },
            { value: '99.9%', label: 'SLA Uptime' },
            { value: '−60%', label: 'Report Time' },
            { value: '< 80ms', label: 'API Latency' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-mono font-medium text-cyan text-lg">{stat.value}</div>
              <div className="text-text-tertiary text-xs mt-0.5">{stat.label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-6xl mx-auto px-6 mt-16"
      >
        {/* Browser chrome */}
        <div className="rounded-xl border border-[var(--color-border-strong)] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.6)]">
          {/* Chrome bar */}
          <div className="bg-surface border-b border-[var(--color-border)] px-4 py-3 flex items-center gap-3">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-negative/60"></div>
              <div className="w-3 h-3 rounded-full bg-warning/60"></div>
              <div className="w-3 h-3 rounded-full bg-positive/60"></div>
            </div>
            <div className="flex-1 h-6 bg-elevated rounded-md flex items-center justify-center">
              <span className="text-text-tertiary font-mono text-xs">finflow.io/dashboard</span>
            </div>
          </div>

          {/* Dashboard content mockup */}
          <DashboardMockup />
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, transparent, var(--color-bg-canvas))',
          }}
        />
      </motion.div>
    </section>
  )
}

function DashboardMockup() {
  const metrics = [
    { label: 'MRR', value: '$1.24M', trend: '+12.4%', positive: true },
    { label: 'ARR', value: '$14.9M', trend: '+8.2%', positive: true },
    { label: 'Churn', value: '2.1%', trend: '−0.3pp', positive: true },
    { label: 'DAU', value: '10,247', trend: '+18.6%', positive: true },
  ]

  return (
    <div className="bg-canvas p-6 min-h-[380px]">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center">
            <div className="w-3 h-3 bg-cyan rounded-sm"></div>
          </div>
          <span className="font-display font-bold text-sm">FinFlow Analytics</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-7 w-40 skeleton rounded-md"></div>
          <div className="h-7 w-7 skeleton rounded-full"></div>
          <div className="h-7 w-24 bg-cyan/10 border border-cyan/20 rounded-md flex items-center justify-center">
            <span className="text-cyan font-mono text-xs">Export</span>
          </div>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Sidebar mockup */}
        <div className="w-32 flex-shrink-0 space-y-1">
          {['Overview', 'Finance', 'Reports', 'Users', 'Settings'].map((item, i) => (
            <div
              key={item}
              className={`px-2 py-1.5 rounded text-xs font-mono ${
                i === 0
                  ? 'bg-cyan/10 text-cyan border-l-2 border-cyan'
                  : 'text-text-tertiary'
              }`}
            >
              {item}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 space-y-4">
          {/* Metric cards */}
          <div className="grid grid-cols-4 gap-3">
            {metrics.map((m) => (
              <div
                key={m.label}
                className="metric-card card p-3"
              >
                <div className="text-text-tertiary text-[10px] font-mono mb-1">{m.label}</div>
                <div className="text-text-primary font-mono font-medium text-sm">{m.value}</div>
                <div
                  className="text-[10px] font-mono mt-0.5"
                  style={{ color: 'var(--color-positive)' }}
                >
                  ↑ {m.trend}
                </div>
                <div className="mt-2 h-6 flex items-end gap-px">
                  {[3,5,4,6,5,7,6,8,7,9,8,10,9,11].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm opacity-70"
                      style={{
                        height: `${h * 5}%`,
                        background: 'var(--color-cyan)',
                        minWidth: '2px',
                      }}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Chart area */}
          <div className="card p-4 h-36 flex items-center justify-center">
            <div className="w-full h-full flex items-end gap-1">
              {[20,30,25,40,35,55,50,65,60,75,70,88].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col justify-end">
                  <div
                    className="rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      background: `linear-gradient(to top, rgba(0,212,255,0.6), rgba(0,212,255,0.1))`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
