import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function CareersPage() {
  return (
    <MarketingPageLayout title="Careers" subtitle="Help us build the future of financial streaming">
      <p className="text-text-secondary leading-relaxed">
        We are a remote-first group of builders passionate about data pipelines, premium design systems, and fast analytics.
        If you love deep-diving into database indexing, multi-tenant architectures, or building reactive UI dashboards, we want to hear from you.
      </p>
      
      <h2 className="text-xl font-bold font-display mt-8 mb-4">Open Positions</h2>
      <div className="space-y-4">
        <div className="card p-5 hover:border-cyan/30 transition-all cursor-pointer">
          <h3 className="font-semibold text-text-primary text-base">Senior Full Stack Engineer (Next.js / Node / Postgres)</h3>
          <p className="text-text-tertiary text-xs mt-1">Remote · Full-Time · Competitive Salary + Equity</p>
        </div>
        <div className="card p-5 hover:border-cyan/30 transition-all cursor-pointer">
          <h3 className="font-semibold text-text-primary text-base">Lead Database Reliability Engineer (PostgreSQL / Redis)</h3>
          <p className="text-text-tertiary text-xs mt-1">Remote / Hybrid (NYC) · Full-Time · Competitive Salary + Equity</p>
        </div>
      </div>
    </MarketingPageLayout>
  )
}
