import { supabase } from "./supabaseClient";

export async function createOrUpdateProfile(user: any) {
  if (!user) return;

  const { id, user_metadata } = user;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();

  const fullName =
    user_metadata?.full_name ||
    user_metadata?.name ||
    user_metadata?.display_name ||
    null;

  const avatarUrl =
    user_metadata?.avatar_url ||
    user_metadata?.picture ||
    null;

  if (!existing) {
    await supabase.from("profiles").insert({
      id,
      full_name: fullName,
      avatar_url: avatarUrl,
      website: null,
      country: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  } else {
    await supabase.from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      })
      .eq("id", id);
  }
}
