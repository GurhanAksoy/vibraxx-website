'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface FinanceSummary {
  total_credits_sold: number
  total_credits_used: number
  total_admin_gifted: number
  total_transactions: number
  today_credits_sold: number
  today_transactions: number
  today_rounds_played: number
}

interface DailyRow {
  day: string
  credits_sold: number
  transactions: number
  rounds_played: number
}

interface RecentRow {
  id: number
  user_id: string
  full_name: string | null
  delta_paid: number
  reason: string
  created_at: string
}

interface FinanceStats {
  generated_at: string
  period_days: number
  summary: FinanceSummary
  daily: DailyRow[]
  recent: RecentRow[]
}

const fmt = (n?: number | null) => n?.toLocaleString() ?? '—'

const fmtDate = (dt: string) => new Date(dt).toUTCString().slice(5, 16)

const fmtAgo = (dt: string) => {
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)   return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

const reasonLabel = (reason: string) => {
  if (reason.startsWith('stripe_')) {
    const pkg = reason.split('_')[1]
    return `purchase · ${pkg}`
  }
  if (reason === 'join_live_round_paid') return 'round played'
  if (reason === 'admin_gift')           return 'admin gift'
  return reason
}

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminFinance() {
  const [data, setData]       = useState<FinanceStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [days, setDays]       = useState(30)

  const load = useCallback(async (d = days) => {
    setLoading(true)
    const { data: res, error: err } = await supabase.rpc('get_admin_finance_stats', { p_days: d })
    if (err) { setError(err.message); setLoading(false); return }
    setData(res as FinanceStats)
    setError(null)
    setLoading(false)
  }, [days])

  useEffect(() => { load() }, [load])

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>
  if (!data)   return null

  const { summary, daily, recent } = data

  return (
    <>
      <div className="page-title">Finance</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <div className="page-subtitle" style={{ margin: 0 }}>
          Credit economy · last {data.period_days} days
        </div>
        <span style={{ flex: 1 }} />
        {([7, 30, 90] as const).map(d => (
          <button
            key={d}
            className="admin-btn"
            style={{
              fontSize: 10, padding: '3px 10px',
              background:  days === d ? 'rgba(99,102,241,0.15)' : undefined,
              color:       days === d ? 'var(--accent2)'        : undefined,
              borderColor: days === d ? 'rgba(99,102,241,0.3)'  : undefined,
            }}
            onClick={() => { setDays(d); load(d) }}
          >
            {d}d
          </button>
        ))}
      </div>

      {/* ── today ── */}
      <div className="section-title">Today</div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Credits sold</div>
          <div className="stat-card-value success">{fmt(summary.today_credits_sold)}</div>
          <div className="stat-card-sub">{fmt(summary.today_transactions)} transactions</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Rounds played</div>
          <div className="stat-card-value accent">{fmt(summary.today_rounds_played)}</div>
          <div className="stat-card-sub">credits consumed</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Admin gifted (period)</div>
          <div className="stat-card-value">{fmt(summary.total_admin_gifted)}</div>
          <div className="stat-card-sub">total credits gifted</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Total transactions</div>
          <div className="stat-card-value">{fmt(summary.total_transactions)}</div>
          <div className="stat-card-sub">last {data.period_days} days</div>
        </div>
      </div>

      {/* ── period summary ── */}
      <div className="section-title">Period summary</div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Credits sold</div>
          <div className="stat-card-value success">{fmt(summary.total_credits_sold)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Credits used</div>
          <div className="stat-card-value">{fmt(summary.total_credits_used)}</div>
          <div className="stat-card-sub">rounds played</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Net balance</div>
          <div className={`stat-card-value ${(summary.total_credits_sold - summary.total_credits_used) >= 0 ? 'success' : 'danger'}`}>
            {fmt(summary.total_credits_sold - summary.total_credits_used)}
          </div>
          <div className="stat-card-sub">sold minus used</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Utilization</div>
          <div className="stat-card-value accent">
            {summary.total_credits_sold === 0
              ? '—'
              : `${Math.round((summary.total_credits_used / summary.total_credits_sold) * 100)}%`
            }
          </div>
          <div className="stat-card-sub">used / sold</div>
        </div>
      </div>

      {/* ── daily breakdown ── */}
      {daily.length > 0 && (
        <>
          <div className="section-title">Daily breakdown</div>
          <div className="admin-card" style={{ padding: 0, marginBottom: 24 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Credits sold</th>
                  <th>Transactions</th>
                  <th>Rounds played</th>
                </tr>
              </thead>
              <tbody>
                {daily.map(row => (
                  <tr key={row.day}>
                    <td className="mono">{fmtDate(row.day)}</td>
                    <td style={{ color: row.credits_sold > 0 ? 'var(--success)' : 'var(--muted)' }}>
                      {fmt(row.credits_sold)}
                    </td>
                    <td>{row.transactions > 0 ? row.transactions : <span className="muted">0</span>}</td>
                    <td className="muted">{fmt(row.rounds_played)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── recent transactions ── */}
      <div className="section-title">Recent ledger entries</div>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Delta</th>
              <th>Reason</th>
              <th>When</th>
            </tr>
          </thead>
          <tbody>
            {recent.map(row => (
              <tr key={row.id}>
                <td style={{ fontSize: 12 }}>{row.full_name ?? <span className="muted">—</span>}</td>
                <td style={{
                  fontWeight: 600,
                  color: row.delta_paid > 0 ? 'var(--success)' : 'var(--danger)',
                }}>
                  {row.delta_paid > 0 ? `+${row.delta_paid}` : row.delta_paid}
                </td>
                <td className="muted" style={{ fontSize: 11 }}>{reasonLabel(row.reason)}</td>
                <td className="muted">{fmtAgo(row.created_at)}</td>
              </tr>
            ))}
            {recent.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  no transactions
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
