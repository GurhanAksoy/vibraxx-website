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
  success: 5000,
  info:    5000,
  warning: 6000,
  error:   7000,
}

// ── Singleton state ──
let toasts:    Toast[]    = []
let listeners: Listener[] = []
let channelRef:      ReturnType<typeof supabase.channel> | null = null
let roundChannelRef: ReturnType<typeof supabase.channel> | null = null
let roundTimerRef:   ReturnType<typeof setTimeout> | null = null
let lastRoundId = ''

// ── Round toast dedup — sessionStorage bazlı ──
const ROUND_TOAST_KEY = 'vx_round_toast_key'

export function canFireRoundToast(roundKey: string): boolean {
  try {
    const stored = sessionStorage.getItem(ROUND_TOAST_KEY)
    return stored !== roundKey
  } catch {
    return true
  }
}

export function markRoundToastFired(roundKey: string): void {
  try {
    sessionStorage.setItem(ROUND_TOAST_KEY, roundKey)
  } catch {}
}

export function resetRoundToast(): void {
  try {
    sessionStorage.removeItem(ROUND_TOAST_KEY)
  } catch {}
}

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

// ── Realtime subscriptions ──
export function initToastRealtime(userId: string) {
  if (channelRef) return

  channelRef = supabase
    .channel(`toast-credits-${userId}`)
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'v2_credit_ledger',
    }, payload => {
      const row = payload.new as { delta_paid: number; delta_bonus: number; user_id: string }
      if (row.user_id !== userId) return
      const delta = (row.delta_paid ?? 0) + (row.delta_bonus ?? 0)
      if (delta > 0) {
        toastStore.success(`+${delta} credit${delta > 1 ? 's' : ''} added`)
      }
    })
    .subscribe()

  if (roundChannelRef) return
  roundChannelRef = supabase
    .channel('toast-rounds')
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  'v2_rounds',
    }, payload => {
      const row = payload.new as { id: string; scheduled_start: string; status: string }
      if (!row.scheduled_start) return
      if (row.id === lastRoundId) return
      lastRoundId = row.id

      const startAt = new Date(row.scheduled_start).getTime()
      const now     = Date.now()
      const msUntil = startAt - now - 30000

      if (msUntil < 0 || msUntil > 15 * 60 * 1000) return

      if (roundTimerRef) clearTimeout(roundTimerRef)
      roundTimerRef = setTimeout(() => {
        const isOnLobby = window.location.pathname === '/lobby'
        if (!isOnLobby) {
          toastStore.warning('⚡ Round starting in 30 seconds!')
        }
      }, msUntil)
    })
    .subscribe()
}

export function destroyToastRealtime() {
  if (channelRef)      { supabase.removeChannel(channelRef);      channelRef      = null }
  if (roundChannelRef) { supabase.removeChannel(roundChannelRef); roundChannelRef = null }
  if (roundTimerRef)   { clearTimeout(roundTimerRef);             roundTimerRef   = null }
}
