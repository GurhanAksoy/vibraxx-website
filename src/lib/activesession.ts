
import { supabase } from "@/lib/supabaseClient";

export async function updateActiveSession(userId: string, location = "HOME") {
  await supabase.from("active_sessions").upsert({
    user_id: userId,
    in_lobby: false,
    location,
    last_activity: new Date(),
  });
}