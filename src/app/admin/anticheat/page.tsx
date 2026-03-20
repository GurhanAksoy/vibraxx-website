'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface SummaryRow {
  code: string
  total: number
  unique_users: number
  critical_count: number
  high_count: number
  medium_count: number
  warning_count: number
  last_seen: string
}

interface TopUser {
  user_id: string
  full_name: string | null
  event_count: number
  unique_codes: number
  last_event_at: string
  codes: string[]
}

interface SecurityEvent {
  id: number
  severity: string
  code: string
  user_id: string
  full_name: string | null
  metadata: Record<string, any>
  created_at: string
}

const fmtAgo = (dt: string) => {
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)    return `${sec}s ago`
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

const CODE_LABELS: Record<string, string> = {
  rapid_answers:  'Rapid Answers',
  abnormal_score: 'Abnormal Score',
  repeat_perfect: 'Repeat Perfect',
  credit_abuse:   'Credit Abuse',
}

const SEV_ORDER: Record<string, number> = {
  critical: 0, high: 1, medium: 2, warning: 3,
}

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminAnticheat() {
  const [summary,   setSummary]   = useState<SummaryRow[]>([])
  const [topUsers,  setTopUsers]  = useState<TopUser[]>([])
  const [events,    setEvents]    = useState<SecurityEvent[]>([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [expanded,  setExpanded]  = useState<number | null>(null)
  const [codeFilter, setCodeFilter] = useState<string>('all')
  const [sevFilter,  setSevFilter]  = useState<string>('all')

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase.rpc('get_admin_anticheat_stats')
    if (err) { setError(err.message); setLoading(false); return }
    const d = data as { summary: SummaryRow[]; top_users: TopUser[]; events: SecurityEvent[] }
    setSummary(d.summary   ?? [])
    setTopUsers(d.top_users ?? [])
    setEvents(d.events     ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const totalEvents   = summary.reduce((a, r) => a + r.total, 0)
  const totalCritical = summary.reduce((a, r) => a + r.critical_count, 0)
  const totalHigh     = summary.reduce((a, r) => a + r.high_count, 0)
  const totalUsers    = new Set(events.map(e => e.user_id)).size

  const filteredEvents = events.filter(e => {
    if (codeFilter !== 'all' && e.code !== codeFilter) return false
    if (sevFilter  !== 'all' && e.severity !== sevFilter)  return false
    return true
  })

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>

  return (
    <>
      <div className="page-title">Anti-Cheat</div>
      <div className="page-subtitle">Security event monitoring — last 7 days</div>

      {/* ── stat cards ── */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Events</div>
          <div className="stat-card-value">{totalEvents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Critical</div>
          <div className="stat-card-value" style={{ color: 'var(--danger)' }}>{totalCritical}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">High</div>
          <div className="stat-card-value" style={{ color: 'var(--warn)' }}>{totalHigh}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Flagged Users</div>
          <div className="stat-card-value">{totalUsers}</div>
        </div>
      </div>

      {/* ── summary by code ── */}
      {summary.length > 0 && (
        <>
          <div className="section-title">Event breakdown</div>
          <div className="admin-card" style={{ padding: 0, marginBottom: 24 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Total</th>
                  <th>Users</th>
                  <th>Critical</th>
                  <th>High</th>
                  <th>Medium</th>
                  <th>Warning</th>
                  <th>Last seen</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(r => (
                  <tr key={r.code}>
                    <td>
                      <span className="badge info" style={{ fontSize: 10 }}>
                        {CODE_LABELS[r.code] ?? r.code}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700 }}>{r.total}</td>
                    <td className="muted">{r.unique_users}</td>
                    <td style={{ color: r.critical_count > 0 ? 'var(--danger)' : 'var(--text-muted)', fontWeight: r.critical_count > 0 ? 700 : 400 }}>{r.critical_count}</td>
                    <td style={{ color: r.high_count > 0 ? 'var(--warn)' : 'var(--text-muted)' }}>{r.high_count}</td>
                    <td className="muted">{r.medium_count}</td>
                    <td className="muted">{r.warning_count}</td>
                    <td className="muted">{fmtAgo(r.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── top flagged users ── */}
      {topUsers.length > 0 && (
        <>
          <div className="section-title">Top flagged users</div>
          <div className="admin-card" style={{ padding: 0, marginBottom: 24 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Events</th>
                  <th>Codes</th>
                  <th>Last event</th>
                </tr>
              </thead>
              <tbody>
                {topUsers.map(u => (
                  <tr key={u.user_id}>
                    <td style={{ fontSize: 12 }}>{u.full_name ?? u.user_id.slice(0, 8)}</td>
                    <td style={{ fontWeight: 700, color: u.event_count >= 5 ? 'var(--danger)' : u.event_count >= 3 ? 'var(--warn)' : 'var(--text)' }}>
                      {u.event_count}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {u.codes.map(c => (
                          <span key={c} className="badge muted" style={{ fontSize: 9 }}>
                            {CODE_LABELS[c] ?? c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="muted">{fmtAgo(u.last_event_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── event feed ── */}
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>Event feed</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <select
            value={codeFilter}
            onChange={e => setCodeFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '4px 8px', color: 'var(--text)', fontSize: 11, fontFamily: 'var(--font)' }}
          >
            <option value="all">All codes</option>
            {Object.entries(CODE_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          <select
            value={sevFilter}
            onChange={e => setSevFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '4px 8px', color: 'var(--text)', fontSize: 11, fontFamily: 'var(--font)' }}
          >
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="warning">Warning</option>
          </select>
          <button className="admin-btn" onClick={load} style={{ fontSize: 10, padding: '4px 10px' }}>
            Refresh
          </button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        {filteredEvents.length === 0 ? (
          <div className="muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 12 }}>
            No events found
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Code</th>
                <th>User</th>
                <th>When</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents
                .sort((a, b) => (SEV_ORDER[a.severity] ?? 9) - (SEV_ORDER[b.severity] ?? 9))
                .map(e => {
                  const isOpen   = expanded === e.id
                  const hasMeta  = e.metadata && Object.keys(e.metadata).length > 0
                  return (
                    <>
                      <tr
                        key={e.id}
                        style={{ cursor: hasMeta ? 'pointer' : 'default' }}
                        onClick={() => hasMeta && setExpanded(isOpen ? null : e.id)}
                      >
                        <td>
                          <span className={
                            e.severity === 'critical' ? 'badge danger' :
                            e.severity === 'high'     ? 'badge warn'   :
                            e.severity === 'medium'   ? 'badge info'   : 'badge muted'
                          } style={{ fontSize: 9 }}>
                            {e.severity}
                          </span>
                        </td>
                        <td>
                          <span className="badge muted" style={{ fontSize: 9 }}>
                            {CODE_LABELS[e.code] ?? e.code}
                          </span>
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {e.full_name ?? e.user_id.slice(0, 8) + '…'}
                        </td>
                        <td className="muted" style={{ fontSize: 11 }}>
                          {fmtAgo(e.created_at)}
                        </td>
                        <td style={{ width: 24, textAlign: 'center', opacity: hasMeta ? 1 : 0.2 }}>
                          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                            {hasMeta ? (isOpen ? '▲' : '▼') : '—'}
                          </span>
                        </td>
                      </tr>
                      {isOpen && hasMeta && (
                        <tr key={`${e.id}-meta`}>
                          <td colSpan={5} style={{ background: 'var(--surface2)', padding: '10px 16px' }}>
                            <pre style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0, fontFamily: 'var(--font)', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                              {JSON.stringify(e.metadata, null, 2)}
                            </pre>
                          </td>
                        </tr>
                      )}
                    </>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
