"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { User, LogOut, Trophy } from "lucide-react";

export default function MinimalHomepage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [credits, setCredits] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUser();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
      if (session?.user) loadCredits(session.user.id);
    });
    return () => authListener.subscription.unsubscribe();
  }, []);

  async function loadUser() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
    if (user) await loadCredits(user.id);
    setLoading(false);
  }

  async function loadCredits(userId: string) {
    const { data } = await supabase
      .from('user_credits')
      .select('live_credits')
      .eq('user_id', userId)
      .single();
    setCredits(data?.live_credits || 0);
  }

  async function handleSignIn() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setCredits(0);
  }

  function handleEnterLobby() {
    if (!user) {
      handleSignIn();
      return;
    }
    router.push('/lobby');
  }

  if (loading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{ color: 'white', fontSize: 24 }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: 20
    }}>
      {/* Header */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        background: 'rgba(255,255,255,0.1)',
        borderRadius: 16,
        marginBottom: 40
      }}>
        <h1 style={{ color: 'white', fontSize: 28, fontWeight: 700, margin: 0 }}>
          VibraXX
        </h1>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          {user ? (
            <>
              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,215,0,0.2)',
                border: '1px solid rgba(255,215,0,0.5)',
                borderRadius: 8,
                color: 'gold',
                fontSize: 14,
                fontWeight: 600
              }}>
                ✨ {credits} Rounds
              </div>

              <div style={{
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.1)',
                borderRadius: 8,
                color: 'white',
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 8
              }}>
                <User size={16} />
                {user.user_metadata?.full_name || user.email?.split('@')[0]}
              </div>

              <button
                onClick={() => router.push('/leaderboard')}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <Trophy size={16} />
                Leaderboard
              </button>

              <button
                onClick={handleSignOut}
                style={{
                  padding: '10px 20px',
                  background: 'rgba(255,255,255,0.1)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: 8,
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={handleSignIn}
              style={{
                padding: '12px 32px',
                background: 'white',
                border: 'none',
                borderRadius: 8,
                color: '#667eea',
                cursor: 'pointer',
                fontSize: 16,
                fontWeight: 700
              }}
            >
              Sign In with Google
            </button>
          )}
        </div>
      </header>

      {/* Hero */}
      <div style={{
        textAlign: 'center',
        maxWidth: 800,
        margin: '100px auto',
        color: 'white'
      }}>
        <h2 style={{ fontSize: 64, fontWeight: 800, marginBottom: 20 }}>
          Global Live Quiz
        </h2>
        <p style={{ fontSize: 24, marginBottom: 60, opacity: 0.9 }}>
          Compete with players worldwide. Win prizes. Test your knowledge.
        </p>

        <button
          onClick={handleEnterLobby}
          style={{
            padding: '24px 64px',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            border: 'none',
            borderRadius: 16,
            color: 'white',
            fontSize: 24,
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          🎮 Enter Live Arena
        </button>

        {!user && (
          <p style={{ marginTop: 20, fontSize: 14, opacity: 0.7 }}>
            Sign in to join the competition
          </p>
        )}
      </div>
    </div>
  );
}
