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
    accent:     '#a78bfa',
    border:     'rgba(167,139,250,0.4)',
    bg:         'rgba(124,58,237,0.12)',
    btnBg:      'linear-gradient(135deg,#7c3aed,#a855f7)',
    btnShadow:  'rgba(124,58,237,0.5)',
    icon:       'ℹ',
    iconColor:  '#a78bfa',
  },
  warning: {
    accent:     '#fbbf24',
    border:     'rgba(251,191,36,0.4)',
    bg:         'rgba(245,158,11,0.1)',
    btnBg:      'linear-gradient(135deg,#f59e0b,#fbbf24)',
    btnShadow:  'rgba(245,158,11,0.5)',
    icon:       '⚠',
    iconColor:  '#fbbf24',
  },
  critical: {
    accent:     '#ef4444',
    border:     'rgba(239,68,68,0.5)',
    bg:         'rgba(239,68,68,0.1)',
    btnBg:      'linear-gradient(135deg,#dc2626,#ef4444)',
    btnShadow:  'rgba(239,68,68,0.5)',
    icon:       '!',
    iconColor:  '#ef4444',
  },
}

const LS_KEY = 'vx_dismissed_modals'

const getDismissed = (): number[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) ?? '[]') } catch { return [] }
}

const addDismissed = (id: number) => {
  const prev = getDismissed()
  localStorage.setItem(LS_KEY, JSON.stringify([...new Set([...prev, id])]))
}

export default function AnnouncementModal() {
  const [modal, setModal] = useState<Announcement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.rpc('get_active_announcements')
      if (!data) return

      const dismissed = getDismissed()
      const modals = (data as Announcement[]).filter(
        a => a.type === 'modal' && !dismissed.includes(a.id)
      )

      if (modals.length > 0) {
        setModal(modals[0])
        setVisible(true)
      }
    }

    fetch()

    const channel = supabase
      .channel('announcements-modal')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'v2_announcements' }, fetch)
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const dismiss = () => {
    if (modal) addDismissed(modal.id)
    setVisible(false)
  }

  if (!visible || !modal) return null

  const s = S[modal.severity]

  return (
    <>
      <style>{`
        @keyframes am-in {
          from { opacity: 0; transform: scale(0.94) translateY(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes am-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        .am-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: am-fade 0.2s ease-out;
        }
        .am-card {
          position: relative;
          background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
          border-radius: 24px;
          padding: 36px 32px 28px;
          max-width: 480px;
          width: 100%;
          animation: am-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        .am-close {
          position: absolute; top: 16px; right: 16px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          width: 32px; height: 32px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.6);
          font-size: 18px; line-height: 1;
          transition: all 0.15s;
        }
        .am-close:hover { background: rgba(255,255,255,0.12); color: #ffffff; }
        .am-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; margin-bottom: 20px;
          font-style: normal;
        }
        .am-sev {
          font-size: 10px; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; padding: 3px 9px; border-radius: 4px;
          display: inline-block; margin-bottom: 10px;
        }
        .am-title {
          font-size: 22px; font-weight: 800; color: #ffffff;
          line-height: 1.25; margin-bottom: 12px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .am-message {
          font-size: 15px; color: rgba(255,255,255,0.75);
          line-height: 1.65; margin-bottom: 24px;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .am-actions { display: flex; gap: 10px; }
        .am-btn-cta {
          flex: 1; padding: 13px 20px; border-radius: 12px;
          border: none; cursor: pointer; color: #ffffff;
          font-size: 14px; font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: opacity 0.2s, transform 0.2s;
        }
        .am-btn-cta:hover { opacity: 0.85; transform: translateY(-1px); }
        .am-btn-dismiss {
          padding: 13px 20px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          cursor: pointer; color: rgba(255,255,255,0.6);
          font-size: 14px; font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: all 0.15s; white-space: nowrap;
        }
        .am-btn-dismiss:hover { background: rgba(255,255,255,0.1); color: #ffffff; }
        @media (max-width: 480px) {
          .am-card { padding: 28px 20px 22px; border-radius: 18px; }
          .am-title { font-size: 18px; }
          .am-message { font-size: 14px; }
          .am-actions { flex-direction: column; }
        }
      `}</style>

      <div className="am-overlay" onClick={dismiss}>
        <div
          className="am-card"
          style={{ border: `1px solid ${s.border}`, boxShadow: `0 0 60px ${s.btnShadow}33, 0 24px 64px rgba(0,0,0,0.5)` }}
          onClick={e => e.stopPropagation()}
        >
          {/* close */}
          <button className="am-close" onClick={dismiss}>×</button>

          {/* icon */}
          <div
            className="am-icon"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.iconColor }}
          >
            {s.icon}
          </div>

          {/* severity */}
          <span
            className="am-sev"
            style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.accent }}
          >
            {modal.severity}
          </span>

          {/* title */}
          <div className="am-title">{modal.title}</div>

          {/* message */}
          <div className="am-message">{modal.message}</div>

          {/* actions */}
          <div className="am-actions">
            {modal.cta_text && modal.cta_url ? (
              <>
                <a
                  href={modal.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="am-btn-cta"
                  style={{ background: s.btnBg, boxShadow: `0 8px 24px ${s.btnShadow}`, textDecoration: 'none', textAlign: 'center' }}
                >
                  {modal.cta_text}
                </a>
                <button className="am-btn-dismiss" onClick={dismiss}>Dismiss</button>
              </>
            ) : (
              <button
                className="am-btn-cta"
                style={{ background: s.btnBg, boxShadow: `0 8px 24px ${s.btnShadow}` }}
                onClick={dismiss}
              >
                Got it
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
