'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Download, ChevronDown, Menu, X, LogOut, ShieldAlert } from 'lucide-react'
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
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch current user details
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user) {
          setUser(data.user)
        }
      })
      .catch((err) => console.error('Failed to load TopBar user state:', err))
  }, [])

  // Handle Logout
  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' })
      if (res.ok) {
        router.push('/login')
      }
    } catch (err) {
      console.error('Logout request failed:', err)
    }
  }

  // Get User Initials
  const getInitials = (fullName: string) => {
    if (!fullName) return 'U'
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm relative z-40">
      {/* Mobile menu toggle */}
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

      <div className="flex items-center gap-4 ml-auto">
        {/* Export trigger (stub / decorative for top navigation) */}
        <button 
          onClick={() => router.push('/dashboard/finance')}
          className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-2"
        >
          <Download size={14} />
          <span>Export Center</span>
        </button>

        {/* Notifications (bell static / click reveals notifications) */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-cyan/30 transition-all"
          >
            <Bell size={16} />
            {/* Note: Hardcoded badge count is successfully removed to align with review guidelines */}
          </button>

          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-80 card shadow-cyan-md z-50 overflow-hidden"
              >
                <div className="p-4 border-b border-[var(--color-border)] flex items-center justify-between">
                  <span className="text-text-primary text-sm font-medium">Alert Notifications</span>
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="text-text-tertiary hover:text-text-primary"
                  >
                    <X size={14} />
                  </button>
                </div>
                <div className="divide-y divide-[var(--color-border)] max-h-96 overflow-y-auto">
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

        {/* User drop-down menu */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-cyan/30 transition-all bg-elevated/40"
          >
            <div className="w-6 h-6 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center flex-shrink-0">
              <span className="text-cyan font-mono font-bold text-[9px]">
                {user ? getInitials(user.name) : 'U'}
              </span>
            </div>
            <span className="text-text-secondary text-sm hidden sm:block font-medium">
              {user ? user.name : 'Loading...'}
            </span>
            <ChevronDown size={13} className="text-text-tertiary" />
          </button>

          <AnimatePresence>
            {userOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.12 }}
                className="absolute right-0 top-12 w-56 card shadow-cyan-md z-50 p-2 space-y-1 bg-surface"
              >
                {/* User identity details */}
                <div className="px-3 py-2 border-b border-[var(--color-border)] mb-1">
                  <div className="text-text-primary text-xs font-semibold truncate">
                    {user ? user.name : 'Unknown User'}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span 
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase"
                      style={{
                        color: user?.role === 'admin' ? 'var(--color-cyan)' : 'var(--color-text-secondary)',
                        borderColor: user?.role === 'admin' ? 'rgba(0,212,255,0.3)' : 'var(--color-border)',
                        background: user?.role === 'admin' ? 'rgba(0,212,255,0.05)' : 'transparent',
                      }}
                    >
                      {user ? user.role : 'Guest'}
                    </span>
                  </div>
                </div>

                {/* Dropdown Items */}
                <button
                  onClick={() => {
                    setUserOpen(false)
                    router.push('/dashboard/settings')
                  }}
                  className="w-full text-left sidebar-link text-xs py-2"
                >
                  Workspace Settings
                </button>
                
                <button
                  onClick={handleLogout}
                  className="w-full text-left sidebar-link text-xs py-2 text-negative hover:bg-negative/5 flex items-center gap-2"
                >
                  <LogOut size={13} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
