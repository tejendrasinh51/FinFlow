import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function CommunityPage() {
  return (
    <MarketingPageLayout title="Community Hub" subtitle="Connect with FinFlow developers and financial experts">
      <p className="text-text-secondary leading-relaxed">
        Join our growing community of financial developers, CTOs, and analytical professionals.
        Share insights, integration strategies, custom reporting scripts, and help us steer the future of open financial metrics streaming.
      </p>
      
      <div className="grid md:grid-cols-2 gap-4 mt-8">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-text-primary text-base mb-1">Developer Forum</h3>
          <p className="text-text-secondary text-xs mb-4">Discuss open-source plugins, schema migration scripts, and RLS deployment strategies.</p>
          <a href="https://github.com/tejendrasinh51/FinFlow/discussions" target="_blank" rel="noreferrer" className="text-xs text-cyan hover:underline font-mono">Join discussions →</a>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-text-primary text-base mb-1">Discord Guild</h3>
          <p className="text-text-secondary text-xs mb-4">Real-time troubleshooting, peer review, and announcements on scheduled updates.</p>
          <a href="#" className="text-xs text-cyan hover:underline font-mono">Get Discord invite →</a>
        </div>
      </div>
    </MarketingPageLayout>
  )
}
