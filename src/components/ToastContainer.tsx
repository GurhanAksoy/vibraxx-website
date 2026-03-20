'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { toastStore, Toast } from '@/lib/toastStore'

const TYPE_STYLES = {
  success: {
    bg:     'linear-gradient(135deg,rgba(16,185,129,0.15),rgba(5,150,105,0.1))',
    border: 'rgba(16,185,129,0.4)',
    dot:    '#10b981',
    color:  '#6ee7b7',
    icon:   '✓',
  },
  warning: {
    bg:     'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(217,119,6,0.1))',
    border: 'rgba(245,158,11,0.4)',
    dot:    '#f59e0b',
    color:  '#fcd34d',
    icon:   '⚠',
  },
  error: {
    bg:     'linear-gradient(135deg,rgba(239,68,68,0.15),rgba(220,38,38,0.1))',
    border: 'rgba(239,68,68,0.4)',
    dot:    '#ef4444',
    color:  '#fca5a5',
    icon:   '✕',
  },
  info: {
    bg:     'linear-gradient(135deg,rgba(124,58,237,0.15),rgba(109,40,217,0.1))',
    border: 'rgba(124,58,237,0.4)',
    dot:    '#a78bfa',
    color:  '#c4b5fd',
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
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px',
        background: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 10,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
        minWidth: 240, maxWidth: 360,
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.3s ease',
        cursor: 'pointer',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}
      onClick={onDismiss}
    >
      {/* icon */}
      <div style={{
        width: 24, height: 24, borderRadius: 6, flexShrink: 0,
        background: `${s.dot}22`,
        border: `1px solid ${s.border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 12, fontWeight: 900, color: s.dot,
        fontStyle: 'normal',
      }}>
        {s.icon}
      </div>

      {/* message */}
      <span style={{ fontSize: 13, fontWeight: 600, color: s.color, flex: 1, lineHeight: 1.4 }}>
        {toast.message}
      </span>

      {/* dismiss */}
      <span style={{ fontSize: 16, color: s.color, opacity: 0.5, lineHeight: 1, flexShrink: 0 }}>×</span>
    </div>
  )
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const unsub = toastStore.subscribe(setToasts)
    return unsub
  }, [])

  if (!mounted) return null

  return createPortal(
    <>
      <style>{`
        @keyframes toast-in {
          from { transform: translateX(120%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
      <div style={{
        position: 'fixed',
        top: 16, right: 16,
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
      </div>
    </>,
    document.body
  )
}
