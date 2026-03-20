'use client'

import { useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { initToastRealtime, toastStore } from '@/lib/toastStore'
import ToastContainer from '@/components/ToastContainer'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  console.log('[AppLayout] render')

  useEffect(() => {
    console.log('[AppLayout] useEffect fired')
    supabase.auth.getUser().then(({ data }) => {
      console.log('[AppLayout] user:', data.user?.id ?? 'no user')
      if (data.user?.id) {
        initToastRealtime(data.user.id)
        // 2 saniye sonra test toast
        setTimeout(() => {
          toastStore.success('Toast system active!')
        }, 2000)
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
