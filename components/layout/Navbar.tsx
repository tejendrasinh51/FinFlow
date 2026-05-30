'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, TrendingUp } from 'lucide-react'

const navLinks = [
  { href: '#platform', label: 'Platform', isRoute: false },
  { href: '#features', label: 'Features', isRoute: false },
  { href: '#results', label: 'Results', isRoute: false },
  { href: '/pricing', label: 'Pricing', isRoute: true },
]

export function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeLink, setActiveLink] = useState('')

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleAnchorClick = (href: string) => {
    setActiveLink(href)
    setMobileOpen(false)
    // Smooth scroll for anchor links on same page
    if (href.startsWith('#')) {
      const el = document.querySelector(href)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-canvas/90 backdrop-blur-md border-b border-[var(--color-border)]'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center group-hover:bg-cyan/20 transition-colors">
              <TrendingUp size={16} className="text-cyan" />
            </div>
            <span className="font-display font-bold text-text-primary tracking-tight">
              FINFLOW
            </span>
            <span className="text-text-tertiary font-mono text-sm">/</span>
            <span className="font-mono text-text-secondary text-sm font-normal">ANALYTICS</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              link.isRoute ? (
                <Link
                  key={link.href}
                  href={link.href}
                  className="nav-link"
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.href}
                  href={link.href}
                  className={`nav-link ${activeLink === link.href ? 'active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault()
                    handleAnchorClick(link.href)
                  }}
                >
                  {link.label}
                </a>
              )
            ))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link href="/login" className="btn-ghost text-sm py-2 px-4">
              Login
            </Link>
            <a
              href="#demo"
              onClick={(e) => { e.preventDefault(); handleAnchorClick('#demo') }}
              className="btn-primary text-sm py-2 px-5"
            >
              Get Demo →
            </a>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed inset-x-0 top-[73px] z-40 bg-surface border-b border-[var(--color-border)] md:hidden"
          >
            <nav className="flex flex-col p-6 gap-4">
              {navLinks.map((link) => (
                link.isRoute ? (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-text-secondary hover:text-text-primary py-2 border-b border-[var(--color-border)] last:border-0"
                    onClick={() => setMobileOpen(false)}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-text-secondary hover:text-text-primary py-2 border-b border-[var(--color-border)] last:border-0"
                    onClick={(e) => {
                      e.preventDefault()
                      handleAnchorClick(link.href)
                    }}
                  >
                    {link.label}
                  </a>
                )
              ))}
              <div className="flex flex-col gap-3 pt-2">
                <Link href="/login" className="btn-ghost text-sm text-center" onClick={() => setMobileOpen(false)}>Login</Link>
                <a
                  href="#demo"
                  className="btn-primary text-sm text-center justify-center"
                  onClick={(e) => { e.preventDefault(); handleAnchorClick('#demo') }}
                >
                  Get Demo →
                </a>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
