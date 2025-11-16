import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

// 🔥 Kullanıcının browser'daki Supabase client'ına session göndereceğiz
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const next = url.searchParams.get("next") || "/";

    if (!code) {
      console.error("❌ No OAuth code provided");
      return NextResponse.redirect("https://vibraxx.com");
    }

    // 🍪 Cookie üzerinden browser'a session basmak için
    const cookieStore = cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          get(name) { return cookieStore.get(name)?.value; },
          set(name, value, options) { cookieStore.set(name, value, options); },
          remove(name, options) { cookieStore.set(name, "", { ...options, maxAge: 0 }); },
        },
      }
    );

    // 🔥 Session oluştur (Google code → session)
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.error("❌ OAuth session exchange error:", error);
      return NextResponse.redirect("https://vibraxx.com");
    }

    const session = data.session;
    if (!session?.user) {
      console.error("❌ Session returned but no user");
      return NextResponse.redirect("https://vibraxx.com");
    }

    const user = session.user;
    const userId = user.id;

    // ======================================================
    // 🧠 PROFILE OLUŞTUR / GÜNCELLE
    // ======================================================
    const { data: profile } = await supabaseServer
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    const userName =
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Player";

    if (!profile) {
      // 🆕 Yeni kullanıcı ise profil yarat
      await supabaseServer.from("profiles").insert([
        {
          id: userId,
          name: userName,
          rounds: 0,
          is_over_18: false,
        },
      ]);
      console.log("🆕 New profile created:", userName);
    } else {
      // 🔄 Var olan profil – isim güncellemesi
      await supabaseServer
        .from("profiles")
        .update({ name: userName })
        .eq("id", userId);
    }

    // ======================================================
    // 🎯 Başarılı → kullanıcıyı yönlendir
    // ======================================================

    const redirectUrl =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://vibraxx.com";

    return NextResponse.redirect(redirectUrl);
  } catch (err) {
    console.error("🔥 OAuth Callback Fatal Error:", err);

    return NextResponse.redirect(
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : "https://vibraxx.com"
    );
  }
}
