import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import PricingClient from './PricingClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing — FinFlow Analytics',
  description: 'Simple, transparent pricing for every stage of your fintech journey. Starter, Growth, and Enterprise plans.',
}

export default function PricingPage() {
  return (
    <>
      <Navbar />
      <main>
        <PricingClient />
      </main>
      <Footer />
    </>
  )
}
