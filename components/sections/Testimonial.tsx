'use client'

import { FadeIn } from '@/components/motion/FadeIn'
import { Quote } from 'lucide-react'

export function Testimonial() {
  return (
    <section id="testimonial" className="py-24 relative">
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% 50%, rgba(0,212,255,0.04), transparent 70%)',
        }}
      />
      <div className="max-w-4xl mx-auto px-6 text-center">
        <FadeIn direction="up">
          <div className="card p-10 md:p-16 relative overflow-hidden">
            {/* Metric card top accent line */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent" />

            <Quote size={32} className="text-cyan/30 mx-auto mb-8" />

            <blockquote className="text-xl md:text-2xl text-text-primary leading-relaxed font-display font-medium mb-10">
              "FinFlow replaced every fragmented tool we had in one sprint. What used to take our
              finance team an entire afternoon now takes{' '}
              <span className="gradient-text">three minutes</span>. The real-time P&L view alone
              changed how our board thinks about decisions."
            </blockquote>

            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-cyan/10 border border-cyan/30 flex items-center justify-center">
                <span className="text-cyan font-display font-bold">AK</span>
              </div>
              <div className="text-left">
                <div className="text-text-primary font-medium">Alex Kim</div>
                <div className="text-text-tertiary text-sm font-mono">CFO, Payflow Technologies</div>
              </div>
            </div>

            {/* Background decoration */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'radial-gradient(circle at 80% 20%, rgba(0,212,255,0.05), transparent 50%)',
              }}
            />
          </div>
        </FadeIn>
      </div>
    </section>
  )
}
