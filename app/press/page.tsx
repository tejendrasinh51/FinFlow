import { MarketingPageLayout } from '@/components/layout/MarketingPageLayout'

export default function PressPage() {
  return (
    <MarketingPageLayout title="Press & Brand" subtitle="Brand assets and media resources">
      <p className="text-text-secondary leading-relaxed">
        If you are writing about FinFlow Analytics, we have put together high-resolution logos, brand guidelines, and executive headshots.
      </p>
      <div className="card p-6 mt-6 space-y-4">
        <h3 className="font-display font-semibold text-lg text-text-primary">Press Kits</h3>
        <p className="text-text-secondary text-sm">Download our official branding press kit including SVG logos, screenshots, and product videos.</p>
        <button className="btn-secondary text-xs px-4 py-2">Download Brand Kit (ZIP)</button>
      </div>
    </MarketingPageLayout>
  )
}
