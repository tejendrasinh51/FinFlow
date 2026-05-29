'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import { FadeIn } from '@/components/motion/FadeIn'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from 'recharts'

function useCounter(target: number, duration = 2000, inView = false) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target, duration, inView])

  return value
}

const stats = [
  { value: 10000, suffix: '+', label: 'Daily Active Users', format: 'number' },
  { value: 99.9, suffix: '%', label: 'SLA Uptime', format: 'decimal' },
  { value: 60, prefix: '−', suffix: '%', label: 'Reporting Time Saved', format: 'number' },
  { value: 3, suffix: ' mins', label: 'Avg Session Duration', format: 'number' },
]

const dauData = [
  { month: 'Jan', dau: 340 },
  { month: 'Feb', dau: 890 },
  { month: 'Mar', dau: 1620 },
  { month: 'Apr', dau: 2890 },
  { month: 'May', dau: 4200 },
  { month: 'Jun', dau: 5800 },
  { month: 'Jul', dau: 6900 },
  { month: 'Aug', dau: 7800 },
  { month: 'Sep', dau: 8600 },
  { month: 'Oct', dau: 9200 },
  { month: 'Nov', dau: 9800 },
  { month: 'Dec', dau: 10247 },
]

function StatCard({ stat, inView }: { stat: typeof stats[0]; inView: boolean }) {
  const counted = useCounter(stat.value, 2000, inView)

  const display =
    stat.format === 'decimal'
      ? `${stat.prefix ?? ''}${stat.value.toFixed(1)}${stat.suffix}`
      : `${stat.prefix ?? ''}${counted.toLocaleString()}${stat.suffix}`

  return (
    <div className="metric-card card p-6 text-center">
      <div
        className="font-mono font-medium text-3xl md:text-4xl mb-2"
        style={{ color: 'var(--color-cyan)' }}
      >
        {display}
      </div>
      <div className="text-text-secondary text-sm">{stat.label}</div>
    </div>
  )
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div
        className="p-3 rounded-lg border font-mono text-sm"
        style={{
          background: 'var(--color-bg-overlay)',
          borderColor: 'var(--color-border-strong)',
        }}
      >
        <div className="text-text-secondary mb-1">{label}</div>
        <div className="text-cyan font-medium">
          {payload[0].value.toLocaleString()} DAU
        </div>
      </div>
    )
  }
  return null
}

export function Results() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="results" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6" ref={ref}>
        <FadeIn>
          <div className="text-center mb-16">
            <div className="section-label mb-6 justify-center">Results</div>
            <h2 className="text-h2 mb-4">
              Measurable impact,{' '}
              <span className="gradient-text">from day one.</span>
            </h2>
            <p className="text-text-secondary text-lg max-w-xl mx-auto">
              Six months post-launch metrics speak louder than promises.
            </p>
          </div>
        </FadeIn>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {stats.map((stat, i) => (
            <FadeIn key={stat.label} direction="up" delay={i * 0.1}>
              <StatCard stat={stat} inView={inView} />
            </FadeIn>
          ))}
        </div>

        {/* Area chart */}
        <FadeIn direction="up" delay={0.3}>
          <div className="card p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <div className="section-label mb-2">DAU Growth — 6 Months Post-Launch</div>
                <h3 className="font-display font-semibold text-xl">
                  0 → 10,247 daily active users
                </h3>
              </div>
              <div className="flex items-center gap-2 text-positive font-mono text-sm">
                <span className="live-dot"></span>
                <span>Live</span>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={dauData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.03)"
                  vertical={false}
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(v) => v >= 1000 ? `${(v/1000).toFixed(0)}K` : v}
                  tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="dau"
                  stroke="#00D4FF"
                  strokeWidth={2}
                  fill="url(#dauGradient)"
                  dot={false}
                  activeDot={{ r: 5, fill: '#00D4FF', strokeWidth: 0 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
