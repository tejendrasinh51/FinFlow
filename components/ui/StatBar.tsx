interface StatBarProps {
  label: string
  value: number
  max?: number
  suffix?: string
  color?: string
  sublabel?: string
}

export function StatBar({ label, value, max = 100, suffix = '%', color = 'var(--color-cyan)', sublabel }: StatBarProps) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <div>
          <span className="text-text-secondary text-sm">{label}</span>
          {sublabel && <span className="text-text-tertiary text-xs font-mono ml-2">{sublabel}</span>}
        </div>
        <span className="font-mono font-medium text-sm text-text-primary">
          {value}{suffix}
        </span>
      </div>
      <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: color }}
        />
      </div>
    </div>
  )
}
