'use client'

import { motion } from 'framer-motion'
import {
  LayoutDashboard, TrendingUp, FileText, Users, Settings,
  ChevronRight, ChevronDown, DollarSign, BarChart2, Activity
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

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
  { icon: FileText, label: 'Reports', href: '/dashboard/reports' },
  { icon: Users, label: 'Users', href: '/dashboard/users', adminOnly: true },
  { icon: Settings, label: 'Settings', href: '/dashboard/settings', adminOnly: true },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
  currentRole?: 'admin' | 'analyst' | 'viewer'
}

export function Sidebar({ collapsed, onToggle, currentRole = 'admin' }: SidebarProps) {
  const pathname = usePathname()
  const [expandedItem, setExpandedItem] = useState<string | null>('/dashboard/finance')

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard'
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 240 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className="relative flex-shrink-0 h-full border-r border-[var(--color-border)] bg-surface flex flex-col overflow-hidden"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--color-border)]">
        <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center flex-shrink-0">
          <TrendingUp size={15} className="text-cyan" />
        </div>
        {!collapsed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="overflow-hidden">
            <div className="font-display font-bold text-sm leading-none">FINFLOW</div>
            <div className="font-mono text-text-tertiary text-[10px] mt-0.5">Analytics</div>
          </motion.div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto overflow-x-hidden">
        {navItems.map(item => {
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
                  className="flex items-center gap-3 flex-1"
                  onClick={e => hasChildren && e.preventDefault()}
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
      <div className="p-3 border-t border-[var(--color-border)]">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-cyan/15 border border-cyan/30 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan font-mono font-bold text-xs">AK</span>
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <div className="text-text-primary text-xs font-medium truncate">Alex Kim</div>
              <div className="text-text-tertiary text-[10px] font-mono capitalize">{currentRole}</div>
            </div>
          )}
        </div>
      </div>

      {/* Toggle */}
      <button
        onClick={onToggle}
        className="absolute top-5 -right-3 w-6 h-6 rounded-full bg-elevated border border-[var(--color-border)] flex items-center justify-center text-text-tertiary hover:text-cyan hover:border-cyan/40 transition-all z-10"
      >
        <ChevronRight size={12} className={`transition-transform ${collapsed ? '' : 'rotate-180'}`} />
      </button>
    </motion.aside>
  )
}
