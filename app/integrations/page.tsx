import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function IntegrationsPage() {
  return (
    <MarketingPageLayout title="Integrations Center" subtitle="Connect your financial tools in seconds">
      <p className="text-text-secondary leading-relaxed">
        Hook up your existing accounting systems, transaction processors, and merchant databases directly into the FinFlow streaming pipeline.
      </p>
      
      <div className="grid md:grid-cols-3 gap-4 mt-8">
        <div className="card p-6 flex flex-col justify-between">
          <div>
            <span className="text-cyan font-mono text-[10px] tracking-wider uppercase mb-1 block">Processor</span>
            <h3 className="font-display font-semibold text-text-primary text-base">Stripe</h3>
            <p className="text-text-secondary text-xs mt-1">Sync customer events, invoices, and payments in real time.</p>
          </div>
          <button className="btn-secondary text-[11px] py-1 px-3 mt-4 w-full">Configure</button>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <span className="text-cyan font-mono text-[10px] tracking-wider uppercase mb-1 block">Banking API</span>
            <h3 className="font-display font-semibold text-text-primary text-base">Plaid</h3>
            <p className="text-text-secondary text-xs mt-1">Direct integration for balance verification and ledger reconciliation.</p>
          </div>
          <button className="btn-secondary text-[11px] py-1 px-3 mt-4 w-full">Configure</button>
        </div>

        <div className="card p-6 flex flex-col justify-between">
          <div>
            <span className="text-cyan font-mono text-[10px] tracking-wider uppercase mb-1 block">Cloud Storage</span>
            <h3 className="font-display font-semibold text-text-primary text-base">AWS S3</h3>
            <p className="text-text-secondary text-xs mt-1">Store and distribute compiled reports and PDF assets dynamically.</p>
          </div>
          <button className="btn-secondary text-[11px] py-1 px-3 mt-4 w-full font-medium">Configure</button>
        </div>
      </div>
    </MarketingPageLayout>
  )
}
