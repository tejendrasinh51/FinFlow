'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Breadcrumbs } from '@/components/ui/Breadcrumbs'
import { Badge } from '@/components/ui/Badge'
import { DataTable, Column } from '@/components/ui/DataTable'
import { Modal } from '@/components/ui/Modal'
import { AlertBanner } from '@/components/ui/AlertBanner'
import { Plus, MoreHorizontal, Mail, Shield, UserX, UserCheck, ChevronDown } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────
type Role = 'admin' | 'analyst' | 'viewer'
type Status = 'active' | 'inactive' | 'pending'

interface User {
  id: string
  name: string
  email: string
  role: Role
  status: Status
  lastLogin: string
  joinDate: string
  org: string
}

// ── Mock data ─────────────────────────────────────────────────────────
const initialUsers: User[] = [
  { id: 'u1', name: 'Alex Kim', email: 'admin@finflow.io', role: 'admin', status: 'active', lastLogin: '2m ago', joinDate: 'Jan 12, 2026', org: 'Payflow Tech' },
  { id: 'u2', name: 'Sarah Chen', email: 'analyst@finflow.io', role: 'analyst', status: 'active', lastLogin: '1h ago', joinDate: 'Feb 5, 2026', org: 'Payflow Tech' },
  { id: 'u3', name: 'James Park', email: 'viewer@finflow.io', role: 'viewer', status: 'active', lastLogin: '3h ago', joinDate: 'Mar 18, 2026', org: 'Payflow Tech' },
  { id: 'u4', name: 'Priya Sharma', email: 'p.sharma@payflow.io', role: 'analyst', status: 'active', lastLogin: '1d ago', joinDate: 'Apr 2, 2026', org: 'Payflow Tech' },
  { id: 'u5', name: 'Carlos Rivera', email: 'c.rivera@payflow.io', role: 'viewer', status: 'pending', lastLogin: 'Never', joinDate: 'May 14, 2026', org: 'Payflow Tech' },
  { id: 'u6', name: 'Yuki Tanaka', email: 'y.tanaka@payflow.io', role: 'viewer', status: 'inactive', lastLogin: '2w ago', joinDate: 'Jan 30, 2026', org: 'Payflow Tech' },
  { id: 'u7', name: 'Omar Hassan', email: 'o.hassan@payflow.io', role: 'analyst', status: 'active', lastLogin: '30m ago', joinDate: 'Jun 8, 2026', org: 'Payflow Tech' },
  { id: 'u8', name: 'Mei Zhou', email: 'm.zhou@payflow.io', role: 'viewer', status: 'active', lastLogin: '2d ago', joinDate: 'Jul 22, 2026', org: 'Payflow Tech' },
]

// ── Invite Modal ──────────────────────────────────────────────────────
function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('viewer')
  const [sent, setSent] = useState(false)

  const handleInvite = async () => {
    setSent(true)
    await new Promise(r => setTimeout(r, 1000))
    onClose()
    setSent(false)
    setEmail('')
    setRole('viewer')
  }

  return (
    <Modal open={open} onClose={onClose} title="Invite Team Member" size="sm">
      <div className="space-y-4">
        <div>
          <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Email address</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="colleague@company.io"
            className="w-full px-4 py-3 bg-elevated border border-[var(--color-border)] rounded-lg text-text-primary placeholder:text-text-tertiary font-mono text-sm focus:outline-none focus:border-cyan/40 transition-all"
          />
        </div>
        <div>
          <label className="block text-text-secondary text-xs font-mono uppercase tracking-wider mb-2">Role</label>
          <div className="grid grid-cols-3 gap-2">
            {(['admin', 'analyst', 'viewer'] as Role[]).map(r => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`py-2.5 rounded-lg border text-xs font-mono capitalize transition-all ${role === r
                    ? r === 'admin' ? 'bg-cyan/10 border-cyan/30 text-cyan'
                      : r === 'analyst' ? 'bg-positive/10 border-positive/30 text-positive'
                        : 'bg-elevated border-[var(--color-border-strong)] text-text-primary'
                    : 'bg-elevated border-[var(--color-border)] text-text-tertiary hover:text-text-secondary'
                  }`}
              >
                {r}
              </button>
            ))}
          </div>
          <p className="text-text-tertiary text-[10px] font-mono mt-2">
            {role === 'admin' ? 'Full access — manage users, settings, and all data' :
              role === 'analyst' ? 'Can view and create reports, export data' :
                'Read-only access to dashboards and published reports'}
          </p>
        </div>
        <div className="pt-2">
          <button
            onClick={handleInvite}
            disabled={!email || sent}
            className="w-full btn-primary py-3 justify-center text-sm disabled:opacity-50"
          >
            {sent ? (
              <>
                <svg className="animate-spin h-4 w-4 text-canvas" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Sending invite…
              </>
            ) : (
              <><Mail size={15} /> Send Invite</>
            )}
          </button>
        </div>
      </div>
    </Modal>
  )
}

// ── Role change dropdown ──────────────────────────────────────────────
function RoleDropdown({ user, onChange }: { user: User; onChange: (role: Role) => void }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open) }}
        className="flex items-center gap-1"
      >
        <Badge variant={user.role}>{user.role}</Badge>
        <ChevronDown size={11} className="text-text-tertiary" />
      </button>
      {open && (
        <div className="absolute left-0 top-8 z-20 card shadow-cyan-md w-32 p-1">
          {(['admin', 'analyst', 'viewer'] as Role[]).map(r => (
            <button
              key={r}
              onClick={() => { onChange(r); setOpen(false) }}
              className="w-full text-left px-3 py-2 text-xs font-mono text-text-secondary hover:bg-elevated hover:text-text-primary rounded-md capitalize transition-colors"
            >
              {r}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────
export default function UsersPage() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [inviteOpen, setInvite] = useState(false)

  const handleRoleChange = (userId: string, role: Role) => {
    setUsers(u => u.map(user => user.id === userId ? { ...user, role } : user))
  }

  const handleToggleStatus = (userId: string) => {
    setUsers(u => u.map(user =>
      user.id === userId
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ))
  }

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'User',
      sortable: true,
      render: row => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-cyan/10 border border-cyan/20 flex items-center justify-center flex-shrink-0">
            <span className="text-cyan font-mono font-bold text-[10px]">
              {row.name.split(' ').map(n => n[0]).join('')}
            </span>
          </div>
          <div>
            <div className="text-text-primary text-xs font-medium">{row.name}</div>
            <div className="text-text-tertiary text-[10px] font-mono">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      render: row => (
        <RoleDropdown user={row} onChange={role => handleRoleChange(row.id, role)} />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: row => (
        <Badge
          variant={row.status === 'active' ? 'active' : row.status === 'pending' ? 'warning' : 'inactive'}
          dot
        >
          {row.status}
        </Badge>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last Login',
      sortable: true,
      render: row => <span className="text-text-tertiary text-xs font-mono">{row.lastLogin}</span>,
    },
    {
      key: 'joinDate',
      header: 'Joined',
      sortable: true,
      render: row => <span className="text-text-secondary text-xs">{row.joinDate}</span>,
    },
  ]

  const rowActions = (row: User) => (
    <div className="flex items-center gap-1 justify-end">
      <button
        onClick={() => handleToggleStatus(row.id)}
        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${row.status === 'active'
            ? 'text-text-tertiary hover:text-negative hover:bg-negative/5'
            : 'text-text-tertiary hover:text-positive hover:bg-positive/5'
          }`}
        title={row.status === 'active' ? 'Deactivate' : 'Activate'}
      >
        {row.status === 'active' ? <UserX size={13} /> : <UserCheck size={13} />}
      </button>
      <button className="w-7 h-7 rounded-lg flex items-center justify-center text-text-tertiary hover:text-cyan hover:bg-cyan/5 transition-all" title="Send email">
        <Mail size={13} />
      </button>
    </div>
  )

  const active = users.filter(u => u.status === 'active').length
  const pending = users.filter(u => u.status === 'pending').length
  const admins = users.filter(u => u.role === 'admin').length

  return (
    <div className="max-w-[1400px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <Breadcrumbs crumbs={[{ label: 'Users' }]} />
          <h1 className="font-display font-bold text-2xl text-text-primary mt-2">User Management</h1>
          <p className="text-text-secondary text-sm font-mono mt-1">{users.length} members · {active} active</p>
        </div>
        <button onClick={() => setInvite(true)} className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2">
          <Plus size={15} /> Invite Member
        </button>
      </div>

      {/* Alert for pending */}
      {pending > 0 && (
        <AlertBanner
          type="info"
          title={`${pending} pending invitation${pending > 1 ? 's' : ''}`}
          message="Some team members haven't accepted their invitations yet."
          action={{ label: 'Resend all invites', onClick: () => { } }}
        />
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Members', value: users.length, color: 'text-text-primary' },
          { label: 'Active', value: active, color: 'text-positive' },
          { label: 'Pending', value: pending, color: 'text-warning' },
          { label: 'Admins', value: admins, color: 'text-cyan' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="card p-4 text-center">
            <div className={`font-mono font-bold text-2xl ${s.color}`}>{s.value}</div>
            <div className="text-text-tertiary text-xs mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Role distribution */}
      <div className="grid grid-cols-3 gap-3">
        {(['admin', 'analyst', 'viewer'] as Role[]).map(role => {
          const count = users.filter(u => u.role === role).length
          const pct = Math.round((count / users.length) * 100)
          return (
            <div key={role} className="card p-4">
              <div className="flex items-center justify-between mb-3">
                <Badge variant={role}>{role}</Badge>
                <span className="font-mono text-text-primary font-medium">{count}</span>
              </div>
              <div className="h-1 bg-elevated rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: role === 'admin' ? 'var(--color-cyan)' : role === 'analyst' ? 'var(--color-positive)' : 'var(--color-neutral)',
                  }}
                />
              </div>
              <div className="text-text-tertiary text-[10px] font-mono mt-2">{pct}% of team</div>
            </div>
          )
        })}
      </div>

      {/* DataTable */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-6">
        <DataTable
          columns={columns}
          data={users}
          searchPlaceholder="Search users by name or email…"
          pageSize={8}
          actions={rowActions}
          emptyMessage="No users found."
        />
      </motion.div>

      <InviteModal open={inviteOpen} onClose={() => setInvite(false)} />
    </div>
  )
}
