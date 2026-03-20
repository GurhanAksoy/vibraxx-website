import { supabase } from '@/lib/supabaseClient'

export type ToastType = 'success' | 'warning' | 'error' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration: number
}

type Listener = (toasts: Toast[]) => void

const DURATION: Record<ToastType, number> = {
  success: 3000,
  info:    3000,
  warning: 4000,
  error:   5000,
}

// ── Singleton state ──
let toasts:      Toast[]    = []
let listeners:   Listener[] = []
let lastMsg    = ''
let lastTime   = 0
let channelRef: ReturnType<typeof supabase.channel> | null = null

function notify() {
  listeners.forEach(l => l([...toasts]))
}

export const toastStore = {
  subscribe(fn: Listener) {
    listeners.push(fn)
    fn([...toasts])
    return () => { listeners = listeners.filter(l => l !== fn) }
  },

  show(type: ToastType, message: string) {
    const now = Date.now()
    if (message === lastMsg && now - lastTime < 2000) return
    lastMsg  = message
    lastTime = now

    const id       = Math.random().toString(36).slice(2)
    const duration = DURATION[type]
    toasts = [...toasts.slice(-2), { id, type, message, duration }]
    notify()
    setTimeout(() => toastStore.dismiss(id), duration)
  },

  dismiss(id: string) {
    toasts = toasts.filter(t => t.id !== id)
    notify()
  },

  success: (msg: string) => toastStore.show('success', msg),
  warning: (msg: string) => toastStore.show('warning', msg),
  error:   (msg: string) => toastStore.show('error',   msg),
  info:    (msg: string) => toastStore.show('info',    msg),
}

// ── Realtime subscription ──
export function initToastRealtime(userId: string) {
  // Zaten bu user için channel açıksa tekrar açma
  if (channelRef) return

  channelRef = supabase
    .channel(`toast-credits-${userId}`)
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'v2_credit_ledger',
      filter: `user_id=eq.${userId}`,
    }, payload => {
      const row   = payload.new as { delta_paid: number; delta_bonus: number; reason: string }
      const delta = (row.delta_paid ?? 0) + (row.delta_bonus ?? 0)
      if (delta > 0) {
        toastStore.success(`+${delta} credit${delta > 1 ? 's' : ''} added`)
      }
    })

  channelRef.subscribe((status) => {
    console.log('[Toast] Realtime status:', status)
    if (status === 'SUBSCRIBED') {
      console.log('[Toast] Realtime subscribed for', userId)
    } else if (status === 'CHANNEL_ERROR') {
      console.error('[Toast] Realtime subscription failed')
      channelRef = null
    }
  })
}

export function destroyToastRealtime() {
  if (channelRef) {
    supabase.removeChannel(channelRef)
    channelRef = null
  }
}
