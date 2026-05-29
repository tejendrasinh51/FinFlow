'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface Tab { id: string; label: string; count?: number }

interface TabsProps {
  tabs: Tab[]
  activeTab: string
  onChange: (id: string) => void
  className?: string
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div className={cn('flex items-center gap-1 p-1 bg-surface rounded-lg border border-[var(--color-border)]', className)}>
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-150',
            activeTab === tab.id
              ? 'bg-elevated text-text-primary shadow-sm border border-[var(--color-border)]'
              : 'text-text-tertiary hover:text-text-secondary'
          )}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-[10px] font-mono px-1.5 py-0.5 rounded-md',
                activeTab === tab.id
                  ? 'bg-cyan/10 text-cyan'
                  : 'bg-elevated text-text-tertiary'
              )}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  )
}
