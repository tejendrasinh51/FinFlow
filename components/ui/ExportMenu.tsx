'use client'

import { useState, useRef, useEffect } from 'react'
import { Download, FileText, Table, FileSpreadsheet, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ExportMenuProps {
  onExport?: (format: 'pdf' | 'csv' | 'excel') => void
  loading?: boolean
  variant?: 'button' | 'ghost'
}

const formats = [
  { id: 'pdf',   label: 'Export PDF',   icon: FileText,        desc: 'Full report with charts' },
  { id: 'csv',   label: 'Export CSV',   icon: Table,           desc: 'Raw data for analysis' },
  { id: 'excel', label: 'Export Excel', icon: FileSpreadsheet, desc: 'Formatted workbook' },
] as const

export function ExportMenu({ onExport, loading, variant = 'button' }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const [exporting, setExporting] = useState<string | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleExport = async (format: 'pdf' | 'csv' | 'excel') => {
    setExporting(format)
    setOpen(false)
    await new Promise(r => setTimeout(r, 1500))
    onExport?.(format)
    setExporting(null)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={variant === 'button' ? 'btn-secondary text-sm py-2 px-4 flex items-center gap-2' : 'btn-ghost text-sm py-2 px-4 flex items-center gap-2'}
        disabled={!!exporting}
      >
        {exporting ? (
          <>
            <svg className="animate-spin h-3.5 w-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Exporting…
          </>
        ) : (
          <>
            <Download size={14} />
            Export
            <ChevronDown size={13} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-12 w-56 card shadow-cyan-md z-50 overflow-hidden"
          >
            <div className="p-1">
              {formats.map(fmt => (
                <button
                  key={fmt.id}
                  onClick={() => handleExport(fmt.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-elevated transition-colors text-left group"
                >
                  <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan/15 transition-colors">
                    <fmt.icon size={14} className="text-cyan" />
                  </div>
                  <div>
                    <div className="text-text-primary text-xs font-medium">{fmt.label}</div>
                    <div className="text-text-tertiary text-[10px] font-mono">{fmt.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
