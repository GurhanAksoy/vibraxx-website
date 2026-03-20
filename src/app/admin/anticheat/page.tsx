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

interface Investigation {
  user: {
    user_id: string
    full_name: string | null
    avatar_url: string | null
    country: string | null
    security_flag: string
    email: string | null
    created_at: string
  }
  events:  Array<{ id: number; severity: string; code: string; metadata: Record<string,any>; created_at: string }>
  rounds:  Array<{ round_id: string; total_answers: number; correct_answers: number; score: number; win_rate_pct: number; last_answered: string }>
  credits: Array<{ delta_paid: number; delta_bonus: number; reason: string; ref_type: string; created_at: string }>
  risk_score: number
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

const FLAG_STYLES: Record<string, { label: string; badge: string }> = {
  none:       { label: 'None',       badge: 'muted'   },
  suspicious: { label: 'Suspicious', badge: 'warn'    },
  restricted: { label: 'Restricted', badge: 'danger'  },
  safe:       { label: 'Safe',       badge: 'success' },
}

const riskLevel = (score: number) => {
  if (score >= 100) return { label: 'Dangerous',  color: 'var(--danger)'  }
  if (score >= 50)  return { label: 'Suspicious', color: 'var(--warn)'    }
  return               { label: 'Normal',      color: 'var(--success)' }
}

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminAnticheat() {
  const [summary,    setSummary]    = useState<SummaryRow[]>([])
  const [topUsers,   setTopUsers]   = useState<TopUser[]>([])
  const [events,     setEvents]     = useState<SecurityEvent[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)
  const [expanded,   setExpanded]   = useState<number | null>(null)
  const [codeFilter, setCodeFilter] = useState('all')
  const [sevFilter,  setSevFilter]  = useState('all')
  const [drawerUserId,  setDrawerUserId]  = useState<string | null>(null)
  const [investigation, setInvestigation] = useState<Investigation | null>(null)
  const [drawerLoading, setDrawerLoading] = useState(false)
  const [flagging,      setFlagging]      = useState(false)
  const [flagMsg,       setFlagMsg]       = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error: err } = await supabase.rpc('get_admin_anticheat_stats')
    if (err) { setError(err.message); setLoading(false); return }
    const d = data as { summary: SummaryRow[]; top_users: TopUser[]; events: SecurityEvent[] }
    setSummary(d.summary ?? [])
    setTopUsers(d.top_users ?? [])
    setEvents(d.events ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])
  useEffect(() => {
    const interval = setInterval(load, 15000)
    return () => clearInterval(interval)
  }, [load])

  const openDrawer = async (userId: string) => {
    setDrawerUserId(userId)
    setInvestigation(null)
    setDrawerLoading(true)
    setFlagMsg(null)
    const { data, error: err } = await supabase.rpc('admin_get_user_investigation', { p_user_id: userId })
    if (!err && data) setInvestigation(data as Investigation)
    setDrawerLoading(false)
  }

  const closeDrawer = () => { setDrawerUserId(null); setInvestigation(null); setFlagMsg(null) }

  const flagUser = async (flag: string) => {
    if (!drawerUserId) return
    setFlagging(true)
    const { error: err } = await supabase.rpc('admin_flag_user', { p_target_user_id: drawerUserId, p_flag: flag })
    if (!err) {
      setFlagMsg(`Marked as ${flag}`)
      const { data } = await supabase.rpc('admin_get_user_investigation', { p_user_id: drawerUserId })
      if (data) setInvestigation(data as Investigation)
      await load()
    }
    setFlagging(false)
    setTimeout(() => setFlagMsg(null), 3000)
  }

  const totalEvents   = summary.reduce((a, r) => a + r.total, 0)
  const totalCritical = summary.reduce((a, r) => a + r.critical_count, 0)
  const totalHigh     = summary.reduce((a, r) => a + r.high_count, 0)
  const totalUsers    = new Set(events.map(e => e.user_id)).size

  const filteredEvents = events.filter(e => {
    if (codeFilter !== 'all' && e.code !== codeFilter) return false
    if (sevFilter  !== 'all' && e.severity !== sevFilter) return false
    return true
  })

  const counts24h = events.reduce<Record<string, number>>((acc, e) => {
    const age = (Date.now() - new Date(e.created_at).getTime()) / 1000 / 3600
    if (age <= 24) acc[e.user_id] = (acc[e.user_id] ?? 0) + 1
    return acc
  }, {})

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>

  return (
    <>
      <div className="page-title">Anti-Cheat</div>
      <div className="page-subtitle">Security event monitoring — last 7 days · auto-refresh 15s</div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total Events</div>
          <div className="stat-card-value">{totalEvents}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Critical</div>
          <div className="stat-card-value" style={{ color: totalCritical > 0 ? 'var(--danger)' : undefined }}>{totalCritical}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">High</div>
          <div className="stat-card-value" style={{ color: totalHigh > 0 ? 'var(--warn)' : undefined }}>{totalHigh}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Flagged Users</div>
          <div className="stat-card-value">{totalUsers}</div>
        </div>
      </div>

      {summary.length > 0 && (
        <>
          <div className="section-title">Event breakdown</div>
          <div className="admin-card" style={{ padding: 0, marginBottom: 24 }}>
            <table className="admin-table">
              <thead>
                <tr><th>Code</th><th>Total</th><th>Users</th><th>Critical</th><th>High</th><th>Medium</th><th>Warning</th><th>Last seen</th></tr>
              </thead>
              <tbody>
                {summary.map(r => (
                  <tr key={r.code}>
                    <td><span className="badge info" style={{ fontSize: 10 }}>{CODE_LABELS[r.code] ?? r.code}</span></td>
                    <td style={{ fontWeight: 700 }}>{r.total}</td>
                    <td className="muted">{r.unique_users}</td>
                    <td style={{ color: r.critical_count > 0 ? 'var(--danger)' : undefined, fontWeight: r.critical_count > 0 ? 700 : 400 }}>{r.critical_count}</td>
                    <td style={{ color: r.high_count > 0 ? 'var(--warn)' : undefined }}>{r.high_count}</td>
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

      {topUsers.length > 0 && (
        <>
          <div className="section-title">Top flagged users</div>
          <div className="admin-card" style={{ padding: 0, marginBottom: 24 }}>
            <table className="admin-table">
              <thead><tr><th>User</th><th>Events</th><th>24h</th><th>Codes</th><th>Last event</th><th></th></tr></thead>
              <tbody>
                {topUsers.map(u => (
                  <tr key={u.user_id} style={{ cursor: 'pointer' }} onClick={() => openDrawer(u.user_id)}>
                    <td style={{ fontSize: 12 }}>{u.full_name ?? u.user_id.slice(0, 8)}</td>
                    <td style={{ fontWeight: 700, color: u.event_count >= 5 ? 'var(--danger)' : u.event_count >= 3 ? 'var(--warn)' : undefined }}>{u.event_count}</td>
                    <td className="muted">{counts24h[u.user_id] ?? 0}</td>
                    <td><div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>{u.codes.map(c => <span key={c} className="badge muted" style={{ fontSize: 9 }}>{CODE_LABELS[c] ?? c}</span>)}</div></td>
                    <td className="muted">{fmtAgo(u.last_event_at)}</td>
                    <td><span style={{ fontSize: 10, color: 'var(--text-muted)' }}>→</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <div className="section-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
        <span>Event feed</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <select value={codeFilter} onChange={e => setCodeFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '4px 8px', color: 'var(--text)', fontSize: 11, fontFamily: 'var(--font)' }}>
            <option value="all">All codes</option>
            {Object.entries(CODE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <select value={sevFilter} onChange={e => setSevFilter(e.target.value)}
            style={{ background: 'var(--surface2)', border: '1px solid var(--border2)', borderRadius: 4, padding: '4px 8px', color: 'var(--text)', fontSize: 11, fontFamily: 'var(--font)' }}>
            <option value="all">All severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="warning">Warning</option>
          </select>
          <button className="admin-btn" onClick={load} style={{ fontSize: 10, padding: '4px 10px' }}>Refresh</button>
        </div>
      </div>

      <div className="admin-card" style={{ padding: 0, marginBottom: 32 }}>
        {filteredEvents.length === 0 ? (
          <div className="muted" style={{ textAlign: 'center', padding: '32px 0', fontSize: 12 }}>
            ✓ System clean — no events in last 7 days
          </div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr><th>Severity</th><th>Code</th><th>User</th><th>24h</th><th>When</th><th></th></tr>
            </thead>
            <tbody>
              {filteredEvents.map(e => {
                const isOpen  = expanded === e.id
                const hasMeta = e.metadata && Object.keys(e.metadata).length > 0
                const rowBg   = e.severity === 'critical' ? 'rgba(239,68,68,0.06)' :
                                e.severity === 'high'     ? 'rgba(245,158,11,0.06)' : undefined
                return (
                  <>
                    <tr key={e.id} style={{ background: rowBg, cursor: 'pointer' }} onClick={() => openDrawer(e.user_id)}>
                      <td><span className={e.severity === 'critical' ? 'badge danger' : e.severity === 'high' ? 'badge warn' : e.severity === 'medium' ? 'badge info' : 'badge muted'} style={{ fontSize: 9 }}>{e.severity}</span></td>
                      <td><span className="badge muted" style={{ fontSize: 9 }}>{CODE_LABELS[e.code] ?? e.code}</span></td>
                      <td style={{ fontSize: 12 }}>{e.full_name ?? e.user_id.slice(0, 8) + '…'}</td>
                      <td className="muted" style={{ fontSize: 11 }}>{counts24h[e.user_id] ?? 0}</td>
                      <td className="muted" style={{ fontSize: 11 }}>{fmtAgo(e.created_at)}</td>
                      <td onClick={ev => { ev.stopPropagation(); hasMeta && setExpanded(isOpen ? null : e.id) }}
                        style={{ width: 24, textAlign: 'center', opacity: hasMeta ? 1 : 0.2 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{hasMeta ? (isOpen ? '▲' : '▼') : '—'}</span>
                      </td>
                    </tr>
                    {isOpen && hasMeta && (
                      <tr key={`${e.id}-meta`}>
                        <td colSpan={6} style={{ background: 'var(--surface2)', padding: '10px 16px' }}>
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

      {/* Investigation Drawer */}
      {drawerUserId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={closeDrawer}>
          <div style={{
            position: 'absolute', top: 0, right: 0, bottom: 0,
            width: 'min(560px, 95vw)',
            background: 'var(--surface)',
            borderLeft: '1px solid var(--border)',
            overflowY: 'auto', padding: 24,
          }} onClick={e => e.stopPropagation()}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div className="section-title" style={{ margin: 0 }}>Investigation</div>
              <button className="admin-btn" onClick={closeDrawer} style={{ fontSize: 10, padding: '4px 10px' }}>Close</button>
            </div>

            {drawerLoading && <Loading />}

            {investigation && (() => {
              const u    = investigation.user
              const risk = riskLevel(investigation.risk_score)
              const flag = FLAG_STYLES[u.security_flag] ?? FLAG_STYLES.none
              return (
                <>
                  {flagMsg && (
                    <div style={{ padding: '8px 12px', borderRadius: 5, background: '#0f2a1a', border: '1px solid #1a4a2a', color: 'var(--success)', fontSize: 11, marginBottom: 16 }}>
                      {flagMsg}
                    </div>
                  )}

                  <div className="admin-card" style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--surface2)', overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {u.avatar_url ? <img src={u.avatar_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="" /> : '👤'}
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{u.full_name ?? 'Unknown'}</div>
                        <div className="muted" style={{ fontSize: 11 }}>{u.email ?? '—'}</div>
                      </div>
                      <span className={`badge ${flag.badge}`} style={{ fontSize: 10 }}>{flag.label}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--surface2)', overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(investigation.risk_score, 150) / 150 * 100}%`, height: '100%', background: risk.color, borderRadius: 3, transition: 'width 0.5s' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: risk.color, flexShrink: 0 }}>
                        {investigation.risk_score} — {risk.label}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {['suspicious', 'restricted', 'safe', 'none'].map(f => (
                        <button key={f}
                          className={`admin-btn ${f === 'restricted' ? 'danger' : ''}`}
                          disabled={flagging || u.security_flag === f}
                          onClick={() => flagUser(f)}
                          style={{ fontSize: 10, padding: '4px 10px', opacity: u.security_flag === f ? 0.4 : 1 }}>
                          {u.security_flag === f ? '✓ ' : ''}{FLAG_STYLES[f].label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {investigation.events.length > 0 && (
                    <>
                      <div className="section-title" style={{ fontSize: 11, marginBottom: 8 }}>Security events (30d)</div>
                      <div className="admin-card" style={{ padding: 0, marginBottom: 16 }}>
                        <table className="admin-table">
                          <thead><tr><th>Sev</th><th>Code</th><th>When</th></tr></thead>
                          <tbody>
                            {investigation.events.map(ev => (
                              <tr key={ev.id}>
                                <td><span className={ev.severity === 'critical' ? 'badge danger' : ev.severity === 'high' ? 'badge warn' : 'badge muted'} style={{ fontSize: 9 }}>{ev.severity}</span></td>
                                <td><span className="badge muted" style={{ fontSize: 9 }}>{CODE_LABELS[ev.code] ?? ev.code}</span></td>
                                <td className="muted" style={{ fontSize: 11 }}>{fmtAgo(ev.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {investigation.rounds.length > 0 && (
                    <>
                      <div className="section-title" style={{ fontSize: 11, marginBottom: 8 }}>Last 10 rounds</div>
                      <div className="admin-card" style={{ padding: 0, marginBottom: 16 }}>
                        <table className="admin-table">
                          <thead><tr><th>Score</th><th>Correct</th><th>Win%</th><th>When</th></tr></thead>
                          <tbody>
                            {investigation.rounds.map(r => (
                              <tr key={r.round_id} style={{ background: r.score >= 140 ? 'rgba(239,68,68,0.06)' : undefined }}>
                                <td style={{ fontWeight: 700, color: r.score >= 140 ? 'var(--danger)' : undefined }}>{r.score}</td>
                                <td className="muted">{r.correct_answers}/{r.total_answers}</td>
                                <td style={{ color: r.win_rate_pct >= 80 ? 'var(--warn)' : undefined }}>{r.win_rate_pct}%</td>
                                <td className="muted" style={{ fontSize: 11 }}>{fmtAgo(r.last_answered)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {investigation.credits.length > 0 && (
                    <>
                      <div className="section-title" style={{ fontSize: 11, marginBottom: 8 }}>Credit history (last 20)</div>
                      <div className="admin-card" style={{ padding: 0 }}>
                        <table className="admin-table">
                          <thead><tr><th>Paid</th><th>Bonus</th><th>Reason</th><th>When</th></tr></thead>
                          <tbody>
                            {investigation.credits.map((c, i) => (
                              <tr key={i}>
                                <td style={{ color: c.delta_paid > 0 ? 'var(--success)' : undefined }}>{c.delta_paid > 0 ? `+${c.delta_paid}` : c.delta_paid}</td>
                                <td style={{ color: c.delta_bonus > 0 ? 'var(--info)' : undefined }}>{c.delta_bonus > 0 ? `+${c.delta_bonus}` : c.delta_bonus}</td>
                                <td className="muted" style={{ fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.reason ?? '—'}</td>
                                <td className="muted" style={{ fontSize: 11 }}>{fmtAgo(c.created_at)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </>
              )
            })()}
          </div>
        </div>
      )}
    </>
  )
}
