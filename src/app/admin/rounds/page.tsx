'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

// ── types ────────────────────────────────────────────────────
interface Round {
  round_id: string
  scheduled_start: string
  started_at: string | null
  // NOTE: v2_rounds has no finished_at column
  status: 'scheduled' | 'live' | 'finished' | 'cancelled'
  questions_loaded: number
  participant_count: number
  answer_count: number
  duration_seconds: number | null
}

interface EngineJob {
  last_run_at: string | null
  finished_at: string | null
  status: string | null
  duration_ms: number | null
  error: string | null
}

interface RoundsState {
  generated_at: string
  total: number
  limit: number
  offset: number
  rounds: Round[]
  engine: {
    start_scheduled_rounds?: EngineJob
    v2_watchdog?: EngineJob
    refresh_leaderboards?: EngineJob
    v2_retention_cleanup?: EngineJob
    scheduler_lag_seconds?: number
    missed_rounds?: number
  }
}

// ── helpers ──────────────────────────────────────────────────
function fmt(dt: string | null | undefined): string {
  if (!dt) return '—'
  const d = new Date(dt)
  // "17:42:00"
  return d.toUTCString().slice(17, 25)
}

function fmtDate(dt: string | null | undefined): string {
  if (!dt) return '—'
  const d = new Date(dt)
  return d.toUTCString().slice(5, 22) // "19 Mar 2026 17:42"
}

function fmtAgo(dt: string | null | undefined): string {
  if (!dt) return '—'
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)   return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  return `${Math.floor(sec / 3600)}h ago`
}

function fmtDuration(sec: number | null): string {
  if (sec == null) return '—'
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}m ${s}s`
}

function StatusBadge({ status }: { status: string }) {
  const cls =
    status === 'live'      ? 'badge live'      :
    status === 'scheduled' ? 'badge scheduled' :
    status === 'finished'  ? 'badge muted'     :
    status === 'cancelled' ? 'badge danger'    :
    'badge muted'
  return <span className={cls}>{status}</span>
}

function JobRow({ name, job }: { name: string; job?: EngineJob }) {
  if (!job) return (
    <tr>
      <td>{name}</td>
      <td colSpan={4} className="muted">no data</td>
    </tr>
  )
  return (
    <tr>
      <td className="mono">{name}</td>
      <td className="mono">{fmt(job.last_run_at)} UTC</td>
      <td className="muted">{fmtAgo(job.last_run_at)}</td>
      <td>
        {job.duration_ms != null
          ? <span style={{ color: 'var(--muted)' }}>{job.duration_ms}ms</span>
          : '—'
        }
      </td>
      <td>
        {job.error
          ? <span style={{ color: 'var(--danger)', fontSize: 11 }}>{job.error}</span>
          : <span className="badge live" style={{ fontSize: 9 }}>ok</span>
        }
      </td>
    </tr>
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
export default function AdminRounds() {
  const [data, setData]         = useState<RoundsState | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [loading, setLoading]   = useState(true)
  const [actionMsg, setActionMsg] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    const { data: res, error: err } = await supabase.rpc('get_admin_rounds_list', {
      p_limit: 50,
      p_offset: 0,
    })
    if (err) setError(err.message)
    else {
      setData(res as RoundsState)
      setError(null)
    }
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 20000)
    return () => clearInterval(id)
  }, [fetchData])

  // ── action helpers ──────────────────────────────────────
  const runAction = async (rpcName: string, params: Record<string, unknown>, label: string) => {
    setActionMsg(`Running ${label}…`)
    const { error: err } = await supabase.rpc(rpcName, params)
    if (err) setActionMsg(`Error: ${err.message}`)
    else {
      setActionMsg(`${label} complete`)
      await fetchData()
    }
    setTimeout(() => setActionMsg(null), 4000)
  }

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>
  if (!data)   return null

  const { rounds, engine } = data

  const lagSec = engine.scheduler_lag_seconds ?? 0
  const lagBad = lagSec > 360 // > 6 minutes

  return (
    <>
      <div className="page-title">Rounds</div>
      <div className="page-subtitle">
        Round engine · {data.total} total rounds · refreshes every 20s
      </div>

      {/* ── action message ── */}
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

      {/* ── engine diagnostics ── */}
      <div className="section-title">Engine diagnostics</div>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 16, marginBottom: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="stat-card-label">Scheduler lag</span>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: lagBad ? 'var(--danger)' : 'var(--success)',
            }}>
              {lagSec}s
            </span>
            {lagBad && <span className="badge danger">high</span>}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="stat-card-label">Missed rounds</span>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: (engine.missed_rounds ?? 0) > 0 ? 'var(--danger)' : 'var(--success)',
            }}>
              {engine.missed_rounds ?? 0}
            </span>
          </div>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Last run (UTC)</th>
              <th>Ago</th>
              <th>Duration</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <JobRow name="start_scheduled_rounds" job={engine.start_scheduled_rounds} />
            <JobRow name="v2_watchdog"             job={engine.v2_watchdog} />
            <JobRow name="refresh_leaderboards"    job={engine.refresh_leaderboards} />
            <JobRow name="v2_retention_cleanup"    job={engine.v2_retention_cleanup} />
          </tbody>
        </table>
      </div>

      {/* ── round timeline ── */}
      <div className="section-title">Round timeline ({data.total} total)</div>
      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Start (UTC)</th>
              <th>Status</th>
              <th>Players</th>
              <th>Answers</th>
              <th>Qs loaded</th>
              <th>Duration</th>
              <th>Round ID</th>
            </tr>
          </thead>
          <tbody>
            {rounds.map((r) => (
              <tr key={r.round_id}>
                <td className="mono">{fmt(r.scheduled_start)}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>{r.participant_count}</td>
                <td>{r.answer_count}</td>
                <td style={{
                  color: r.questions_loaded < 15 && r.status !== 'scheduled'
                    ? 'var(--warn)' : 'var(--text)'
                }}>
                  {r.questions_loaded} / 15
                </td>
                <td className="muted">{fmtDuration(r.duration_seconds)}</td>
                <td className="mono muted" style={{ fontSize: 10 }}>
                  {r.round_id.slice(0, 8)}…
                </td>
              </tr>
            ))}
            {rounds.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 24 }}>
                  no rounds found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
