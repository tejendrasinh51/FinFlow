'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Bell, Download, ChevronDown, Menu, X, LogOut, ShieldAlert, Command, FileText, FileSpreadsheet, Table, CornerDownLeft, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface TopBarProps {
  onMenuToggle?: () => void
  sidebarOpen?: boolean
}

const notifications = [
  { type: 'alert', title: 'MRR threshold reached', desc: 'MRR crossed $1.25M target', time: '2m ago' },
  { type: 'info', title: 'Export ready', desc: 'Q4 report PDF is ready for download', time: '15m ago' },
  { type: 'warning', title: 'Churn spike detected', desc: 'Churn up 0.4pp vs last week', time: '1h ago' },
]

export function TopBar({ onMenuToggle, sidebarOpen }: TopBarProps) {
  const router = useRouter()
  const [notifOpen, setNotifOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)
  const [user, setUser] = useState<{ name: string; role: string } | null>(null)
  
  // Interactive control hooks
  const [paletteOpen, setPaletteOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  
  const [exportOpen, setExportOpen] = useState(false)
  const [exporting, setExporting] = useState<'pdf' | 'excel' | 'csv' | null>(null)
  
  const dropdownRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const exportRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  // Handle outside clicks to close menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserOpen(false)
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false)
      }
      if (exportRef.current && !exportRef.current.contains(event.target as Node)) {
        setExportOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Global Ctrl+K / Cmd+K Command Palette listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setPaletteOpen(true)
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus search input when palette opens
  useEffect(() => {
    if (paletteOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 80)
      setSearchQuery('')
      setActiveIndex(0)
    }
  }, [paletteOpen])

  // Global background export handler
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setExporting(format)
    setExportOpen(false)
    setPaletteOpen(false)
    
    try {
      const res = await fetch('/api/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format, title: 'FinFlow System Ledger' }),
      })
      if (!res.ok) throw new Error('Global export worker failed')
      
      const data = await res.json()
      const jobId = data.jobId

      let attempts = 0
      const poll = setInterval(async () => {
        attempts++
        if (attempts > 30) {
          clearInterval(poll)
          setExporting(null)
          return
        }
        
        const statusRes = await fetch(`/api/export/${jobId}`)
        if (statusRes.ok) {
          const statusData = await statusRes.json()
          if (statusData.success && statusData.job) {
            const status = statusData.job.status
            if (status === 'done') {
              clearInterval(poll)
              setExporting(null)
              const downloadUrl = statusData.job.url
              if (downloadUrl) {
                const a = document.createElement('a')
                a.href = downloadUrl
                a.setAttribute('download', `finflow-system-ledger.${format === 'excel' ? 'xlsx' : format}`)
                document.body.appendChild(a)
                a.click()
                document.body.removeChild(a)
              }
            } else if (status === 'error') {
              clearInterval(poll)
              setExporting(null)
            }
          }
        }
      }, 1000)
    } catch (e) {
      console.error(e)
      setExporting(null)
    }
  }

  // Define searchable command palette items
  const commandItems = [
    { id: 'dash',  title: 'Overview Dashboard', category: 'Pages' as const, desc: 'Jump to financial Overview Metrics', action: () => { router.push('/dashboard'); setPaletteOpen(false) } },
    { id: 'pandl', title: 'Profit & Loss Statement (P&L)', category: 'Pages' as const, desc: 'Audited P&L breakdown views', action: () => { router.push('/dashboard/finance'); setPaletteOpen(false) } },
    { id: 'mrrg',  title: 'MRR / ARR Growth Insights', category: 'Pages' as const, desc: 'Analyze MRR waterfall & movement', action: () => { router.push('/dashboard/finance/mrr'); setPaletteOpen(false) } },
    { id: 'cashf', title: 'Cashflow Statements', category: 'Pages' as const, desc: 'Review inflow, outflow, and net trends', action: () => { router.push('/dashboard/finance/cashflow'); setPaletteOpen(false) } },
    { id: 'rep',   title: 'Reports center', category: 'Pages' as const, desc: 'Create and download dynamic reports', action: () => { router.push('/dashboard/reports'); setPaletteOpen(false) } },
    { id: 'sett',  title: 'Workspace Settings', category: 'Pages' as const, desc: 'Configure tenant profile & team RBAC', action: () => { router.push('/dashboard/settings'); setPaletteOpen(false) } },
    
    { id: 'm-rev', title: 'Revenue Metric Analysis', category: 'Metrics' as const, desc: 'Jump to Q1-Q4 Revenue tracking', action: () => { router.push('/dashboard/finance'); setPaletteOpen(false) } },
    { id: 'm-mrr', title: 'MRR Metric Trends', category: 'Metrics' as const, desc: 'Jump to Monthly Recurring Revenue', action: () => { router.push('/dashboard/finance/mrr'); setPaletteOpen(false) } },
    { id: 'm-arr', title: 'ARR Metric Projection', category: 'Metrics' as const, desc: 'Jump to Annual Recurring Revenue', action: () => { router.push('/dashboard/finance/mrr'); setPaletteOpen(false) } },
    { id: 'm-chr', title: 'Churn Analysis Trends', category: 'Metrics' as const, desc: 'Jump to net churn indicators', action: () => { router.push('/dashboard/finance/mrr'); setPaletteOpen(false) } },

    { id: 'a-new', title: 'Create New Report...', category: 'Actions' as const, desc: 'Launch the custom report builder', action: () => { router.push('/dashboard/reports'); setPaletteOpen(false) } },
    { id: 'a-pdf', title: 'Export Audit Ledger PDF', category: 'Actions' as const, desc: 'Generate system PDF workbook', action: () => handleExport('pdf') },
    { id: 'a-xls', title: 'Export Formatted Excel Ledger', category: 'Actions' as const, desc: 'Generate system spreadsheet workbook', action: () => handleExport('excel') },
    { id: 'a-out', title: 'Sign Out of Workspace', category: 'Actions' as const, desc: 'Securely close your active session', action: () => handleLogout() },
  ]

  // Filter items dynamically based on query
  const filteredCommands = commandItems.filter(cmd => 
    cmd.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    cmd.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cmd.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Keyboard navigation inside Palette
  const handlePaletteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(prev => (prev + 1) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(prev => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[activeIndex]) {
        filteredCommands[activeIndex].action()
      }
    } else if (e.key === 'Escape') {
      setPaletteOpen(false)
    }
  }

  return (
    <header className="flex items-center gap-4 px-6 py-4 border-b border-[var(--color-border)] bg-surface/80 backdrop-blur-sm relative z-40">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="flex-shrink-0 w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-cyan/30 transition-all bg-elevated/40 lg:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={18} />
      </button>

      {/* Global Interactive Command Palette Search trigger — hidden on mobile */}
      <div 
        onClick={() => setPaletteOpen(true)}
        className="relative flex-1 max-w-sm cursor-pointer group hidden sm:flex"
      >
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary group-hover:text-cyan transition-colors" />
        <div className="w-full pl-9 pr-12 py-2 bg-elevated border border-[var(--color-border)] group-hover:border-cyan/30 rounded-lg text-sm text-text-tertiary font-mono transition-all text-left">
          Search metrics, reports...
        </div>
        <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary text-[10px] font-mono bg-canvas px-1.5 py-0.5 rounded border border-[var(--color-border)] group-hover:border-cyan/20 transition-all">
          ⌘K
        </kbd>
      </div>

      <div className="flex items-center gap-4 ml-auto">
        {/* Global Export Center trigger */}
        <div ref={exportRef} className="relative">
          <button 
            onClick={() => setExportOpen(!exportOpen)}
            className="btn-secondary text-sm py-1.5 px-3 flex items-center gap-2 border border-[var(--color-border)] rounded-lg hover:border-cyan/30 transition-all bg-elevated/40"
            disabled={!!exporting}
          >
            {exporting ? (
              <>
                <svg className="animate-spin h-3.5 w-3.5 text-cyan" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="hidden sm:inline">Compiling…</span>
              </>
            ) : (
              <>
                <Download size={14} className="text-cyan" />
                <span className="hidden md:inline">Export Center</span>
                <ChevronDown size={12} className={`text-text-tertiary transition-transform ${exportOpen ? 'rotate-180' : ''} hidden md:block`} />
              </>
            )}
          </button>

          <AnimatePresence>
            {exportOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-12 w-56 card shadow-cyan-md z-50 overflow-hidden"
              >
                <div className="p-1">
                  {[
                    { id: 'pdf',   label: 'Export PDF',   icon: FileText,        desc: 'Full executive report' },
                    { id: 'excel', label: 'Export Excel', icon: FileSpreadsheet, desc: 'Formatted ledger sheets' },
                    { id: 'csv',   label: 'Export CSV',   icon: Table,           desc: 'Raw metrics database' },
                  ].map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => handleExport(fmt.id as any)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-elevated transition-colors text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan/15 transition-colors">
                        <fmt.icon size={14} className="text-cyan" />
                      </div>
                      <div>
                        <div className="text-text-primary text-xs font-medium">{fmt.label}</div>
                        <div className="text-text-tertiary text-[9px] font-mono">{fmt.desc}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative w-9 h-9 rounded-lg border border-[var(--color-border)] flex items-center justify-center text-text-secondary hover:text-text-primary hover:border-cyan/30 transition-all bg-elevated/40"
          >
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan text-canvas text-[9px] font-mono font-bold flex items-center justify-center">
              {notifications.length}
            </span>
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

      {/* Global Command Palette Overlay Modal */}
      <AnimatePresence>
        {paletteOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
            {/* Dark glass backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPaletteOpen(false)}
              className="absolute inset-0 bg-canvas/80 backdrop-blur-[4px]"
            />
            
            {/* Command Palette body */}
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-xl mx-4 card shadow-cyan-xl border border-cyan/20 overflow-hidden bg-surface max-h-[480px] flex flex-col"
            >
              {/* Search bar inside palette */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--color-border)] flex-shrink-0">
                <Search size={18} className="text-cyan flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type a command or metric parameter to jump..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setActiveIndex(0) }}
                  onKeyDown={handlePaletteKeyDown}
                  className="w-full bg-transparent text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none font-mono"
                />
                <kbd className="text-[10px] font-mono bg-canvas border border-[var(--color-border)] px-1.5 py-0.5 rounded text-text-tertiary">
                  ESC
                </kbd>
              </div>

              {/* Commands List */}
              <div className="flex-1 overflow-y-auto p-2 min-h-0">
                {filteredCommands.length > 0 ? (
                  <div className="space-y-4">
                    {['Pages', 'Metrics', 'Actions'].map(cat => {
                      const catCommands = filteredCommands.filter(c => c.category === cat)
                      if (catCommands.length === 0) return null
                      
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="px-3 py-1.5 text-[9px] font-mono text-cyan uppercase tracking-wider font-semibold">
                            {cat}
                          </div>
                          
                          {catCommands.map((cmd) => {
                            const globalIndex = filteredCommands.indexOf(cmd)
                            const isSelected = globalIndex === activeIndex
                            
                            return (
                              <button
                                key={cmd.id}
                                onClick={cmd.action}
                                onMouseEnter={() => setActiveIndex(globalIndex)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors text-left ${
                                  isSelected ? 'bg-cyan/10 border border-cyan/20' : 'border border-transparent'
                                }`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    isSelected ? 'bg-cyan/20 text-cyan' : 'bg-elevated text-text-tertiary'
                                  }`}>
                                    {cat === 'Pages' && <Sparkles size={13} />}
                                    {cat === 'Metrics' && <Command size={13} />}
                                    {cat === 'Actions' && (
                                      cmd.id.includes('pdf') ? <FileText size={13} /> :
                                      cmd.id.includes('xls') ? <FileSpreadsheet size={13} /> :
                                      cmd.id.includes('out') ? <LogOut size={13} /> : <Table size={13} />
                                    )}
                                  </div>
                                  <div className="truncate">
                                    <div className={`text-xs font-medium truncate ${isSelected ? 'text-cyan' : 'text-text-primary'}`}>{cmd.title}</div>
                                    <div className="text-[10px] text-text-tertiary truncate font-mono">{cmd.desc}</div>
                                  </div>
                                </div>
                                {isSelected && (
                                  <span className="flex items-center gap-1 text-[10px] font-mono text-cyan flex-shrink-0 bg-cyan/5 px-1.5 py-0.5 rounded border border-cyan/20">
                                    Jump <CornerDownLeft size={10} />
                                  </span>
                                )}
                              </button>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShieldAlert size={24} className="text-text-tertiary mx-auto mb-2" />
                    <div className="text-xs text-text-secondary font-medium">No results found matching "{searchQuery}"</div>
                    <div className="text-[10px] text-text-tertiary font-mono mt-1">Try searching for pages, revenue metrics, or exports.</div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}
