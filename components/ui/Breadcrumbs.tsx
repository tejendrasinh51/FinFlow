import Link from 'next/link'
import { ChevronRight, Home } from 'lucide-react'

interface Crumb { label: string; href?: string }

export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-xs font-mono" aria-label="Breadcrumb">
      <Link href="/dashboard" className="text-text-tertiary hover:text-text-secondary transition-colors">
        <Home size={12} />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight size={11} className="text-text-tertiary" />
          {crumb.href && i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="text-text-tertiary hover:text-text-secondary transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-text-secondary">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}
