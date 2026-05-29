'use client'

import { useState } from 'react'
import { Search, Bell, Download, ChevronDown, Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TopBarProps {
  onMenuToggle?: () => void
}

const notifications = [
  { type: 'alert', title: 'MRR threshold reached', desc: 'MRR crossed $1.25M target', time: '2m ago' },
  { type: 'info', title: 'Export ready', desc: 'Q4 report PDF is ready for download', time: '15m ago' },
  { type: 'warning', title: 'Churn spike detected', desc: 'Churn up 0.4pp vs last week', time: '1h ago' },
]

export function TopBar({ onMenuToggle }: TopBarProps) {
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm">
      {/* Mobile menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden text-text-secondary hover:text-text-primary"
      >
        <Menu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          type="search"
          placeholder="Search metrics, reports..."
          className="w-full pl-9 pr-4 py-2 bg-elevated border border-[var(--color-border)] rounded-lg text-sm text-text-secondary placeholder:text-text-tertiary font-mono focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/20 transition-all"
        />
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[10px] font-mono bg-canvas px-1.5 py-0.5 rounded border border-[var(--color-border)]">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Export button */}
        <button className="btn-ghost text-sm py-2 px-4 flex items-center gap-2">
          <Download size={15} />
          Export
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-cyan/30 transition-all"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan rounded-full text-canvas text-[9px] font-bold flex items-center justify-center">
              3
            </span>
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 card shadow-cyan-md z-50"
              >
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">Notifications</span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="divide-y divide-[var(--color-border)]">
                  {notifications.map((n, i) => (
                    <div key={i} className="p-4 hover:bg-elevated transition-colors cursor-pointer">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-2 h-2 rounded-full mt-1.5 flex-shrink-0"
                          style={{
                            background:
                              n.type === 'alert' ? 'var(--color-positive)' :
                              n.type === 'warning' ? 'var(--color-warning)' :
                              'var(--color-cyan)',
                          }}
                        />
                        <div>
                          <div className="text-text-primary text-xs font-medium">{n.title}</div>
                          <div className="text-text-tertiary text-xs font-mono mt-0.5">{n.desc}</div>
                          <div className="text-text-tertiary text-[10px] font-mono mt-1">{n.time}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User menu */}
        <button
          onClick={() => setUserOpen(!userOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--color-border)] hover:border-cyan/30 transition-all"
        >
          <div className="w-6 h-6 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center">
            <span className="text-cyan font-mono font-bold text-[9px]">AK</span>
          </div>
          <span className="text-text-secondary text-sm hidden sm:block">Alex Kim</span>
          <ChevronDown size={13} className="text-text-tertiary" />
        </button>
      </div>
    </header>
  )
}
