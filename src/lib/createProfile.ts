import { supabase } from "./supabaseClient";

export async function createOrUpdateProfile(user) {
  if (!user) return;

  const { id, email, user_metadata } = user;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();

  if (!existing) {
    await supabase.from("profiles").insert({
      id: id,
      email: email,
      full_name: user_metadata.full_name,
      avatar: user_metadata.avatar_url || user_metadata.picture || null,
      provider: "google",
      created_at: new Date().toISOString(),
    });
  }
}
