'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { initToastRealtime } from '@/lib/toastStore'
import ToastContainer from '@/components/ToastContainer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Kullanıcı oturum açıksa realtime başlat
    supabase.auth.getUser().then(({ data }) => {
      if (data.user?.id) {
        initToastRealtime(data.user.id)
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
