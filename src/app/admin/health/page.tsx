'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

// ── types ────────────────────────────────────────────────────
interface HealthEvent {
  id: string
  severity: 'critical' | 'warn' | 'info'
  code: string
  message: string
  metadata: Record<string, unknown> | null
  created_at: string
  // NOTE: no resolved_at or source column in v2_health_events
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

// ── helpers ──────────────────────────────────────────────────
function fmtAgo(dt: string | null | undefined): string {
  if (!dt) return '—'
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)   return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  return `${Math.floor(sec / 3600)}h ago`
}

function fmt(dt: string | null | undefined): string {
  if (!dt) return '—'
  return new Date(dt).toUTCString().slice(5, 25)
}

function SeverityBadge({ s }: { s: string }) {
  const cls =
    s === 'critical' ? 'badge danger' :
    s === 'warn'     ? 'badge warn'   :
    'badge muted'
  return <span className={cls}>{s}</span>
}

function StatusDot({ ok, label }: { ok: boolean | null; label: string }) {
  return (
    <div className="stat-card" style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 10, height: 10,
        borderRadius: '50%',
        background: ok == null ? 'var(--muted)' : ok ? 'var(--success)' : 'var(--danger)',
        flexShrink: 0,
      }} />
      <div>
        <div className="stat-card-label">{label}</div>
        <div style={{ fontSize: 12, color: ok == null ? 'var(--muted)' : ok ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
          {ok == null ? 'unknown' : ok ? 'ok' : 'fail'}
        </div>
      </div>
    </div>
  )
}

function Loading() {
  return (
    <div className="admin-loading">
      <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
      <span>loading</span>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────
export default function AdminHealth() {
  const [events, setEvents]     = useState<HealthEvent[]>([])
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [actionMsg, setActionMsg] = useState<string | null>(null)
  const [filter, setFilter]     = useState<'all' | 'critical' | 'warn' | 'unresolved'>('unresolved')

  const fetchData = useCallback(async () => {
    // Health events — last 24h
    const { data: evData, error: evErr } = await supabase
      .from('v2_health_events')
      .select('*')
      .gte('created_at', new Date(Date.now() - 86400000).toISOString())
      .order('created_at', { ascending: false })
      .limit(100)

    if (evErr) { setError(evErr.message); setLoading(false); return }
    setEvents((evData as HealthEvent[]) ?? [])

    // Latest system snapshot
    const { data: snapData } = await supabase
      .from('v2_system_health_snapshot')
      .select('*')
      .order('snapshot_at', { ascending: false })
      .limit(1)
      .single()

    setSnapshot(snapData as SystemSnapshot ?? null)
    setLoading(false)
    setError(null)
  }, [supabase])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 20000)
    return () => clearInterval(id)
  }, [fetchData])

  const runWatchdog = async () => {
    setActionMsg('Running watchdog…')
    const { error: err } = await supabase.rpc('v2_watchdog')
    if (err) setActionMsg(`Error: ${err.message}`)
    else {
      setActionMsg('Watchdog complete')
      await fetchData()
    }
    setTimeout(() => setActionMsg(null), 4000)
  }

  const runIntegrity = async () => {
    setActionMsg('Running integrity check…')
    const { error: err } = await supabase.rpc('v2_integrity_check')
    if (err) setActionMsg(`Error: ${err.message}`)
    else {
      setActionMsg('Integrity check complete')
      await fetchData()
    }
    setTimeout(() => setActionMsg(null), 4000)
  }

  // v2_health_events has no resolved_at column — clear button not applicable
  // Removed resolveAll function

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">{error}</div>

  // No resolved_at column — "unresolved" filter shows last 6h critical/warn events
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
          padding: '8px 14px',
          borderRadius: 5,
          background: 'var(--surface2)',
          border: '1px solid var(--border2)',
          fontSize: 12,
          marginBottom: 16,
          color: actionMsg.startsWith('Error') ? 'var(--danger)' : 'var(--success)',
        }}>
          {actionMsg}
        </div>
      )}

      {/* ── system status cards ── */}
      <div className="section-title">System snapshot</div>
      {snapshot ? (
        <div className="grid-4" style={{ marginBottom: 16 }}>
          <div className="stat-card">
            <div className="stat-card-label">Rounds live</div>
            <div className={`stat-card-value ${(snapshot.rounds_live ?? 0) > 0 ? 'success' : ''}`}>
              {snapshot.rounds_live ?? 0}
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Rounds scheduled</div>
            <div className="stat-card-value accent">{snapshot.rounds_scheduled ?? 0}</div>
          </div>
          <div className="stat-card">
            <div className="stat-card-label">Pool available</div>
            <div className={`stat-card-value ${(snapshot.pool_available ?? 0) < 500 ? 'warn' : ''}`}>
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
      ) : (
        <div style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 16 }}>no snapshot data</div>
      )}

      {snapshot && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 24 }}>
          Last snapshot: {fmt(snapshot.snapshot_at)}
          {snapshot.last_cache_build && (
            <span style={{ marginLeft: 12 }}>Last cache build: {fmt(snapshot.last_cache_build)}</span>
          )}
        </div>
      )}

      {/* ── watchdog controls ── */}
      <div className="section-title">Controls</div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        <button className="admin-btn primary" onClick={runWatchdog}>Run watchdog</button>
        <button className="admin-btn primary" onClick={runIntegrity}>Run integrity check</button>
      </div>

      {/* ── event summary ── */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
        <div className="section-title" style={{ margin: 0 }}>Events</div>
        <span style={{ flex: 1 }} />
        {criticalCount > 0 && (
          <span className="badge danger">{criticalCount} critical</span>
        )}
        {warnCount > 0 && (
          <span className="badge warn">{warnCount} warn</span>
        )}
        {/* filter tabs */}
        {(['unresolved', 'all', 'critical', 'warn'] as const).map(f => (
          <button
            key={f}
            className="admin-btn"
            style={{
              fontSize: 10,
              padding: '4px 10px',
              background: filter === f ? 'rgba(99,102,241,0.15)' : undefined,
              color:      filter === f ? 'var(--accent2)' : undefined,
              borderColor: filter === f ? 'rgba(99,102,241,0.3)' : undefined,
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
              <th>Severity</th>
              <th>Code</th>
              <th>Message</th>
              <th>When</th>
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
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
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
