import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function PrivacyPage() {
  return (
    <MarketingPageLayout title="Privacy Policy" subtitle="Last Updated: May 2026">
      <p className="text-text-secondary leading-relaxed">
        At FinFlow Analytics, we take the security and privacy of your organization's financial records extremely seriously.
        This Privacy Policy explains how we store, process, and handle account metadata and metric parameters.
      </p>
      <h3 className="font-display font-semibold text-lg text-text-primary mt-6 mb-2">1. Data Storage & Isolation</h3>
      <p className="text-text-secondary text-sm">
        All metric ledger entries and transactional data are isolated at the database level using PostgreSQL Row-Level Security (RLS).
        This guarantees that no user or system operator from one tenant organization can query or modify resources belonging to another tenant.
      </p>
    </MarketingPageLayout>
  )
}
