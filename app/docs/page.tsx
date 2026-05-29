import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'
import Link from 'next/link'

export default function DocsPage() {
  return (
    <MarketingPageLayout title="Documentation" subtitle="Developer resources and platform guides">
      <p className="text-text-secondary leading-relaxed">
        Welcome to the FinFlow Analytics Developer Center.
        Learn how to integrate our SDKs, configure webhooks, query financial metrics, and deploy securely.
      </p>
      <div className="grid md:grid-cols-2 gap-4 mt-6">
        <Link href="/docs/api" className="card p-6 hover:border-cyan/30 transition-all group">
          <h3 className="font-display font-semibold text-lg text-text-primary mb-1 group-hover:text-cyan transition-colors">
            API Reference →
          </h3>
          <p className="text-text-secondary text-sm">
            Interactive guide to REST endpoints, parameter types, authentication, and error codes.
          </p>
        </Link>
        <Link href="/integrations" className="card p-6 hover:border-cyan/30 transition-all group">
          <h3 className="font-display font-semibold text-lg text-text-primary mb-1 group-hover:text-cyan transition-colors">
            Integrations Center →
          </h3>
          <p className="text-text-secondary text-sm">
            Learn how to hook up Stripe, Plaid, AWS S3, and standard accounting software.
          </p>
        </Link>
      </div>
    </MarketingPageLayout>
  )
}
