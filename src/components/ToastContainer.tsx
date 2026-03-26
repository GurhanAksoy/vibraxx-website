'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toastStore, Toast, canFireRoundToast, markRoundToastFired } from '@/lib/toastStore'
import { supabase } from '@/lib/supabaseClient'

const TYPE_STYLES = {
  success: {
    bg:     'linear-gradient(135deg, #0a2a1a 0%, #0f1f14 100%)',
    border: 'rgba(16,185,129,0.4)',
    dot:    '#10b981',
    icon:   '✓',
  },
  warning: {
    bg:     'linear-gradient(135deg, #2a1a00 0%, #1f1500 100%)',
    border: 'rgba(245,158,11,0.4)',
    dot:    '#f59e0b',
    icon:   '⚠',
  },
  error: {
    bg:     'linear-gradient(135deg, #2a0a0a 0%, #1f0808 100%)',
    border: 'rgba(239,68,68,0.4)',
    dot:    '#ef4444',
    icon:   '✕',
  },
  info: {
    bg:     'linear-gradient(135deg, #1a0a3a 0%, #120820 100%)',
    border: 'rgba(124,58,237,0.4)',
    dot:    '#a78bfa',
    icon:   'i',
  },
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false)
  const s = TYPE_STYLES[toast.type]

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '12px 16px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderLeft: `3px solid ${s.dot}`,
        borderRadius: 12,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 20px ${s.dot}22`,
        minWidth: 280, maxWidth: 380,
        transform: visible ? 'translateX(0) translateY(0)' : 'translateX(100%) translateY(-10px)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      onClick={onDismiss}
    >
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: `${s.dot}22`,
        border: `1.5px solid ${s.dot}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14, fontWeight: 900, color: s.dot,
        fontStyle: 'normal',
        boxShadow: `0 0 12px ${s.dot}44`,
      }}>
        {s.icon}
      </div>

      <span style={{
        fontSize: 14, fontWeight: 700,
        color: '#ffffff',
        flex: 1, lineHeight: 1.4,
        textShadow: '0 1px 4px rgba(0,0,0,0.5)',
      }}>
        {toast.message}
      </span>

      <span style={{
        fontSize: 18, color: 'rgba(255,255,255,0.5)',
        lineHeight: 1, flexShrink: 0,
      }}>×</span>
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts]   = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const unsub = toastStore.subscribe(setToasts)

    const interval = setInterval(async () => {
      if (window.location.pathname === '/lobby') return

      const { data, error } = await supabase.rpc('get_homepage_state', { p_user_id: null })
      if (error || !data) return

      const t = data.next_round_in_seconds as number | null
      if (t === null || t <= 0) return

      // roundKey = tahmini round başlangıç zamanı (saniye cinsinden, 300sn'ye yuvarlanmış)
      const estimatedStartSec = Math.round(Date.now() / 1000) + t
      const roundKey = String(Math.floor(estimatedStartSec / 300) * 300)

      // Dar pencere: sadece 25-32 saniye arasında tetikle
      if (t >= 25 && t <= 32 && canFireRoundToast(roundKey)) {
        markRoundToastFired(roundKey)
        toastStore.warning('⚡ Round starting in 30 seconds!')
      }
    }, 5000)

    return () => {
      unsub()
      clearInterval(interval)
    }
  }, [])

  if (!mounted) return null

  return createPortal(
    <div style={{
      position: 'fixed',
      top: 90, right: 16,
      zIndex: 99999,
      display: 'flex', flexDirection: 'column', gap: 8,
      alignItems: 'flex-end',
      pointerEvents: toasts.length === 0 ? 'none' : 'auto',
    }}>
      {toasts.map(t => (
        <ToastItem
          key={t.id}
          toast={t}
          onDismiss={() => toastStore.dismiss(t.id)}
        />
      ))}
    </div>,
    document.body
  )
}
