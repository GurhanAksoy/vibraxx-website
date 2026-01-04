// src/lib/createProfile.ts
import { supabase } from "@/lib/supabaseClient";

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

  // Get country from user metadata (set by callback page auto-detection)
  const country = user_metadata?.country || '🌍';

  if (!existing) {
    // Yeni profil oluştur
    const { error: insertError } = await supabase.from("profiles").insert({
      id: id,
      full_name: fullName,
      avatar_url: avatarUrl,
      country: country, // ✅ Country eklendi!
      round_credits: 0, // ✅ Default credits
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (insertError) {
      console.error("profiles INSERT error:", insertError);
    }
  } else {
    // Mevcut profili güncelle
    const updateData: any = {
      full_name: fullName,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString(),
    };

    // Only update country if it's different and not default
    if (country && country !== '🌍') {
      updateData.country = country;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", id);

    if (updateError) {
      console.error("profiles UPDATE error:", updateError);
    }
  }
}
