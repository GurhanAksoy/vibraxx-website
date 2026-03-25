'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { initToastRealtime } from '@/lib/toastStore'
import ToastContainer from '@/components/ToastContainer'

async function detectAndSaveCountry(userId: string) {
  const { data: profile } = await supabase
    .from('v2_users_public')
    .select('country')
    .eq('user_id', userId)
    .single()

  if (profile?.country && profile.country.length === 2) return

  try {
    const res  = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    const code = data.country_code
    if (code && code.length === 2) {
      await supabase
        .from('v2_users_public')
        .update({ country: code })
        .eq('user_id', userId)
    }
  } catch {
    // sessizce geç
  }
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        initToastRealtime(data.user.id)
        detectAndSaveCountry(data.user.id)
      }
    })
  }, [])

  return (
    <>
      <ToastContainer />
      {children}
    </>
  )
}
