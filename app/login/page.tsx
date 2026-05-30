'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { TrendingUp, Eye, EyeOff, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2, Building, Send } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

// Demo accounts for testing (no backend needed)
const DEMO_ACCOUNTS = [
  { email: 'admin@finflow.io', password: 'Admin123!', role: 'admin', name: 'Alex Kim' },
  { email: 'analyst@finflow.io', password: 'Analyst123!', role: 'analyst', name: 'Sarah Chen' },
  { email: 'viewer@finflow.io', password: 'Viewer123!', role: 'viewer', name: 'James Park' },
]

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  // Parse URL query parameter safely on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('request') === 'true') {
        setRequestOpen(true)
      }
    }
  }, [])

  // Request Access modal state
  const [requestOpen, setRequestOpen] = useState(false)
  const [requestName, setRequestName] = useState('')
  const [requestEmail, setRequestEmail] = useState('')
  const [requestOrg, setRequestOrg] = useState('')
  const [requestNote, setRequestNote] = useState('')
  const [requestLoading, setRequestLoading] = useState(false)
  const [requestSuccess, setRequestSuccess] = useState(false)
  const [requestError, setRequestError] = useState('')

  const handleRequestAccess = async (e: React.FormEvent) => {
    e.preventDefault()
    setRequestError('')
    setRequestLoading(true)

    try {
      const res = await fetch('/api/auth/request-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: requestName,
          email: requestEmail,
          orgName: requestOrg,
          note: requestNote,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setRequestSuccess(true)
      } else {
        setRequestError(data.error || 'Failed to submit application. Please try again.')
      }
    } catch (err) {
      setRequestError('Connection failed. Verify server status.')
    } finally {
      setRequestLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setSuccess(true)
        await new Promise(r => setTimeout(r, 600))
        router.push('/dashboard')
      } else {
        setLoading(false)
        setError(data.error || 'Invalid email or password. Try a demo account below.')
      }
    } catch (err) {
      setLoading(false)
      setError('Connection failed. Verify database and Redis server statuses.')
    }
  }

  const fillDemo = (account: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(account.email)
    setPassword(account.password)
    setError('')
  }

  return (
    <div className="min-h-screen bg-canvas flex relative overflow-hidden">
      {/* Animated grid background */}
      <div className="hero-grid" aria-hidden />

      {/* Left glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 60% 80% at 0% 50%, rgba(0,212,255,0.05) 0%, transparent 60%)',
        }}
      />

      {/* ── Left panel (branding) ─────────────────── */}
      <div className="hidden lg:flex lg:w-[55%] flex-col justify-between p-16 relative">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center">
            <TrendingUp size={18} className="text-cyan" />
          </div>
          <span className="font-display font-bold text-text-primary text-lg tracking-tight">FINFLOW</span>
          <span className="text-text-tertiary font-mono">/</span>
          <span className="font-mono text-text-secondary text-sm">ANALYTICS</span>
        </Link>

        {/* Center content */}
        <div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="section-label mb-6">Trusted by 10,000+ users</div>
            <h1 className="text-h2 mb-6">
              Unified financial
              <br />
              intelligence,{' '}
              <span className="gradient-text">live.</span>
            </h1>
            <p className="text-text-secondary text-lg leading-relaxed max-w-md">
              Real-time P&L, MRR/ARR tracking, RBAC controls, and one-click exports —
              all in one executive dashboard.
            </p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-12 grid grid-cols-3 gap-6"
          >
            {[
              { val: '99.9%', lbl: 'Uptime SLA' },
              { val: '<200ms', lbl: 'WS Latency' },
              { val: '−60%', lbl: 'Report Time' },
            ].map(s => (
              <div key={s.lbl}>
                <div className="font-mono font-medium text-xl text-cyan">{s.val}</div>
                <div className="text-text-tertiary text-xs mt-0.5">{s.lbl}</div>
              </div>
            ))}
          </motion.div>

          {/* Mini dashboard preview */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="mt-10 card p-5 max-w-md"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="live-dot" />
              <span className="text-positive font-mono text-xs">LIVE METRICS</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'MRR', value: '$1.24M', trend: '+12.4%' },
                { label: 'ARR', value: '$14.9M', trend: '+8.2%' },
                { label: 'Churn', value: '2.1%', trend: '−0.3pp' },
                { label: 'DAU', value: '10,247', trend: '+18.6%' },
              ].map(m => (
                <div key={m.label} className="bg-elevated rounded-lg p-3">
                  <div className="text-text-tertiary text-[10px] font-mono">{m.label}</div>
                  <div className="text-text-primary font-mono font-medium text-sm mt-0.5">{m.value}</div>
                  <div className="text-positive text-[10px] font-mono mt-0.5">↑ {m.trend}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <p className="text-text-tertiary text-xs font-mono">
          © 2026 FinFlow Analytics · Enterprise Financial Intelligence
        </p>
      </div>

      {/* ── Right panel (form) ───────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Mobile logo */}
          <Link href="/" className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-cyan/10 border border-cyan/30 flex items-center justify-center">
              <TrendingUp size={15} className="text-cyan" />
            </div>
            <span className="font-display font-bold">FINFLOW</span>
          </Link>

          <div className="mb-8">
            <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
              Welcome back
            </h2>
            <p className="text-text-secondary text-sm">
              Sign in to your FinFlow dashboard.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@finflow.io"
                  required
                  autoComplete="email"
                  className="w-full pl-10 pr-4 py-3 bg-surface border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/50 focus:ring-2 focus:ring-cyan/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-text-secondary text-xs font-mono uppercase tracking-wider"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert('To reset your password, contact your workspace administrator or email support@finflow.io')}
                  className="text-cyan text-xs hover:underline bg-transparent border-0 p-0 cursor-pointer font-mono"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full pl-10 pr-12 py-3 bg-surface border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/50 focus:ring-2 focus:ring-cyan/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-negative/10 border border-negative/20 text-negative text-sm"
              >
                <AlertCircle size={15} className="flex-shrink-0" />
                {error}
              </motion.div>
            )}

            {/* Success */}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2.5 p-3 rounded-lg bg-positive/10 border border-positive/20 text-positive text-sm"
              >
                <CheckCircle2 size={15} className="flex-shrink-0" />
                Login successful! Redirecting to dashboard…
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || success}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full btn-primary py-3.5 justify-center text-base mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && !success ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-canvas" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                <>Sign in <ArrowRight size={17} /></>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-[var(--color-border)]" />
            <span className="text-text-tertiary text-xs font-mono">demo accounts</span>
            <div className="flex-1 h-px bg-[var(--color-border)]" />
          </div>

          {/* Demo account quick-fill */}
          <div className="space-y-2">
            {DEMO_ACCOUNTS.map(account => (
              <button
                key={account.email}
                type="button"
                onClick={() => fillDemo(account)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface border border-[var(--color-border)] hover:border-cyan/30 hover:bg-elevated rounded-lg transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-cyan font-mono font-bold text-[10px]">
                      {account.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div className="text-left">
                    <div className="text-text-primary text-xs font-medium">{account.name}</div>
                    <div className="text-text-tertiary text-[10px] font-mono">{account.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="text-[9px] font-mono px-1.5 py-0.5 rounded border capitalize"
                    style={{
                      color: account.role === 'admin' ? 'var(--color-cyan)' :
                        account.role === 'analyst' ? 'var(--color-positive)' :
                          'var(--color-text-tertiary)',
                      borderColor: account.role === 'admin' ? 'rgba(0,212,255,0.3)' :
                        account.role === 'analyst' ? 'rgba(16,185,129,0.3)' :
                          'var(--color-border)',
                      background: account.role === 'admin' ? 'rgba(0,212,255,0.08)' :
                        account.role === 'analyst' ? 'rgba(16,185,129,0.08)' :
                          'transparent',
                    }}
                  >
                    {account.role}
                  </span>
                  <ArrowRight size={12} className="text-text-tertiary group-hover:text-cyan transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-text-tertiary text-xs text-center mt-6 font-mono">
            No account?{' '}
            <button
              type="button"
              onClick={() => setRequestOpen(true)}
              className="text-cyan hover:underline bg-transparent border-0 p-0 cursor-pointer font-mono inline"
            >
              Request access →
            </button>
          </p>
        </motion.div>
      </div>

      {/* Request Access Modal */}
      <Modal
        open={requestOpen}
        onClose={() => {
          setRequestOpen(false)
          if (requestSuccess) {
            setRequestName('')
            setRequestEmail('')
            setRequestOrg('')
            setRequestNote('')
            setRequestSuccess(false)
            setRequestError('')
          }
        }}
        title="Request Workspace Access"
      >
        {requestSuccess ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-positive/10 border border-positive/20 flex items-center justify-center mx-auto mb-4 animate-bounce">
              <CheckCircle2 size={24} className="text-positive" />
            </div>
            <h3 className="font-display font-semibold text-lg text-text-primary mb-2">
              Application Submitted
            </h3>
            <p className="text-text-secondary text-sm max-w-sm mx-auto mb-6 leading-relaxed">
              Thank you for requesting access! Administrators have been notified, and we will follow up with you via email.
            </p>
            <button
              type="button"
              onClick={() => {
                setRequestOpen(false)
                setRequestName('')
                setRequestEmail('')
                setRequestOrg('')
                setRequestNote('')
                setRequestSuccess(false)
                setRequestError('')
              }}
              className="btn-primary px-6 py-2.5 mx-auto text-sm"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleRequestAccess} className="space-y-4">
            <p className="text-text-secondary text-xs leading-relaxed mb-4">
              Submit your details to request access to the FinFlow Analytics enterprise dashboard. A site administrator will review and authorize your workspace.
            </p>

            {/* Name */}
            <div>
              <label htmlFor="req-name" className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                id="req-name"
                type="text"
                value={requestName}
                onChange={e => setRequestName(e.target.value)}
                placeholder="Alex Carter"
                required
                className="w-full px-4 py-2.5 bg-surface border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/50 focus:ring-2 focus:ring-cyan/10 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="req-email" className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">
                Work Email
              </label>
              <input
                id="req-email"
                type="email"
                value={requestEmail}
                onChange={e => setRequestEmail(e.target.value)}
                placeholder="alex@company.com"
                required
                className="w-full px-4 py-2.5 bg-surface border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/50 focus:ring-2 focus:ring-cyan/10 transition-all"
              />
            </div>

            {/* Organization */}
            <div>
              <label htmlFor="req-org" className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">
                Organization Name
              </label>
              <div className="relative">
                <Building size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
                <input
                  id="req-org"
                  type="text"
                  value={requestOrg}
                  onChange={e => setRequestOrg(e.target.value)}
                  placeholder="Acme Corp"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-surface border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/50 focus:ring-2 focus:ring-cyan/10 transition-all"
                />
              </div>
            </div>

            {/* Additional Note */}
            <div>
              <label htmlFor="req-note" className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">
                Note to Administrator (Optional)
              </label>
              <textarea
                id="req-note"
                value={requestNote}
                onChange={e => setRequestNote(e.target.value)}
                placeholder="Tell us about your team and use-case..."
                rows={3}
                className="w-full px-4 py-2.5 bg-surface border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/50 focus:ring-2 focus:ring-cyan/10 transition-all resize-none"
              />
            </div>

            {/* Error Message */}
            {requestError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-negative/10 border border-negative/20 text-negative text-sm">
                <AlertCircle size={15} className="flex-shrink-0" />
                {requestError}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setRequestOpen(false)}
                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={requestLoading}
                className="btn-primary px-5 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {requestLoading ? 'Submitting...' : (
                  <>
                    Submit Request
                    <Send size={14} className="ml-1.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}
