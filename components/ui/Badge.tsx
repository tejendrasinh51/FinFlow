import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'admin' | 'analyst' | 'viewer' | 'success' | 'warning' | 'danger' | 'info' | 'active' | 'inactive'

const variantStyles: Record<BadgeVariant, string> = {
  default:  'bg-elevated text-text-secondary border-[var(--color-border)]',
  admin:    'bg-cyan/10 text-cyan border-cyan/25',
  analyst:  'bg-positive/10 text-positive border-positive/25',
  viewer:   'bg-elevated text-text-tertiary border-[var(--color-border)]',
  success:  'bg-positive/10 text-positive border-positive/25',
  warning:  'bg-warning/10 text-warning border-warning/25',
  danger:   'bg-negative/10 text-negative border-negative/25',
  info:     'bg-cyan/10 text-cyan border-cyan/25',
  active:   'bg-positive/10 text-positive border-positive/25',
  inactive: 'bg-elevated text-text-tertiary border-[var(--color-border)]',
}

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
  dot?: boolean
}

export function Badge({ children, variant = 'default', className, dot }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-mono font-medium uppercase tracking-wider',
        variantStyles[variant],
        className
      )}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ background: 'currentColor', opacity: 0.8 }}
        />
      )}
      {children}
    </span>
  )
}
