import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function TermsPage() {
  return (
    <MarketingPageLayout title="Terms of Service" subtitle="Last Updated: May 2026">
      <p className="text-text-secondary leading-relaxed">
        By accessing or using the FinFlow Analytics SaaS platform, you agree to comply with and be bound by the following terms of service.
      </p>
      <h3 className="font-display font-semibold text-lg text-text-primary mt-6 mb-2">1. Use of Services</h3>
      <p className="text-text-secondary text-sm">
        You are responsible for safeguarding your credentials and setting appropriate user roles (Admin, Analyst, Viewer) inside the organization panel to restrict access to sensitive metrics.
      </p>
    </MarketingPageLayout>
  )
}
