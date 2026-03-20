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

const S = {
  info: {
    bg:         'linear-gradient(90deg,rgba(124,58,237,0.28),rgba(10,10,30,0.97) 50%,rgba(217,70,239,0.16))',
    border:     'rgba(167,139,250,0.5)',
    dot:        '#a78bfa',
    pill:       'rgba(167,139,250,0.25)',
    pillBorder: 'rgba(167,139,250,0.7)',
    div:        'rgba(167,139,250,0.6)',
    cta:        'rgba(167,139,250,0.3)',
    ctaBorder:  'rgba(167,139,250,0.7)',
  },
  warning: {
    bg:         'linear-gradient(90deg,rgba(245,158,11,0.25),rgba(10,10,30,0.97) 50%,rgba(245,158,11,0.12))',
    border:     'rgba(251,191,36,0.6)',
    dot:        '#fbbf24',
    pill:       'rgba(251,191,36,0.25)',
    pillBorder: 'rgba(251,191,36,0.7)',
    div:        'rgba(251,191,36,0.6)',
    cta:        'rgba(251,191,36,0.25)',
    ctaBorder:  'rgba(251,191,36,0.7)',
  },
  critical: {
    bg:         'linear-gradient(90deg,rgba(239,68,68,0.28),rgba(10,10,30,0.97) 50%,rgba(239,68,68,0.14))',
    border:     'rgba(239,68,68,0.65)',
    dot:        '#ef4444',
    pill:       'rgba(239,68,68,0.28)',
    pillBorder: 'rgba(239,68,68,0.7)',
    div:        'rgba(239,68,68,0.65)',
    cta:        'rgba(239,68,68,0.28)',
    ctaBorder:  'rgba(239,68,68,0.7)',
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'v2_announcements' }, () => fetchActive())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  const visible = banners.filter(b => !dismissed.has(b.id))
  if (visible.length === 0) return null

  return (
    <>
      <style>{`
        @keyframes ab-sweep {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
        @keyframes ab-pulse {
          0%, 100% { transform: scale(1);   opacity: .5; }
          50%       { transform: scale(2.4); opacity: 0;  }
        }
        .ab-wrap { position: sticky; top: 0; z-index: 999; }
        .ab-bar {
          position: relative; overflow: hidden;
          display: flex; align-items: center; gap: 12px;
          padding: 0 20px; height: 52px;
        }
        .ab-sweep {
          position: absolute; top: 0; left: 0; width: 25%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.07), transparent);
          animation: ab-sweep 3.5s ease-in-out infinite;
          pointer-events: none;
        }
        .ab-dot { position: relative; width: 10px; height: 10px; flex-shrink: 0; }
        .ab-ring { position: absolute; inset: 0; border-radius: 50%; animation: ab-pulse 1.8s ease-in-out infinite; }
        .ab-core { position: absolute; inset: 2px; border-radius: 50%; }
        .ab-pill {
          font-size: 10px; font-weight: 800; letter-spacing: .12em;
          text-transform: uppercase; padding: 3px 9px; border-radius: 4px;
          color: #ffffff; flex-shrink: 0;
        }
        .ab-div { width: 1px; height: 20px; flex-shrink: 0; }
        .ab-title {
          font-size: 14px; font-weight: 700; color: #ffffff;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          flex-shrink: 1; min-width: 0;
        }
        .ab-msg {
          font-size: 13px; color: rgba(255,255,255,0.9);
          overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          flex: 1; min-width: 0;
        }
        .ab-spacer { flex: 1; min-width: 8px; }
        .ab-cta {
          font-size: 11px; font-weight: 800; letter-spacing: .08em;
          text-transform: uppercase; padding: 5px 13px; border-radius: 5px;
          color: #ffffff; text-decoration: none; flex-shrink: 0;
          transition: opacity .15s;
        }
        .ab-cta:hover { opacity: .75; }
        .ab-x {
          background: none; border: none; cursor: pointer;
          font-size: 22px; line-height: 1; padding: 0 4px;
          color: #ffffff; flex-shrink: 0; transition: opacity .15s;
        }
        .ab-x:hover { opacity: .7; }
        @media (max-width: 600px) {
          .ab-bar  { padding: 0 14px; gap: 8px; height: 48px; }
          .ab-msg  { display: none; }
          .ab-title { font-size: 13px; }
          .ab-pill  { font-size: 9px; padding: 2px 7px; }
          .ab-cta   { font-size: 10px; padding: 4px 10px; }
        }
      `}</style>

      <div className="ab-wrap">
        {visible.map(b => {
          const s = S[b.severity]
          return (
            <div
              key={b.id}
              className="ab-bar"
              style={{ background: s.bg, borderBottom: `1px solid ${s.border}` }}
            >
              <div className="ab-sweep" />

              <div className="ab-dot">
                <div className="ab-ring" style={{ background: s.dot }} />
                <div className="ab-core" style={{ background: s.dot }} />
              </div>

              <span className="ab-pill" style={{ background: s.pill, border: `1px solid ${s.pillBorder}` }}>
                {b.severity}
              </span>

              <div className="ab-div" style={{ background: s.div }} />

              <span className="ab-title">{b.title}</span>

              {b.message && b.message !== b.title && (
                <span className="ab-msg">{b.message}</span>
              )}

              <div className="ab-spacer" />

              {b.cta_text && b.cta_url && (
                <a
                  href={b.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ab-cta"
                  style={{ background: s.cta, border: `1px solid ${s.ctaBorder}` }}
                >
                  {b.cta_text}
                </a>
              )}

              <button
                className="ab-x"
                onClick={() => setDismissed(prev => new Set([...prev, b.id]))}
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
