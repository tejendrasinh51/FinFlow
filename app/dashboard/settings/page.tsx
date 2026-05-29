'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Tabs } from '@/components/ui/Tabs'
import { StatBar } from '@/components/ui/StatBar'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Badge } from '@/components/ui/Badge'
import {
  Building2, Key, Puzzle, CreditCard, Bell,
  Copy, Check, RefreshCw, Eye, EyeOff,
  CheckCircle2, Zap, Globe, Database, Mail as MailIcon
} from 'lucide-react'

const Slack = ({ size = 18, className = "" }: { size?: number; className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect width="3" height="8" rx="1.5" x="13" y="2" />
    <path d="M19 8.5V10h-1.5A1.5 1.5 0 1 1 19 8.5z" />
    <rect width="8" height="3" rx="1.5" x="14" y="13" />
    <path d="M15.5 19H14v-1.5a1.5 1.5 0 1 1 1.5 1.5z" />
    <rect width="3" height="8" rx="1.5" x="8" y="14" />
    <path d="M5 15.5V14h1.5A1.5 1.5 0 1 1 5 15.5z" />
    <rect width="8" height="3" rx="1.5" x="2" y="8" />
    <path d="M8.5 5H10v1.5A1.5 1.5 0 1 1 8.5 5z" />
  </svg>
)

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'api', label: 'API Keys' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'billing', label: 'Billing' },
  { id: 'notifications', label: 'Notifications' },
]

// ── General ──────────────────────────────────────────────────────────
function GeneralTab() {
  const [orgName, setOrgName] = useState('Payflow Technologies')
  const [domain, setDomain] = useState('payflow.io')
  const [saved, setSaved] = useState(false)

  const handleSave = async () => {
    await new Promise(r => setTimeout(r, 600))
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="card p-6 space-y-5">
        <h3 className="font-display font-semibold text-lg">Organisation Details</h3>
        {[
          { label: 'Organisation Name', value: orgName, onChange: setOrgName, placeholder: 'Acme Corp' },
          { label: 'Primary Domain', value: domain, onChange: setDomain, placeholder: 'company.io' },
        ].map(field => (
          <div key={field.label}>
            <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">{field.label}</label>
            <input
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              placeholder={field.placeholder}
              className="w-full px-4 py-3 bg-elevated border border-[var(--color-border)] rounded-lg text-text-primary font-mono text-sm focus:outline-none focus:border-cyan/40 focus:ring-1 focus:ring-cyan/10 transition-all"
            />
          </div>
        ))}
        <div>
          <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Current Plan</label>
          <div className="flex items-center gap-3 px-4 py-3 bg-elevated border border-cyan/20 rounded-lg">
            <Badge variant="admin">Enterprise</Badge>
            <span className="text-text-primary text-sm font-medium">Enterprise Plan</span>
            <span className="text-text-tertiary text-xs font-mono ml-auto">Renews Jan 1, 2026</span>
          </div>
        </div>
        <button onClick={handleSave} className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
          {saved ? <><CheckCircle2 size={15} /> Saved!</> : 'Save Changes'}
        </button>
      </div>

      {/* Danger zone */}
      <div className="card p-6 border-negative/20">
        <h3 className="font-display font-semibold text-lg text-negative mb-4">Danger Zone</h3>
        <div className="space-y-3">
          {[
            { label: 'Export all data', desc: 'Download a complete archive of your organisation\'s data', btn: 'Export', btnClass: 'btn-ghost' },
            { label: 'Delete organisation', desc: 'Permanently delete this organisation and all associated data', btn: 'Delete', btnClass: 'bg-negative/10 border border-negative/30 text-negative hover:bg-negative/20 btn-ghost' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between p-4 bg-negative/[0.03] border border-negative/10 rounded-xl">
              <div>
                <div className="text-text-primary text-sm font-medium">{item.label}</div>
                <div className="text-text-tertiary text-xs mt-0.5 max-w-sm">{item.desc}</div>
              </div>
              <button className={`${item.btnClass} text-sm py-1.5 px-4 ml-4 flex-shrink-0`}>{item.btn}</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── API Keys ─────────────────────────────────────────────────────────
function ApiTab() {
  const [copied, setCopied] = useState<string | null>(null)
  const [revealed, setRevealed] = useState<string | null>(null)

  const keys = [
    { id: 'k1', name: 'Production API Key', key: 'ff_live_sk_Kx9mN2pQ8vRt3wLjA5bZ7cHn', env: 'live', created: 'Jan 12, 2026', lastUsed: '2m ago' },
    { id: 'k2', name: 'Test API Key', key: 'ff_test_sk_Yz4nP6qS1uXd8eGk0mJv2bTr', env: 'test', created: 'Jan 12, 2026', lastUsed: '3d ago' },
    { id: 'k3', name: 'Webhook Secret', key: 'whsec_Mn5pQ2rT8vLk0bZj6cHn9wAx', env: 'webhook', created: 'Feb 5, 2026', lastUsed: '1h ago' },
  ]

  const maskKey = (k: string) => k.slice(0, 12) + '•'.repeat(20) + k.slice(-4)

  const handleCopy = (id: string, key: string) => {
    navigator.clipboard.writeText(key)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <AlertBanner
        type="warning"
        title="Keep your API keys secret"
        message="Never expose secret keys in client-side code, public repos, or logs. Rotate immediately if compromised."
      />
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-lg">API Keys</h3>
          <button className="btn-primary text-sm py-2 px-4 flex items-center gap-2">
            <Key size={13} /> Generate Key
          </button>
        </div>
        <div className="space-y-3">
          {keys.map(k => (
            <div key={k.id} className="bg-elevated border border-[var(--color-border)] rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-text-primary text-sm font-medium">{k.name}</span>
                    <Badge variant={k.env === 'live' ? 'danger' : k.env === 'test' ? 'warning' : 'default'}>
                      {k.env}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <code className="text-text-secondary font-mono text-xs bg-canvas px-3 py-1.5 rounded-md flex-1 truncate">
                      {revealed === k.id ? k.key : maskKey(k.key)}
                    </code>
                    <button
                      onClick={() => setRevealed(revealed === k.id ? null : k.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-text-secondary hover:bg-canvas transition-all"
                    >
                      {revealed === k.id ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                    <button
                      onClick={() => handleCopy(k.id, k.key)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-cyan hover:bg-cyan/5 transition-all"
                    >
                      {copied === k.id ? <Check size={13} className="text-positive" /> : <Copy size={13} />}
                    </button>
                    <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-warning hover:bg-warning/5 transition-all" title="Rotate">
                      <RefreshCw size={13} />
                    </button>
                  </div>
                  <div className="flex gap-4 mt-2 text-[10px] font-mono text-text-tertiary">
                    <span>Created {k.created}</span>
                    <span>·</span>
                    <span>Last used {k.lastUsed}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Integrations ──────────────────────────────────────────────────────
const integrations = [
  { name: 'Slack', desc: 'Send metric alerts and report summaries to Slack channels', icon: Slack, connected: true, plan: 'all' },
  { name: 'Stripe', desc: 'Sync payment data, MRR, and subscription metrics', icon: Zap, connected: true, plan: 'all' },
  { name: 'HubSpot CRM', desc: 'Unify customer revenue data with your CRM pipeline', icon: Globe, connected: false, plan: 'growth+' },
  { name: 'PostgreSQL', desc: 'Connect your own PostgreSQL instance as a data source', icon: Database, connected: true, plan: 'enterprise' },
  { name: 'SendGrid', desc: 'Deliver scheduled reports via transactional email', icon: MailIcon, connected: false, plan: 'all' },
  { name: 'Zapier', desc: 'Automate workflows with 3,000+ app connections', icon: Zap, connected: false, plan: 'growth+' },
]

function IntegrationsTab() {
  const [states, setStates] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map(i => [i.name, i.connected]))
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      {integrations.map(int => (
        <div key={int.name} className="card p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${states[int.name] ? 'bg-cyan/10 border-cyan/20' : 'bg-elevated border-[var(--color-border)]'}`}>
                <int.icon size={18} className={states[int.name] ? 'text-cyan' : 'text-text-tertiary'} />
              </div>
              <div>
                <div className="text-text-primary text-sm font-medium">{int.name}</div>
                <Badge variant={int.plan === 'enterprise' ? 'admin' : int.plan === 'growth+' ? 'analyst' : 'default'} className="mt-1">
                  {int.plan}
                </Badge>
              </div>
            </div>
            {/* Toggle */}
            <button
              onClick={() => setStates(s => ({ ...s, [int.name]: !s[int.name] }))}
              className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 mt-0.5 ${states[int.name] ? 'bg-cyan/70' : 'bg-elevated border border-[var(--color-border)]'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${states[int.name] ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <p className="text-text-tertiary text-xs mt-3 leading-relaxed">{int.desc}</p>
          {states[int.name] && (
            <div className="flex items-center gap-1.5 mt-3 text-positive text-[10px] font-mono">
              <CheckCircle2 size={11} /> Connected
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Billing ───────────────────────────────────────────────────────────
function BillingTab() {
  const usage = [
    { label: 'API Requests', value: 84200, max: 100000, suffix: ' req', color: 'var(--color-cyan)' },
    { label: 'Team Members', value: 8, max: 25, suffix: ' users', color: 'var(--color-positive)' },
    { label: 'Storage', value: 12.4, max: 50, suffix: ' GB', color: 'var(--color-warning)' },
    { label: 'Exports this month', value: 47, max: 200, suffix: ' files', color: 'var(--color-cyan)' },
  ]

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Current plan */}
      <div className="card p-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan to-transparent" />
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-display font-semibold text-lg">Enterprise Plan</h3>
              <Badge variant="admin" dot>Active</Badge>
            </div>
            <p className="text-text-secondary text-sm">$2,400 / month · Annual billing</p>
          </div>
          <div className="text-right">
            <div className="font-mono font-medium text-2xl text-cyan">$2,400</div>
            <div className="text-text-tertiary text-xs font-mono">per month</div>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex flex-wrap gap-x-6 gap-y-2">
          {['Unlimited reports', 'Up to 25 users', '100K API req/mo', 'Priority support', 'SOC 2 Type II', 'Custom SLA'].map(f => (
            <div key={f} className="flex items-center gap-1.5 text-text-secondary text-xs">
              <CheckCircle2 size={12} className="text-positive" /> {f}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-3">
          <button className="btn-ghost text-sm py-2 px-4">Manage billing</button>
          <button className="btn-ghost text-sm py-2 px-4">View invoices</button>
        </div>
      </div>

      {/* Usage */}
      <div className="card p-6 space-y-5">
        <h3 className="font-display font-semibold text-lg">Usage This Month</h3>
        {usage.map(u => (
          <StatBar
            key={u.label}
            label={u.label}
            value={u.value}
            max={u.max}
            suffix={u.suffix}
            color={u.color}
            sublabel={`/ ${u.max}${u.suffix}`}
          />
        ))}
      </div>
    </div>
  )
}

// ── Notifications ─────────────────────────────────────────────────────
const notifSettings = [
  {
    group: 'Metric Alerts', items: [
      { id: 'churn_spike', label: 'Churn spike', desc: 'When churn exceeds threshold' },
      { id: 'mrr_milestone', label: 'MRR milestone', desc: 'On reaching MRR targets' },
      { id: 'low_cashflow', label: 'Low cashflow warning', desc: 'When net cashflow drops below 20%' },
    ]
  },
  {
    group: 'Reports', items: [
      { id: 'report_ready', label: 'Export ready', desc: 'When an export job completes' },
      { id: 'report_shared', label: 'Report shared', desc: 'When someone shares a report with you' },
      { id: 'scheduled_sent', label: 'Scheduled report sent', desc: 'Confirmation after delivery' },
    ]
  },
  {
    group: 'Team & Security', items: [
      { id: 'new_login', label: 'New sign-in', desc: 'Alert on new device login' },
      { id: 'invite_accepted', label: 'Invite accepted', desc: 'When a pending invite is accepted' },
      { id: 'role_changed', label: 'Role changed', desc: 'When a user role is modified' },
    ]
  },
]

function NotificationsTab() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    churn_spike: true, mrr_milestone: true, low_cashflow: true,
    report_ready: true, report_shared: false, scheduled_sent: true,
    new_login: true, invite_accepted: true, role_changed: false,
  })

  return (
    <div className="space-y-6 max-w-2xl">
      {notifSettings.map(group => (
        <div key={group.group} className="card p-6">
          <h3 className="font-display font-semibold text-base mb-4 text-text-primary">{group.group}</h3>
          <div className="space-y-4">
            {group.items.map(item => (
              <div key={item.id} className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-text-primary text-sm font-medium">{item.label}</div>
                  <div className="text-text-tertiary text-xs mt-0.5">{item.desc}</div>
                </div>
                <button
                  onClick={() => setEnabled(s => ({ ...s, [item.id]: !s[item.id] }))}
                  className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${enabled[item.id] ? 'bg-cyan/70' : 'bg-elevated border border-[var(--color-border)]'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${enabled[item.id] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
const TAB_ICONS = { general: Building2, api: Key, integrations: Puzzle, billing: CreditCard, notifications: Bell }

export default function SettingsPage() {
  const [tab, setTab] = useState('general')

  const tabsWithIcons = TABS.map(t => ({ ...t, label: t.label }))

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div>
        <Breadcrumbs crumbs={[{ label: 'Settings' }]} />
        <h1 className="font-display font-bold text-2xl text-text-primary mt-2">Settings</h1>
        <p className="text-text-secondary text-sm font-mono mt-1">Manage your organisation preferences and integrations</p>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabsWithIcons} activeTab={tab} onChange={setTab} />

      {/* Content */}
      <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
        {tab === 'general' && <GeneralTab />}
        {tab === 'api' && <ApiTab />}
        {tab === 'integrations' && <IntegrationsTab />}
        {tab === 'billing' && <BillingTab />}
        {tab === 'notifications' && <NotificationsTab />}
      </motion.div>
    </div>
  )
}
