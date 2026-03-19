'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Announcement {
  id: number
  type: 'banner' | 'modal'
  severity: 'info' | 'warning' | 'critical'
  title: string
  message: string
  cta_text: string | null
  cta_url: string | null
  expires_at: string | null
}

const SEVERITY_STYLES = {
  info: {
    bg:     'rgba(56, 189, 248, 0.06)',
    border: 'rgba(56, 189, 248, 0.25)',
    dot:    '#38bdf8',
    title:  '#7dd3fc',
    text:   '#94d8f8',
    cta:    '#38bdf8',
    icon:   'ℹ',
  },
  warning: {
    bg:     'rgba(245, 158, 11, 0.06)',
    border: 'rgba(245, 158, 11, 0.25)',
    dot:    '#f59e0b',
    title:  '#fcd34d',
    text:   '#fbbf24',
    cta:    '#f59e0b',
    icon:   '⚠',
  },
  critical: {
    bg:     'rgba(239, 68, 68, 0.08)',
    border: 'rgba(239, 68, 68, 0.3)',
    dot:    '#ef4444',
    title:  '#fca5a5',
    text:   '#f87171',
    cta:    '#ef4444',
    icon:   '!',
  },
}

export default function AnnouncementBanner() {
  const [banners, setBanners]     = useState<Announcement[]>([])
  const [dismissed, setDismissed] = useState<Set<number>>(new Set())

  const fetchActive = async () => {
    const { data } = await supabase.rpc('get_active_announcements')
    if (data) setBanners((data as Announcement[]) ?? [])
  }

  useEffect(() => {
    fetchActive()

    const channel = supabase
      .channel('announcements-banner')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table:  'v2_announcements',
      }, () => fetchActive())
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const visible = banners.filter(b => !dismissed.has(b.id))
  if (visible.length === 0) return null

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 999, display: 'flex', flexDirection: 'column' }}>
      {visible.map(b => {
        const s = SEVERITY_STYLES[b.severity]
        return (
          <div
            key={b.id}
            style={{
              background:   s.bg,
              borderBottom: `1px solid ${s.border}`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              padding: '0 20px',
              height: 44,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            {/* animated dot */}
            <div style={{ position: 'relative', width: 8, height: 8, flexShrink: 0 }}>
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                background: s.dot,
                opacity: 0.3,
                animation: 'ab-ping 1.5s ease-in-out infinite',
              }} />
              <div style={{
                position: 'absolute', inset: '1px',
                borderRadius: '50%',
                background: s.dot,
              }} />
            </div>

            {/* severity label */}
            <span style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: s.dot,
              opacity: 0.8,
              flexShrink: 0,
            }}>
              {b.severity}
            </span>

            {/* divider */}
            <div style={{ width: 1, height: 16, background: s.border, flexShrink: 0 }} />

            {/* title */}
            <span style={{
              fontSize: 13,
              fontWeight: 600,
              color: s.title,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 1,
              minWidth: 0,
            }}>
              {b.title}
            </span>

            {/* message */}
            {b.message && b.message !== b.title && (
              <span style={{
                fontSize: 12,
                color: s.text,
                opacity: 0.75,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                flex: 1,
                minWidth: 0,
              }}>
                {b.message}
              </span>
            )}

            <div style={{ flex: 1 }} />

            {/* CTA */}
            {b.cta_text && b.cta_url && (
              <a
                href={b.cta_url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: s.cta,
                  textDecoration: 'none',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  border: `1px solid ${s.border}`,
                  borderRadius: 4,
                  padding: '3px 10px',
                  flexShrink: 0,
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.7')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {b.cta_text}
              </a>
            )}

            {/* dismiss */}
            <button
              onClick={() => setDismissed(prev => new Set([...prev, b.id]))}
              aria-label="Dismiss"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: s.title,
                opacity: 0.5,
                fontSize: 18,
                lineHeight: 1,
                padding: '0 4px',
                flexShrink: 0,
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
              onMouseLeave={e => (e.currentTarget.style.opacity = '0.5')}
            >
              ×
            </button>
          </div>
        )
      })}

      <style>{`
        @keyframes ab-ping {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50%       { transform: scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  )
}
