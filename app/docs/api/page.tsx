import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function ApiDocsPage() {
  return (
    <MarketingPageLayout title="API Reference" subtitle="Integrate your ledger data with REST and WebSockets">
      <p className="text-text-secondary leading-relaxed">
        The FinFlow API is structured around REST principles. All requests require authentication using a secret token passed in the headers.
      </p>
      
      <div className="space-y-6 mt-8">
        <div className="card p-5 font-mono text-sm bg-elevated/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] bg-cyan/15 text-cyan border border-cyan/30">GET</span>
            <span className="font-semibold text-text-primary">/api/metrics</span>
          </div>
          <p className="text-text-secondary font-sans text-xs mb-3">Retrieve high-level financial metrics (MRR, ARR, Churn, DAU) for your organization.</p>
          <div className="text-[11px] text-text-tertiary">
            Headers: <code className="text-cyan">Authorization: Bearer &lt;YOUR_API_KEY&gt;</code>
          </div>
        </div>

        <div className="card p-5 font-mono text-sm bg-elevated/40">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-[10px] bg-positive/15 text-positive border border-positive/30">POST</span>
            <span className="font-semibold text-text-primary">/api/export</span>
          </div>
          <p className="text-text-secondary font-sans text-xs mb-3">Trigger an asynchronous export of financial metrics in PDF, CSV, or Excel format.</p>
          <div className="text-[11px] text-text-tertiary">
            Headers: <code className="text-cyan">Authorization: Bearer &lt;YOUR_API_KEY&gt;</code>
          </div>
        </div>
      </div>
    </MarketingPageLayout>
  )
}
