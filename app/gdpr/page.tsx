import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function GdprPage() {
  return (
    <MarketingPageLayout title="GDPR Compliance" subtitle="EU General Data Protection Regulation">
      <p className="text-text-secondary leading-relaxed">
        FinFlow Analytics is fully committed to compliance with the General Data Protection Regulation (GDPR).
        We process all personal data strictly in accordance with GDPR principles of lawfulness, fairness, transparency, purpose limitation, and data minimization.
      </p>
      <h3 className="font-display font-semibold text-lg text-text-primary mt-6 mb-2">Your Rights under GDPR</h3>
      <ul className="list-disc pl-5 text-sm space-y-2 text-text-secondary">
        <li>The right to access your stored personal information.</li>
        <li>The right to request data correction or deletion ("Right to be Forgotten").</li>
        <li>The right to restrict or object to personal data processing.</li>
      </ul>
    </MarketingPageLayout>
  )
}
