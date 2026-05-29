'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, Info, CheckCircle2, XCircle, X } from 'lucide-react'
import { useState } from 'react'

type AlertType = 'info' | 'warning' | 'error' | 'success'

interface AlertBannerProps {
  type: AlertType
  title: string
  message: string
  action?: { label: string; onClick: () => void }
  onDismiss?: () => void
  className?: string
}

const config: Record<AlertType, { icon: typeof Info; color: string; bg: string; border: string }> = {
  info:    { icon: Info,          color: 'text-cyan',     bg: 'bg-cyan/5',     border: 'border-cyan/20' },
  warning: { icon: AlertTriangle, color: 'text-warning',  bg: 'bg-warning/5',  border: 'border-warning/20' },
  error:   { icon: XCircle,       color: 'text-negative', bg: 'bg-negative/5', border: 'border-negative/20' },
  success: { icon: CheckCircle2,  color: 'text-positive', bg: 'bg-positive/5', border: 'border-positive/20' },
}

export function AlertBanner({ type, title, message, action, onDismiss, className }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  const { icon: Icon, color, bg, border } = config[type]

  const handleDismiss = () => {
    setDismissed(true)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          className={`${bg} border ${border} rounded-xl p-4 flex items-start gap-3 ${className ?? ''}`}
        >
          <Icon size={16} className={`${color} flex-shrink-0 mt-0.5`} />
          <div className="flex-1 min-w-0">
            <div className={`text-sm font-medium ${color}`}>{title}</div>
            <div className="text-text-secondary text-sm mt-0.5 leading-relaxed">{message}</div>
            {action && (
              <button
                onClick={action.onClick}
                className={`mt-2 text-xs font-medium ${color} hover:underline`}
              >
                {action.label} →
              </button>
            )}
          </div>
          <button
            onClick={handleDismiss}
            className="text-text-tertiary hover:text-text-secondary transition-colors flex-shrink-0"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
