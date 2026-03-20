'use client'

import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Announcement {
  id: number
  type: 'banner' | 'modal'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  cta_text: string | null
  cta_url: string | null
  starts_at: string
  expires_at: string | null
  is_active: boolean
  created_at: string
}

const fmtAgo = (dt: string) => {
  const sec = Math.floor((Date.now() - new Date(dt).getTime()) / 1000)
  if (sec < 60)    return `${sec}s ago`
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

const fmt = (dt: string | null) =>
  dt ? new Date(dt).toUTCString().slice(5, 22) : '—'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 5,
  padding: '7px 12px',
  color: 'var(--text)',
  fontSize: 12,
  fontFamily: 'var(--font)',
  outline: 'none',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  cursor: 'pointer',
}

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>loading</span>
  </div>
)

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [actionMsg, setActionMsg]         = useState<string | null>(null)
  const [actionErr, setActionErr]         = useState<string | null>(null)
  const [submitting, setSubmitting]       = useState(false)

  // form state
  const [type, setType]           = useState<'banner' | 'modal'>('banner')
  const [severity, setSeverity]   = useState<'info' | 'warning' | 'critical'>('info')
  const [title, setTitle]         = useState('')
  const [message, setMessage]     = useState('')
  const [ctaText, setCtaText]     = useState('')
  const [ctaUrl, setCtaUrl]       = useState('')
  const [expiresAt, setExpiresAt] = useState('')

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.rpc('admin_get_announcements')
    if (err) { setError(err.message); setLoading(false); return }
    setAnnouncements((data as { announcements: Announcement[] }).announcements ?? [])
    setError(null)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const publish = async () => {
    if (!title.trim() || !message.trim()) {
      setActionErr('Title and message are required')
      return
    }
    setSubmitting(true)
    setActionErr(null)
    setActionMsg(null)

    const { error: err } = await supabase.rpc('admin_create_announcement', {
      p_type:       type,
      p_severity:   severity,
      p_title:      title.trim(),
      p_message:    message.trim(),
      p_cta_text:   ctaText.trim() || null,
      p_cta_url:    ctaUrl.trim()  || null,
      p_expires_at: expiresAt      || null,
    })

    if (err) {
      setActionErr(err.message)
    } else {
      setActionMsg('Announcement published')
      setTitle('')
      setMessage('')
      setCtaText('')
      setCtaUrl('')
      setExpiresAt('')
      await load()
    }
    setSubmitting(false)
  }

  const deactivate = async (id: number) => {
    const { error: err } = await supabase.rpc('admin_deactivate_announcement', { p_id: id })
    if (err) setActionErr(err.message)
    else { setActionMsg('Announcement deactivated'); await load() }
    setTimeout(() => { setActionMsg(null); setActionErr(null) }, 4000)
  }

  if (loading) return <Loading />
  if (error)   return <div className="admin-error">RPC error: {error}</div>

  const active   = announcements.filter(a => a.is_active)
  const inactive = announcements.filter(a => !a.is_active)

  return (
    <>
      <div className="page-title">Announcements</div>
      <div className="page-subtitle">Publish banners and modals to all users</div>

      {actionMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: 6,
          background: '#0f2a1a', border: '1px solid #1a4a2a',
          color: 'var(--success)', fontSize: 12, marginBottom: 20,
        }}>
          {actionMsg}
        </div>
      )}
      {actionErr && (
        <div style={{
          padding: '10px 16px', borderRadius: 6,
          background: '#2a1010', border: '1px solid #5a1818',
          color: 'var(--danger)', fontSize: 12, marginBottom: 20,
        }}>
          {actionErr}
        </div>
      )}

      {/* ── active announcements ── */}
      {active.length > 0 && (
        <>
          <div className="section-title">
            Active
            <span className="badge danger" style={{ marginLeft: 8, fontSize: 9 }}>{active.length} live</span>
          </div>
          <div className="admin-card" style={{ padding: 0, marginBottom: 24 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Expires</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {active.map(a => (
                  <tr key={a.id}>
                    <td><span className="badge info">{a.type}</span></td>
                    <td>
                      <span className={
                        a.severity === 'critical' ? 'badge danger' :
                        a.severity === 'warning'  ? 'badge warn'   : 'badge muted'
                      }>
                        {a.severity}
                      </span>
                    </td>
                    <td style={{ fontSize: 12 }}>{a.title}</td>
                    <td className="muted">{fmt(a.expires_at)}</td>
                    <td className="muted">{fmtAgo(a.created_at)}</td>
                    <td>
                      <button
                        className="admin-btn danger"
                        style={{ fontSize: 10, padding: '3px 10px' }}
                        onClick={() => deactivate(a.id)}
                      >
                        Deactivate
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ── compose ── */}
      <div className="section-title">New announcement</div>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div className="grid-2" style={{ marginBottom: 8 }}>
          <div>
            <div className="stat-card-label" style={{ marginBottom: 4 }}>Type</div>
            <select value={type} onChange={e => setType(e.target.value as 'banner' | 'modal')} style={selectStyle}>
              <option value="banner">Banner — sticky top bar</option>
              <option value="modal">Modal — blocks screen</option>
            </select>
          </div>
          <div>
            <div className="stat-card-label" style={{ marginBottom: 4 }}>Severity</div>
            <select value={severity} onChange={e => setSeverity(e.target.value as 'info' | 'warning' | 'critical')} style={selectStyle}>
              <option value="info">Info — blue</option>
              <option value="warning">Warning — yellow</option>
              <option value="critical">Critical — red</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 8 }}>
          <div className="stat-card-label" style={{ marginBottom: 4 }}>Title</div>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Scheduled maintenance in 10 minutes"
            style={inputStyle}
            maxLength={120}
          />
        </div>

        <div style={{ marginBottom: 8 }}>
          <div className="stat-card-label" style={{ marginBottom: 4 }}>Message</div>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            placeholder="Full message text..."
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
            maxLength={500}
          />
        </div>

        <div className="grid-2" style={{ marginBottom: 8 }}>
          <div>
            <div className="stat-card-label" style={{ marginBottom: 4 }}>CTA text (optional)</div>
            <input
              type="text"
              value={ctaText}
              onChange={e => setCtaText(e.target.value)}
              placeholder="e.g. Learn more"
              style={inputStyle}
            />
          </div>
          <div>
            <div className="stat-card-label" style={{ marginBottom: 4 }}>CTA URL (optional)</div>
            <input
              type="text"
              value={ctaUrl}
              onChange={e => setCtaUrl(e.target.value)}
              placeholder="e.g. https://..."
              style={inputStyle}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div className="stat-card-label" style={{ marginBottom: 4 }}>Expires at (optional — UTC)</div>
          <input
            type="datetime-local"
            value={expiresAt}
            onChange={e => setExpiresAt(e.target.value)}
            style={{ ...inputStyle, colorScheme: 'dark' }}
          />
        </div>

        {/* preview — banner */}
        {title && type === 'banner' && (
          <div style={{
            position: 'relative', overflow: 'hidden',
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '0 16px', height: 52, borderRadius: 6, marginBottom: 16,
            background: severity === 'critical'
              ? 'linear-gradient(90deg,rgba(239,68,68,0.28),rgba(10,10,30,0.97) 50%,rgba(239,68,68,0.14))'
              : severity === 'warning'
              ? 'linear-gradient(90deg,rgba(245,158,11,0.25),rgba(10,10,30,0.97) 50%,rgba(245,158,11,0.12))'
              : 'linear-gradient(90deg,rgba(124,58,237,0.28),rgba(10,10,30,0.97) 50%,rgba(217,70,239,0.16))',
            border: `1px solid ${severity === 'critical' ? 'rgba(239,68,68,0.65)' : severity === 'warning' ? 'rgba(251,191,36,0.6)' : 'rgba(167,139,250,0.5)'}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', padding: '3px 9px', borderRadius: 4, color: '#fff', flexShrink: 0, border: `1px solid ${severity === 'critical' ? 'rgba(239,68,68,0.7)' : severity === 'warning' ? 'rgba(251,191,36,0.7)' : 'rgba(167,139,250,0.7)'}`, background: severity === 'critical' ? 'rgba(239,68,68,0.2)' : severity === 'warning' ? 'rgba(251,191,36,0.2)' : 'rgba(167,139,250,0.2)' }}>
              {severity}
            </div>
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.3)', flexShrink: 0 }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
            {message && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 200 }}>{message}</span>}
            {ctaText && <span style={{ fontSize: 10, fontWeight: 700, color: '#fff', padding: '4px 10px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>{ctaText}</span>}
            <span style={{ fontSize: 18, color: '#fff', opacity: 0.6, lineHeight: 1, flexShrink: 0 }}>×</span>
          </div>
        )}

        {/* preview — modal */}
        {title && type === 'modal' && (
          <div style={{
            padding: '20px', borderRadius: 12, marginBottom: 16,
            background: 'linear-gradient(135deg,#1e1b4b,#0f172a)',
            border: `1px solid ${severity === 'critical' ? 'rgba(239,68,68,0.5)' : severity === 'warning' ? 'rgba(251,191,36,0.4)' : 'rgba(167,139,250,0.4)'}`,
            boxShadow: `0 0 30px ${severity === 'critical' ? 'rgba(239,68,68,0.2)' : severity === 'warning' ? 'rgba(251,191,36,0.15)' : 'rgba(124,58,237,0.2)'}`,
          }}>
            <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 10, color: 'rgba(255,255,255,0.3)' }}>
              Preview · modal
            </div>
            <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '.12em', textTransform: 'uppercase', padding: '2px 8px', borderRadius: 4, display: 'inline-block', marginBottom: 8, color: '#fff', border: `1px solid ${severity === 'critical' ? 'rgba(239,68,68,0.6)' : severity === 'warning' ? 'rgba(251,191,36,0.6)' : 'rgba(167,139,250,0.6)'}`, background: severity === 'critical' ? 'rgba(239,68,68,0.15)' : severity === 'warning' ? 'rgba(251,191,36,0.15)' : 'rgba(167,139,250,0.15)' }}>
              {severity}
            </div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{title}</div>
            {message && <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, marginBottom: 14 }}>{message}</div>}
            <div style={{ display: 'flex', gap: 8 }}>
              {ctaText && (
                <div style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: '#fff', background: severity === 'critical' ? 'linear-gradient(135deg,#dc2626,#ef4444)' : severity === 'warning' ? 'linear-gradient(135deg,#f59e0b,#fbbf24)' : 'linear-gradient(135deg,#7c3aed,#a855f7)' }}>
                  {ctaText}
                </div>
              )}
              <div style={{ padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)' }}>
                Dismiss
              </div>
            </div>
          </div>
        )}

        <button
          className="admin-btn primary"
          onClick={publish}
          disabled={submitting || !title.trim() || !message.trim()}
        >
          {submitting ? 'Publishing…' : 'Publish announcement'}
        </button>
      </div>

      {/* ── history ── */}
      {inactive.length > 0 && (
        <>
          <div className="section-title">History</div>
          <div className="admin-card" style={{ padding: 0 }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Title</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {inactive.map(a => (
                  <tr key={a.id} style={{ opacity: 0.5 }}>
                    <td><span className="badge muted">{a.type}</span></td>
                    <td><span className="badge muted">{a.severity}</span></td>
                    <td style={{ fontSize: 12 }}>{a.title}</td>
                    <td className="muted">{fmtAgo(a.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  )
}
