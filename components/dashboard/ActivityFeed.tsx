'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  DollarSign, UserPlus, TrendingDown, TrendingUp,
  AlertTriangle, CheckCircle2, Zap, RefreshCw,
} from 'lucide-react'

type EventType = 'payment' | 'signup' | 'churn' | 'expansion' | 'alert' | 'milestone'

interface FeedEvent {
  id: string
  type: EventType
  title: string
  detail: string
  amount?: string
  time: string
  isNew?: boolean
}

const iconMap: Record<EventType, React.ElementType> = {
  payment: DollarSign,
  signup: UserPlus,
  churn: TrendingDown,
  expansion: TrendingUp,
  alert: AlertTriangle,
  milestone: CheckCircle2,
}

const colorMap: Record<EventType, string> = {
  payment: 'text-positive bg-positive/10 border-positive/20',
  signup: 'text-cyan bg-cyan/10 border-cyan/20',
  churn: 'text-negative bg-negative/10 border-negative/20',
  expansion: 'text-positive bg-positive/10 border-positive/20',
  alert: 'text-warning bg-warning/10 border-warning/20',
  milestone: 'text-cyan bg-cyan/10 border-cyan/20',
}

const seedEvents: FeedEvent[] = [
  { id: 'e1', type: 'milestone', title: 'MRR Milestone Hit', detail: '$2.89M MRR — record high', time: '1m ago' },
  { id: 'e2', type: 'payment', title: 'Enterprise renewal', detail: 'Acme Corp · Annual plan', amount: '+$48,000', time: '3m ago' },
  { id: 'e3', type: 'expansion', title: 'Seat expansion', detail: 'Payflow Inc upgraded from 12→24 seats', amount: '+$1,200 MRR', time: '8m ago' },
  { id: 'e4', type: 'signup', title: 'New trial started', detail: 'Notion Labs — 14-day trial', time: '12m ago' },
  { id: 'e5', type: 'churn', title: 'Churn detected', detail: 'StartupXYZ cancelled · Budget cuts', amount: '−$840 MRR', time: '22m ago' },
  { id: 'e6', type: 'alert', title: 'Churn risk flagged', detail: 'DataCorp has not logged in 14 days', time: '38m ago' },
  { id: 'e7', type: 'payment', title: 'Payment processed', detail: 'FinTech Ltd · Pro plan', amount: '+$2,400', time: '45m ago' },
  { id: 'e8', type: 'signup', title: 'Enterprise inbound', detail: 'Microsoft — 500 seat inquiry', time: '1h ago' },
  { id: 'e9', type: 'expansion', title: 'Plan upgrade', detail: 'DevCorp upgraded Starter → Growth', amount: '+$600 MRR', time: '1h 20m ago' },
  { id: 'e10', type: 'payment', title: 'Stripe webhook', detail: 'Recurring charge processed × 14', amount: '+$28,400', time: '2h ago' },
]

const newEventTemplates: Omit<FeedEvent, 'id' | 'time'>[] = [
  { type: 'payment', title: 'Payment processed', detail: 'Auto-renewal batch · 8 accounts', amount: '+$12,800' },
  { type: 'signup', title: 'Trial signup', detail: 'New company from LinkedIn Ads', isNew: true },
  { type: 'expansion', title: 'Seat upgrade', detail: 'Okta Corp added 6 seats', amount: '+$720 MRR', isNew: true },
  { type: 'alert', title: 'Unusual login', detail: 'admin@enterprise.co · New device', isNew: true },
  { type: 'milestone', title: 'ARR milestone', detail: '$34.7M ARR crossed today', isNew: true },
]

export function ActivityFeed() {
  const [events, setEvents] = useState<FeedEvent[]>(seedEvents)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const interval = setInterval(() => {
      const template = newEventTemplates[Math.floor(Math.random() * newEventTemplates.length)]
      const newEvent: FeedEvent = {
        ...template,
        id: `e-${Date.now()}`,
        time: 'Just now',
        isNew: true,
      }
      setEvents(prev => {
        const updated = [newEvent, ...prev.slice(0, 14)]
        return updated
      })
      // Clear isNew after 2s
      setTimeout(() => {
        setEvents(prev => prev.map(e => e.id === newEvent.id ? { ...e, isNew: false } : e))
      }, 2000)
    }, 6000)
    return () => clearInterval(interval)
  }, [paused])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="font-display font-semibold text-sm text-text-primary">Live Activity</h3>
          <span className="live-dot" />
          <span className="text-[9px] font-mono text-positive">LIVE</span>
        </div>
        <button
          onClick={() => setPaused(p => !p)}
          className="flex items-center gap-1.5 text-[10px] font-mono text-text-tertiary hover:text-text-secondary transition-colors"
        >
          {paused ? <Zap size={10} /> : <RefreshCw size={10} />}
          {paused ? 'Resume' : 'Pause'}
        </button>
      </div>

      <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
        <AnimatePresence initial={false}>
          {events.map(event => {
            const Icon = iconMap[event.type]
            const colorClass = colorMap[event.type]
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -12, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all ${
                  event.isNew
                    ? 'bg-cyan/[0.04] border-cyan/20'
                    : 'border-transparent hover:bg-elevated'
                }`}
              >
                <div className={`w-6 h-6 rounded-md border flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                  <Icon size={11} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 justify-between">
                    <span className="text-text-primary text-[11px] font-medium truncate">{event.title}</span>
                    {event.amount && (
                      <span className={`text-[10px] font-mono font-bold flex-shrink-0 ${
                        event.amount.startsWith('-') || event.amount.startsWith('−') ? 'text-negative' : 'text-positive'
                      }`}>
                        {event.amount}
                      </span>
                    )}
                  </div>
                  <div className="text-text-tertiary text-[10px] font-mono mt-0.5 truncate">{event.detail}</div>
                </div>
                <span className="text-[9px] font-mono text-text-tertiary flex-shrink-0 mt-0.5">{event.time}</span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
