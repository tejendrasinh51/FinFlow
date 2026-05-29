import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function BlogPage() {
  return (
    <MarketingPageLayout title="FinFlow Blog" subtitle="Insights, engineering updates, and product guides">
      <div className="space-y-8">
        <article className="border-b border-[var(--color-border)] pb-6 last:border-0">
          <h2 className="text-xl font-semibold text-text-primary font-display mb-1">
            Scaling Real-time Analytics to 10K+ DAU
          </h2>
          <p className="text-xs text-text-tertiary font-mono mb-3">May 15, 2026 · Engineering Team</p>
          <p className="text-text-secondary leading-relaxed">
            How we optimized PostgreSQL transaction isolation and implemented Edge-based JWT session authentication to handle heavy traffic spikes without latency regressions.
          </p>
        </article>
        <article className="border-b border-[var(--color-border)] pb-6 last:border-0">
          <h2 className="text-xl font-semibold text-text-primary font-display mb-1">
            Understanding Row-Level Security in Multi-Tenant Apps
          </h2>
          <p className="text-xs text-text-tertiary font-mono mb-3">April 28, 2026 · Security Team</p>
          <p className="text-text-secondary leading-relaxed">
            A comprehensive look at using Postgres RLS with set_config settings to strictly segregate sensitive financial client data within single-instance databases.
          </p>
        </article>
      </div>
    </MarketingPageLayout>
  )
}
