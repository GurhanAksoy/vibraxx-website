'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface LogEntry {
  id: number
  action: string
  target: string | null
  metadata: Record<string, any>
  created_at: string
  email: string | null
}

const fmtDate = (dt: string) => {
  const d = new Date(dt)
  return d.toUTCString().slice(5, 25)
}

const fmtAgo = (dt: string) => {
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)    return `${sec}s ago`
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

const ACTION_STYLES: Record<string, { badge: string; label: string }> = {
  create_announcement:     { badge: 'info',    label: 'Create announcement' },
  deactivate_announcement: { badge: 'muted',   label: 'Deactivate announcement' },
  gift_credits:            { badge: 'success', label: 'Gift credits' },
  default:                 { badge: 'muted',   label: 'Action' },
}

const getActionStyle = (action: string) =>
  ACTION_STYLES[action] ?? ACTION_STYLES.default

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminLogs() {
  const [logs, setLogs]       = useState<LogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [filter, setFilter]   = useState('')
  const [page, setPage]       = useState(0)
  const [expanded, setExpanded] = useState<number | null>(null)

  const LIMIT = 50

  const load = useCallback(async (p = 0) => {
    setLoading(true)
    const { data, error: err } = await supabase.rpc('admin_get_logs', {
      p_limit:  LIMIT,
      p_offset: p * LIMIT,
    })
    if (err) { setError(err.message); setLoading(false); return }
    setLogs((data as { logs: LogEntry[] }).logs ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => { load(page) }, [load, page])

  const filtered = filter
    ? logs.filter(l =>
        l.action.includes(filter.toLowerCase()) ||
        (l.email ?? '').toLowerCase().includes(filter.toLowerCase()) ||
        (l.target ?? '').includes(filter)
      )
    : logs

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>

  return (
    <>
      <div className="page-title">Logs</div>
      <div className="page-subtitle">Admin audit trail — all actions logged</div>

      {/* filter */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <input
          type="text"
          placeholder="Filter by action, email or target…"
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            flex: 1,
            background: 'var(--surface2)',
            border: '1px solid var(--border2)',
            borderRadius: 5,
            padding: '7px 12px',
            color: 'var(--text)',
            fontSize: 12,
            fontFamily: 'var(--font)',
            outline: 'none',
          }}
        />
        <button
          className="admin-btn"
          onClick={() => load(page)}
          style={{ fontSize: 11, padding: '6px 14px' }}
        >
          Refresh
        </button>
      </div>

      <div className="admin-card" style={{ padding: 0, marginBottom: 16 }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Action</th>
              <th>Target</th>
              <th>Admin</th>
              <th>When</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted" style={{ textAlign: 'center', padding: '24px 0' }}>
                  No logs found
                </td>
              </tr>
            ) : filtered.map(l => {
              const style = getActionStyle(l.action)
              const isOpen = expanded === l.id
              const hasMeta = l.metadata && Object.keys(l.metadata).length > 0

              return (
                <>
                  <tr
                    key={l.id}
                    style={{ cursor: hasMeta ? 'pointer' : 'default' }}
                    onClick={() => hasMeta && setExpanded(isOpen ? null : l.id)}
                  >
                    <td className="muted" style={{ fontSize: 11 }}>{l.id}</td>
                    <td>
                      <span className={`badge ${style.badge}`}>
                        {l.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="muted" style={{ fontSize: 11 }}>
                      {l.target ?? '—'}
                    </td>
                    <td className="muted" style={{ fontSize: 11, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {l.email ?? '—'}
                    </td>
                    <td className="muted" style={{ fontSize: 11, whiteSpace: 'nowrap' }} title={fmtDate(l.created_at)}>
                      {fmtAgo(l.created_at)}
                    </td>
                    <td style={{ width: 24, textAlign: 'center', opacity: hasMeta ? 1 : 0.2 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
                        {hasMeta ? (isOpen ? '▲' : '▼') : '—'}
                      </span>
                    </td>
                  </tr>
                  {isOpen && hasMeta && (
                    <tr key={`${l.id}-meta`}>
                      <td colSpan={6} style={{ background: 'var(--surface2)', padding: '10px 16px' }}>
                        <pre style={{
                          fontSize: 11,
                          color: 'var(--text-muted)',
                          margin: 0,
                          fontFamily: 'var(--font)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}>
                          {JSON.stringify(l.metadata, null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* pagination */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        <button
          className="admin-btn"
          disabled={page === 0}
          onClick={() => { setPage(p => p - 1) }}
          style={{ fontSize: 11, padding: '5px 12px' }}
        >
          ← Prev
        </button>
        <span className="muted" style={{ fontSize: 11 }}>Page {page + 1}</span>
        <button
          className="admin-btn"
          disabled={logs.length < LIMIT}
          onClick={() => { setPage(p => p + 1) }}
          style={{ fontSize: 11, padding: '5px 12px' }}
        >
          Next →
        </button>
      </div>
    </>
  )
}
