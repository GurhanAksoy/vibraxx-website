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
    neon:      '#a78bfa',
    neonGlow:  'rgba(124,58,237,0.7)',
    border:    'rgba(167,139,250,0.6)',
    bg:        'linear-gradient(135deg,#1a0a3a 0%,#0f0a2a 50%,#1a0f3a 100%)',
    iconBg:    'linear-gradient(135deg,#7c3aed,#a855f7)',
    iconGlow:  'rgba(124,58,237,0.8)',
    btnBg:     'linear-gradient(135deg,#7c3aed,#d946ef)',
    btnGlow:   'rgba(124,58,237,0.6)',
    pillBg:    'rgba(167,139,250,0.15)',
    pillBorder:'rgba(167,139,250,0.5)',
    pillColor: '#c4b5fd',
    icon:      'i',
  },
  warning: {
    neon:      '#fbbf24',
    neonGlow:  'rgba(245,158,11,0.7)',
    border:    'rgba(251,191,36,0.6)',
    bg:        'linear-gradient(135deg,#2a1a00 0%,#1a1000 50%,#2a1500 100%)',
    iconBg:    'linear-gradient(135deg,#f59e0b,#fbbf24)',
    iconGlow:  'rgba(245,158,11,0.8)',
    btnBg:     'linear-gradient(135deg,#d97706,#fbbf24)',
    btnGlow:   'rgba(245,158,11,0.6)',
    pillBg:    'rgba(251,191,36,0.15)',
    pillBorder:'rgba(251,191,36,0.5)',
    pillColor: '#fcd34d',
    icon:      '⚠',
  },
  critical: {
    neon:      '#ef4444',
    neonGlow:  'rgba(239,68,68,0.7)',
    border:    'rgba(239,68,68,0.65)',
    bg:        'linear-gradient(135deg,#2a0a0a 0%,#1a0505 50%,#2a0808 100%)',
    iconBg:    'linear-gradient(135deg,#dc2626,#ef4444)',
    iconGlow:  'rgba(239,68,68,0.8)',
    btnBg:     'linear-gradient(135deg,#dc2626,#ef4444)',
    btnGlow:   'rgba(239,68,68,0.6)',
    pillBg:    'rgba(239,68,68,0.15)',
    pillBorder:'rgba(239,68,68,0.5)',
    pillColor: '#fca5a5',
    icon:      '!',
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
      if (modals.length > 0) { setModal(modals[0]); setVisible(true) }
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
          from { opacity:0; transform:scale(0.9) translateY(24px); }
          to   { opacity:1; transform:scale(1)   translateY(0); }
        }
        @keyframes am-fade { from{opacity:0} to{opacity:1} }
        @keyframes am-neon {
          0%,100% { box-shadow: 0 0 20px var(--am-glow), 0 0 40px var(--am-glow), inset 0 0 20px rgba(255,255,255,0.03); }
          50%      { box-shadow: 0 0 35px var(--am-glow), 0 0 70px var(--am-glow), inset 0 0 30px rgba(255,255,255,0.05); }
        }
        @keyframes am-icon-pulse {
          0%,100% { box-shadow: 0 0 20px var(--am-icon-glow); }
          50%      { box-shadow: 0 0 40px var(--am-icon-glow), 0 0 60px var(--am-icon-glow); }
        }
        @keyframes am-shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .am-overlay {
          position: fixed; inset: 0; z-index: 9999;
          background: rgba(0,0,0,0.85);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: am-fade 0.2s ease-out;
        }
        .am-card {
          position: relative;
          border-radius: 24px;
          padding: 32px 28px 28px;
          max-width: 460px; width: 100%;
          animation: am-in 0.3s cubic-bezier(0.34,1.56,0.64,1), am-neon 3s ease-in-out infinite 0.3s;
          overflow: hidden;
        }
        .am-card::before {
          content: '';
          position: absolute; inset: 0; border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 50%, rgba(255,255,255,0.02) 100%);
          pointer-events: none;
        }
        .am-card::after {
          content: '';
          position: absolute; top: 0; left: -100%; width: 60%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          animation: am-shimmer 4s ease-in-out infinite;
          pointer-events: none;
        }
        .am-close {
          position: absolute; top: 14px; right: 14px;
          width: 30px; height: 30px; border-radius: 8px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
          font-size: 18px; line-height: 1;
          transition: all 0.15s; z-index: 10;
        }
        .am-close:hover { background: rgba(255,255,255,0.14); color: #fff; }
        .am-icon {
          width: 56px; height: 56px; border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          font-size: 22px; font-style: normal; font-weight: 900;
          color: white; margin-bottom: 18px;
          position: relative; z-index: 1;
          animation: am-icon-pulse 2.5s ease-in-out infinite;
        }
        .am-pill {
          display: inline-block;
          font-size: 9px; font-weight: 800; letter-spacing: .14em;
          text-transform: uppercase; padding: 3px 10px; border-radius: 4px;
          margin-bottom: 10px; position: relative; z-index: 1;
        }
        .am-title {
          font-size: 22px; font-weight: 900; color: #ffffff;
          line-height: 1.2; margin-bottom: 12px;
          position: relative; z-index: 1;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .am-message {
          font-size: 14px; color: rgba(255,255,255,0.78);
          line-height: 1.7; margin-bottom: 24px;
          position: relative; z-index: 1;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .am-actions { display: flex; gap: 10px; position: relative; z-index: 1; }
        .am-btn-primary {
          flex: 1; padding: 14px 20px; border-radius: 12px;
          border: none; cursor: pointer; color: #ffffff;
          font-size: 15px; font-weight: 800; letter-spacing: 0.02em;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: transform 0.2s, opacity 0.2s;
          background-size: 200% 100%;
          animation: am-shimmer 3s linear infinite;
        }
        .am-btn-primary:hover { transform: translateY(-2px); opacity: 0.9; }
        .am-btn-dismiss {
          padding: 14px 20px; border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          cursor: pointer; color: rgba(255,255,255,0.55);
          font-size: 14px; font-weight: 600;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          transition: all 0.15s; white-space: nowrap;
        }
        .am-btn-dismiss:hover { background: rgba(255,255,255,0.1); color: #fff; }
        @media (max-width: 480px) {
          .am-card { padding: 24px 18px 20px; border-radius: 18px; }
          .am-title { font-size: 18px; }
          .am-message { font-size: 13px; }
          .am-actions { flex-direction: column; }
          .am-btn-dismiss { text-align: center; }
        }
      `}</style>

      <div className="am-overlay" onClick={dismiss}>
        <div
          className="am-card"
          style={{
            background: s.bg,
            border: `1px solid ${s.border}`,
            ['--am-glow' as any]: s.neonGlow,
            ['--am-icon-glow' as any]: s.iconGlow,
          }}
          onClick={e => e.stopPropagation()}
        >
          <button className="am-close" onClick={dismiss}>×</button>

          <div
            className="am-icon"
            style={{
              background: s.iconBg,
              boxShadow: `0 0 24px ${s.iconGlow}`,
            }}
          >
            {s.icon}
          </div>

          <span
            className="am-pill"
            style={{
              background: s.pillBg,
              border: `1px solid ${s.pillBorder}`,
              color: s.pillColor,
            }}
          >
            {modal.severity}
          </span>

          <div className="am-title">{modal.title}</div>
          <div className="am-message">{modal.message}</div>

          <div className="am-actions">
            {modal.cta_text && modal.cta_url ? (
              <>
                <a
                  href={modal.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="am-btn-primary"
                  style={{
                    background: s.btnBg,
                    boxShadow: `0 8px 28px ${s.btnGlow}`,
                    textDecoration: 'none',
                    textAlign: 'center',
                  }}
                >
                  {modal.cta_text}
                </a>
                <button className="am-btn-dismiss" onClick={dismiss}>Dismiss</button>
              </>
            ) : (
              <button
                className="am-btn-primary"
                style={{
                  background: s.btnBg,
                  boxShadow: `0 8px 28px ${s.btnGlow}`,
                }}
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
