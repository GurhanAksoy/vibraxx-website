'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface CategoryStat {
  category_id: number
  category_name: string
  total: number
  available: number
  used: number
  health: 'ok' | 'warn' | 'critical'
}

interface PoolTotal {
  total: number
  available: number
  used: number
}

interface PoolStats {
  generated_at: string
  total: PoolTotal
  categories: CategoryStat[]
}

const fmt = (n?: number | null) => n?.toLocaleString() ?? '—'

const pct = (a: number, t: number) =>
  t === 0 ? '0%' : `${Math.round((a / t) * 100)}%`

const HealthBadge = ({ h }: { h: string }) => (
  <span className={h === 'critical' ? 'badge danger' : h === 'warn' ? 'badge warn' : 'badge live'}>
    {h}
  </span>
)

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminPool() {
  const [data, setData]       = useState<PoolStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [sort, setSort]       = useState<'available' | 'used' | 'total' | 'name'>('available')

  const load = useCallback(async () => {
    const { data: res, error: err } = await supabase.rpc('get_admin_pool_stats')
    if (err) { setError(err.message); setLoading(false); return }
    setData(res as PoolStats)
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const id = setInterval(load, 60000)
    return () => clearInterval(id)
  }, [load])

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>
  if (!data)   return null

  const { total, categories } = data

  const sorted = [...categories].sort((a, b) => {
    if (sort === 'available') return a.available - b.available
    if (sort === 'used')      return b.used - a.used
    if (sort === 'total')     return b.total - a.total
    return a.category_name.localeCompare(b.category_name)
  })

  const criticalCount = categories.filter(c => c.health === 'critical').length
  const warnCount     = categories.filter(c => c.health === 'warn').length

  return (
    <>
      <div className="page-title">Pool</div>
      <div className="page-subtitle">Question pool · category breakdown · refreshes every 60s</div>

      {/* ── totals ── */}
      <div className="section-title">Overview</div>
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-card-label">Total questions</div>
          <div className="stat-card-value">{fmt(total.total)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Available</div>
          <div className="stat-card-value success">{fmt(total.available)}</div>
          <div className="stat-card-sub">{pct(total.available, total.total)} of total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Used</div>
          <div className="stat-card-value">{fmt(total.used)}</div>
          <div className="stat-card-sub">{pct(total.used, total.total)} of total</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-label">Category alerts</div>
          <div className={`stat-card-value ${criticalCount > 0 ? 'danger' : warnCount > 0 ? 'warn' : 'success'}`}>
            {criticalCount > 0 ? `${criticalCount} critical` : warnCount > 0 ? `${warnCount} warn` : 'all ok'}
          </div>
          <div className="stat-card-sub">{categories.length} active categories</div>
        </div>
      </div>

      {/* ── category table ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div className="section-title" style={{ margin: 0 }}>Categories</div>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: 10, color: 'var(--muted)' }}>sort by</span>
        {(['available', 'used', 'total', 'name'] as const).map(s => (
          <button
            key={s}
            className="admin-btn"
            style={{
              fontSize: 10, padding: '3px 10px',
              background:  sort === s ? 'rgba(99,102,241,0.15)' : undefined,
              color:       sort === s ? 'var(--accent2)'        : undefined,
              borderColor: sort === s ? 'rgba(99,102,241,0.3)'  : undefined,
            }}
            onClick={() => setSort(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Category</th>
              <th>Total</th>
              <th>Available</th>
              <th>Used</th>
              <th>Used %</th>
              <th>Health</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(c => (
              <tr key={c.category_id}>
                <td style={{ fontSize: 12 }}>{c.category_name}</td>
                <td>{fmt(c.total)}</td>
                <td style={{
                  color: c.health === 'critical' ? 'var(--danger)' :
                         c.health === 'warn'     ? 'var(--warn)'   : 'var(--text)',
                  fontWeight: c.health !== 'ok' ? 600 : 400,
                }}>
                  {fmt(c.available)}
                </td>
                <td className="muted">{fmt(c.used)}</td>
                <td className="muted">{pct(c.used, c.total)}</td>
                <td><HealthBadge h={c.health} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
