import { createClient } from "@supabase/supabase-js";

// ❗ Public URL kullanılmaz — Admin için özel env
const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url) throw new Error("Missing SUPABASE_URL environment variable");
if (!serviceKey) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: {
    persistSession: false,
  },
});
