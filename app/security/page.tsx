import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function SecurityPage() {
  return (
    <MarketingPageLayout title="Security Framework" subtitle="Enterprise-Grade Protection">
      <p className="text-text-secondary leading-relaxed">
        FinFlow Analytics is built around strict data protection protocols.
        We employ multi-layer defenses to protect transactional records and customer details.
      </p>
      <h3 className="font-display font-semibold text-lg text-text-primary mt-6 mb-2">Key Security Features</h3>
      <ul className="list-disc pl-5 text-sm space-y-2 text-text-secondary">
        <li>Database level tenant isolation using Row-Level Security (RLS).</li>
        <li>State-of-the-art Edge-compatible JWT encryption.</li>
        <li>Secure cookie settings (HTTPOnly, SameSite, and SSL required).</li>
      </ul>
    </MarketingPageLayout>
  )
}
