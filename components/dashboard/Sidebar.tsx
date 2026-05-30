'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, FileText, Users, Settings,
  ChevronRight, ChevronDown, DollarSign, BarChart2, Activity, X
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'

interface NavItem {
  icon: React.ElementType
  label: string
  href: string
  adminOnly?: boolean
  children?: { label: string; href: string; icon: React.ElementType }[]
}

const navItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard' },
  {
    icon: TrendingUp, label: 'Finance', href: '/dashboard/finance',
    children: [
      { label: 'P&L', href: '/dashboard/finance', icon: DollarSign },
      { label: 'MRR / ARR', href: '/dashboard/finance/mrr', icon: BarChart2 },
      { label: 'Cashflow', href: '/dashboard/finance/cashflow', icon: Activity },
    ],
  },
  { icon: Activity, label: 'Analytics', href: '/dashboard/analytics' },
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Users, label: 'Users', href: '/dashboard/users', adminOnly: true },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', adminOnly: true },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  onClose?: () => void
  currentRole?: 'admin' | 'analyst' | 'viewer'
}

export function Sidebar({ collapsed, onToggle, onClose, currentRole: propRole }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItem, setExpandedItem] = useState<string | null>('/dashboard/finance')
  const [session, setSession] = useState<{ name: string; role: 'admin' | 'analyst' | 'viewer' } | null>(null)

  // Fetch current user session details
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.success && data.user) {
          setSession(data.user)
        }
      })
      .catch((err) => console.error('Failed to load Sidebar user context:', err))
  }, [])

  const currentRole = propRole || session?.role || 'viewer'
  const userName = session?.name || 'Loading...'

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  // Get initials for profile avatar
  const getInitials = (name: string) => {
    if (!name || name === 'Loading...') return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }

  const handleNavClick = () => {
    // Close sidebar on mobile after navigation
    onClose?.()
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex-shrink-0 h-full border-r border-[var(--color-border)] bg-surface flex flex-col overflow-hidden"
    >
      {/* Logo + mobile close button */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={15} className="text-cyan" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden flex-1">
            <div className="font-display font-bold text-sm leading-none">FINFLOW</div>
            <div className="font-mono text-text-tertiary text-[10px] mt-0.5">Analytics</div>
          </motion.div>
        )}
        {/* Mobile close button */}
        {!collapsed && onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 rounded-md flex items-center justify-center text-text-tertiary hover:text-text-primary hover:bg-elevated transition-all flex-shrink-0"
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
          // Dynamic RBAC visibility filter
          const visible = !item.adminOnly || currentRole === 'admin'
          if (!visible) return null
          
          const active = isActive(item.href)
          const hasChildren = !!item.children
          const expanded = expandedItem === item.href

          return (
            <div key={item.href}>
              {/* Main item */}
              <div
                className={`sidebar-link ${active ? 'active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                onClick={() => {
                  if (hasChildren && !collapsed) {
                    setExpandedItem(expanded ? null : item.href)
                  }
                }}
              >
                <Link
                  href={hasChildren ? '#' : item.href}
                  className="flex items-center gap-3 flex-1 animate-none text-decoration-none"
                  onClick={e => {
                    if (hasChildren) {
                      e.preventDefault()
                    } else {
                      handleNavClick()
                    }
                  }}
                >
                  <item.icon size={17} className="flex-shrink-0" />
                  {!collapsed && <span className="truncate flex-1">{item.label}</span>}
                </Link>
                {!collapsed && item.adminOnly && (
                  <span className="text-[9px] font-mono text-text-tertiary bg-elevated px-1.5 py-0.5 rounded">
                    admin
                  </span>
                )}
                {!collapsed && hasChildren && (
                  <ChevronDown
                    size={13}
                    className={`text-text-tertiary transition-transform flex-shrink-0 ${expanded ? 'rotate-180' : ''}`}
                  />
                )}
              </div>

              {/* Sub-items */}
              {!collapsed && hasChildren && expanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-8 mt-0.5 space-y-0.5 border-l border-[var(--color-border)] pl-3"
                >
                  {item.children!.map(child => (
                    <Link
                      key={child.href}
                      href={child.href}
                      onClick={handleNavClick}
                      className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs transition-all ${
                        pathname === child.href
                          ? 'text-cyan bg-cyan/5'
                          : 'text-text-tertiary hover:text-text-secondary hover:bg-elevated'
                      }`}
                    >
                      <child.icon size={12} />
                      {child.label}
                    </Link>
                  ))}
                </motion.div>
              )}
            </div>
          )
        })}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-[var(--color-border)] bg-elevated/20">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan font-mono font-bold text-xs">
              {getInitials(userName)}
            </span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-text-primary text-xs font-semibold truncate">{userName}</div>
              <div className="text-text-tertiary text-[10px] font-mono capitalize">{currentRole}</div>
            </div>
          )}
        </div>
      </div>

      {/* Collapse Toggle — desktop only */}
      <button
        onClick={onToggle}
        className="hidden lg:flex absolute top-5 -right-3 w-6 h-6 rounded-full bg-elevated border border-[var(--color-border)] items-center justify-center text-text-tertiary hover:text-cyan hover:border-cyan/40 transition-all z-10"
      >
        <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
    </motion.aside>
  )
}
