"use client";

import { createBrowserClient } from "@supabase/ssr";

// Client-side Supabase instance (Google OAuth için zorunlu)
export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  {
    auth: {
      persistSession: true,      // session storage
      autoRefreshToken: true,    // access token yenileme
      detectSessionInUrl: true,  // Google OAuth için şart
    },
  }
);
