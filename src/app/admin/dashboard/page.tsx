'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface DashboardState {
  generated_at: string
  pool: {
    ready: boolean
    available: number
    lowest_category: string | null
    lowest_count: number | null
  }
  rounds: {
    live: {
      round_id: string
      scheduled_start: string
      started_at: string
      status: string
      participant_count: number
      answer_count: number
    } | null
    next: {
      round_id: string
      scheduled_start: string
      status: string
    } | null
    missed_count: number
  }
  users: { lobby_active: number; new_today: number }
  finance: { revenue_today: number; credits_sold: number }
  health: { critical_count: number; warn_count: number; last_event_at: string | null }
  scheduler: { last_watchdog_at: string | null; last_round_started_at: string | null; missed_rounds: number }
}

const fmt = (dt?: string | null) => {
  if (!dt) return '—'
  return new Date(dt).toUTCString().slice(17, 25)
}

const fmtAgo = (dt?: string | null) => {
  if (!dt) return '—'
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)   return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  return `${Math.floor(sec / 3600)}h ago`
}

const fmtGBP = (n?: number | null) =>
  n == null ? '—' : '£' + n.toFixed(2)

function StatCard({
  label, value, sub, variant,
}: {
  label: string
  value: string | number | React.ReactNode
  sub?: string
  variant?: 'default' | 'accent' | 'success' | 'danger' | 'warn'
}) {
  return (
    <div className="stat-card">
      <div className="stat-card-label">{label}</div>
      <div className={`stat-card-value${variant && variant !== 'default' ? ` ${variant}` : ''}`}>
        {value}
      </div>
      {sub && <div className="stat-card-sub">{sub}</div>}
    </div>
  )
}

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminDashboard() {
  const [data, setData]       = useState<DashboardState | null>(null)
  const [error, setError]     = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastFetch, setLastFetch] = useState<Date | null>(null)

  const load = useCallback(async () => {
    const { data: res, error: err } = await supabase.rpc('get_admin_dashboard_state')
    if (err) {
      setError(err.message)
    } else {
      setData(res as DashboardState)
      setLastFetch(new Date())
      setError(null)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load])

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>
  if (!data)   return null

  const { pool, rounds, users, finance, health, scheduler } = data

  return (
    <>
      <div className="page-title">Dashboard</div>
      <div className="page-subtitle">
        Platform snapshot · refreshes every 15s
        {lastFetch && (
          <span style={{ marginLeft: 8, opacity: 0.5 }}>
            · fetched {fmt(lastFetch.toISOString())} UTC
          </span>
        )}
      </div>

      {health.critical_count > 0 && (
        <div style={{
          padding: '10px 16px', borderRadius: 6,
          background: '#2a1010', border: '1px solid #5a1818',
          color: '#ef4444', fontSize: 12, marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ fontWeight: 700 }}>
            {health.critical_count} critical event{health.critical_count > 1 ? 's' : ''}
          </span>
          <span style={{ opacity: 0.7 }}>· last {fmtAgo(health.last_event_at)}</span>
          <a href="/admin/health" style={{ marginLeft: 'auto', color: '#ef4444', fontSize: 11 }}>
            View health →
          </a>
        </div>
      )}

      <div className="section-title">Engine status</div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          label="Pool ready"
          value={pool.ready ? 'READY' : 'NOT READY'}
          sub={`${pool.available?.toLocaleString() ?? '—'} available`}
          variant={pool.ready ? 'success' : 'danger'}
        />
        <StatCard
          label="Live round"
          value={rounds.live ? fmt(rounds.live.scheduled_start) : 'NONE'}
          sub={rounds.live
            ? `${rounds.live.participant_count} players · ${rounds.live.answer_count} answers`
            : 'no active round'}
          variant={rounds.live ? 'success' : 'default'}
        />
        <StatCard
          label="Next round"
          value={rounds.next ? fmt(rounds.next.scheduled_start) : '—'}
          sub={rounds.next ? 'UTC' : 'none scheduled'}
          variant={rounds.next ? 'accent' : 'default'}
        />
        <StatCard
          label="Missed rounds"
          value={rounds.missed_count}
          sub="stuck in scheduled"
          variant={rounds.missed_count > 0 ? 'danger' : 'success'}
        />
      </div>

      <div className="section-title">Activity</div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          label="Lobby active"
          value={users.lobby_active}
          sub="last 5 minutes"
          variant="accent"
        />
        <StatCard
          label="New users today"
          value={users.new_today}
        />
        <StatCard
          label="Lowest category"
          value={pool.lowest_category ?? '—'}
          sub={`${pool.lowest_count?.toLocaleString() ?? '—'} available`}
          variant={pool.lowest_count != null && pool.lowest_count < 500 ? 'warn' : 'default'}
        />
        <StatCard
          label="Pool available"
          value={pool.available?.toLocaleString() ?? '—'}
          sub="total unused questions"
        />
      </div>

      <div className="section-title">Finance & health</div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <StatCard
          label="Revenue today"
          value={fmtGBP(finance.revenue_today)}
          variant="success"
        />
        <StatCard
          label="Credits sold"
          value={finance.credits_sold?.toLocaleString() ?? '—'}
          sub="today"
        />
        <StatCard
          label="Critical events"
          value={health.critical_count}
          sub="last 24h"
          variant={health.critical_count > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Warnings"
          value={health.warn_count}
          sub="last 24h"
          variant={health.warn_count > 5 ? 'warn' : 'default'}
        />
      </div>

      <div className="section-title">Scheduler</div>
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Job</th>
              <th>Last run</th>
              <th>Lag</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Watchdog</td>
              <td className="mono">{fmt(scheduler.last_watchdog_at)} UTC</td>
              <td className="muted">{fmtAgo(scheduler.last_watchdog_at)}</td>
            </tr>
            <tr>
              <td>start_scheduled_rounds</td>
              <td className="mono">{fmt(scheduler.last_round_started_at)} UTC</td>
              <td className="muted">{fmtAgo(scheduler.last_round_started_at)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  )
}
