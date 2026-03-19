'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface HealthEvent {
  id: string
  severity: 'critical' | 'warn' | 'info'
  code: string
  message: string
  metadata: Record<string, unknown> | null
  created_at: string
}

interface SystemSnapshot {
  snapshot_at: string
  rounds_live: number | null
  rounds_scheduled: number | null
  pool_available: number | null
  joins_last_5m: number | null
  answers_last_5m: number | null
  last_cache_build: string | null
}

interface HealthState {
  generated_at: string
  events: HealthEvent[]
  snapshot: SystemSnapshot | null
}

const fmtAgo = (dt?: string | null) => {
  if (!dt) return '—'
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)   return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  return `${Math.floor(sec / 3600)}h ago`
}

const fmt = (dt?: string | null) =>
  dt ? new Date(dt).toUTCString().slice(5, 25) : '—'

const SeverityBadge = ({ s }: { s: string }) => (
  <span className={s === 'critical' ? 'badge danger' : s === 'warn' ? 'badge warn' : 'badge muted'}>
    {s}
  </span>
)

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminHealth() {
  const [data, setData]           = useState<HealthState | null>(null)
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [filter, setFilter]       = useState<'all' | 'critical' | 'warn' | 'unresolved'>('unresolved')

  const fetchData = useCallback(async () => {
    const { data: res, error: err } = await supabase.rpc('get_admin_health_state')
    if (err) { setError(err.message); setLoading(false); return }
    setData(res as HealthState)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 20000)
    return () => clearInterval(id)
  }, [fetchData])

  const runAction = async (rpcName: string, label: string) => {
    setActionMsg(`Running ${label}…`)
    const { error: err } = await supabase.rpc(rpcName)
    if (err) setActionMsg(`Error: ${err.message}`)
    else { setActionMsg(`${label} complete`); await fetchData() }
    setTimeout(() => setActionMsg(null), 4000)
  }

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">{error}</div>
  if (!data)   return null

  const { events, snapshot } = data

  const filtered = events.filter(e => {
    if (filter === 'critical')   return e.severity === 'critical'
    if (filter === 'warn')       return e.severity === 'warn'
    if (filter === 'unresolved') return (
      e.severity !== 'info' &&
      new Date(e.created_at).getTime() > Date.now() - 6 * 3600000
    )
    return true
  })

  const criticalCount = events.filter(e => e.severity === 'critical').length
  const warnCount     = events.filter(e => e.severity === 'warn').length

  return (
    <>
      <div className="page-title">Health</div>
      <div className="page-subtitle">System health · last 24 hours · refreshes every 20s</div>

      {actionMsg && (
        <div style={{
          padding: '8px 14px', borderRadius: 5,
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          fontSize: 12, marginBottom: 16,
          color: actionMsg.startsWith('Error') ? 'var(--danger)' : 'var(--success)',
        }}>
          {actionMsg}
        </div>
      )}

      <div className="section-title">System snapshot</div>
      {snapshot ? (
        <>
          <div className="grid-4" style={{ marginBottom: 8 }}>
            <div className="stat-card">
              <div className="stat-card-label">Rounds live</div>
              <div className={`stat-card-value${(snapshot.rounds_live ?? 0) > 0 ? ' success' : ''}`}>
                {snapshot.rounds_live ?? 0}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Rounds scheduled</div>
              <div className="stat-card-value accent">{snapshot.rounds_scheduled ?? 0}</div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Pool available</div>
              <div className={`stat-card-value${(snapshot.pool_available ?? 0) < 500 ? ' warn' : ''}`}>
                {snapshot.pool_available?.toLocaleString() ?? '—'}
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-card-label">Activity (5m)</div>
              <div className="stat-card-value accent">
                {snapshot.joins_last_5m ?? 0}
                <span style={{ fontSize: 12, fontWeight: 400, marginLeft: 4, color: 'var(--muted)' }}>
                  joins / {snapshot.answers_last_5m ?? 0} ans
                </span>
              </div>
            </div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
            Last snapshot: {fmt(snapshot.snapshot_at)}
            {snapshot.last_cache_build && (
              <span style={{ marginLeft: 12 }}>Last cache build: {fmt(snapshot.last_cache_build)}</span>
            )}
          </div>
        </>
      ) : (
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 24 }}>no snapshot data</div>
      )}

      <div className="section-title">Controls</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="admin-btn primary" onClick={() => runAction('v2_watchdog', 'watchdog')}>
          Run watchdog
        </button>
        <button className="admin-btn primary" onClick={() => runAction('v2_integrity_check', 'integrity check')}>
          Run integrity check
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div className="section-title" style={{ margin: 0 }}>Events</div>
        <span style={{ flex: 1 }} />
        {criticalCount > 0 && <span className="badge danger">{criticalCount} critical</span>}
        {warnCount     > 0 && <span className="badge warn">{warnCount} warn</span>}
        {(['unresolved', 'all', 'critical', 'warn'] as const).map(f => (
          <button
            key={f}
            className="admin-btn"
            style={{
              fontSize: 10, padding: '4px 10px',
              background:  filter === f ? 'rgba(99,102,241,0.15)' : undefined,
              color:       filter === f ? 'var(--accent2)'        : undefined,
              borderColor: filter === f ? 'rgba(99,102,241,0.3)'  : undefined,
            }}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Severity</th><th>Code</th><th>Message</th><th>When</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(e => (
              <tr key={e.id}>
                <td><SeverityBadge s={e.severity} /></td>
                <td className="mono" style={{ fontSize: 11 }}>{e.code}</td>
                <td style={{ fontSize: 12, maxWidth: 340 }}>{e.message}</td>
                <td className="muted">{fmtAgo(e.created_at)}</td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  no events
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
