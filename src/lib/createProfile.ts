// 📁 src/lib/createProfile.ts
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { auth: { persistSession: false } }
);

export async function createOrUpdateProfile(user: any) {
  if (!user) return;

  const { id, user_metadata } = user;

  // Profili var mı kontrol et
  const { data: existing, error: selectError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", id)
    .single();

  if (selectError && selectError.code !== "PGRST116") {
    console.error("profiles SELECT error:", selectError);
    return;
  }

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
    // Yeni profil oluştur
    const { error: insertError } = await supabase.from("profiles").insert({
      id: id,
      full_name: fullName,
      avatar_url: avatarUrl,
      website: null,
      country: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("profiles INSERT error:", insertError);
    }
  } else {
    // Mevcut profili güncelle
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (updateError) {
      console.error("profiles UPDATE error:", updateError);
    }
  }
}
