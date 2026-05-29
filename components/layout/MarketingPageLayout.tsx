'use client'

import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface MarketingPageLayoutProps {
  title: string
  subtitle?: string
  children: ReactNode
}

export function MarketingPageLayout({ title, subtitle, children }: MarketingPageLayoutProps) {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-canvas pt-32 pb-24 relative overflow-hidden">
        {/* Decorative subtle background gradient blob */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-cyan/5 blur-[120px] pointer-events-none -z-10" />
        
        <div className="max-w-4xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="space-y-8"
          >
            <div className="border-b border-[var(--color-border)] pb-8">
              <h1 className="text-4xl md:text-5xl font-bold font-display tracking-tight text-text-primary">
                {title}
              </h1>
              {subtitle && (
                <p className="text-text-secondary font-mono text-sm mt-3 uppercase tracking-wider">
                  {subtitle}
                </p>
              )}
            </div>
            
            <div className="prose prose-invert max-w-none text-text-secondary leading-relaxed font-sans text-sm md:text-base space-y-6">
              {children}
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  )
}
