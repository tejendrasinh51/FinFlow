'use client'

import { FadeIn } from '@/components/motion/FadeIn'
import { motion } from 'framer-motion'
import { ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

const benefits = [
  'Full-featured sandbox — no credit card required',
  '30-minute onboarding walkthrough',
  'Dedicated implementation engineer',
  'SOC 2 Type II certified',
]

export function CallToAction() {
  return (
    <section id="demo" className="py-32 relative overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 100%, rgba(0,212,255,0.08), transparent 70%),
            var(--color-bg-surface)
          `,
        }}
      />

      {/* Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(var(--color-grid-line) 1px, transparent 1px),
            linear-gradient(90deg, var(--color-grid-line) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        <FadeIn direction="up">
          <div className="section-label mb-6 justify-center">Get Started</div>
          <h2 className="text-h2 mb-6">
            Ready to unify your{' '}
            <span className="gradient-text">financial data?</span>
          </h2>
          <p className="text-text-secondary text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Join 10,000+ users who replaced their fragmented tooling with FinFlow.
            Deploy in hours, not weeks.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
            <motion.div
              whileHover={{ scale: 1.03, boxShadow: '0 0 30px rgba(0,212,255,0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href="/onboarding" className="btn-primary text-lg py-4 px-10 inline-flex items-center gap-2">
                Request a Demo <ArrowRight size={20} />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.02 }}>
              <Link href="/pricing" className="btn-secondary text-lg py-4 px-10 inline-flex items-center gap-2">
                View Pricing
              </Link>
            </motion.div>
          </div>

          {/* Benefits list */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2 text-text-secondary text-sm">
                <CheckCircle size={14} className="text-positive flex-shrink-0" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
