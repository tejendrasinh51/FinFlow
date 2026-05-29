import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function AboutPage() {
  return (
    <MarketingPageLayout title="About FinFlow" subtitle="Our Vision & Mission">
      <p className="text-text-secondary leading-relaxed">
        FinFlow Analytics delivers real-time financial intelligence for high-growth fintech scale-ups and enterprise organizations.
        Our platform integrates seamlessly with existing transaction processors, banking APIs, and ledger databases to provide a unified, RLS-isolated view of key financial metrics.
      </p>
      <p className="text-text-secondary leading-relaxed mt-4">
        Founded in 2024, our mission is to empower CFOs, finance directors, and engineering teams to work together efficiently.
        By replacing fragmented databases, spreadsheets, and script workflows with a cohesive real-time streaming pipeline, FinFlow cuts financial reporting times by up to 60% and ensures 99.9% data availability.
      </p>
    </MarketingPageLayout>
  )
}
