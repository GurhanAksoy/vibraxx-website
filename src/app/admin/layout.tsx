'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

const NAV = [
  { href: '/admin/dashboard', label: 'Dashboard' },
  { href: '/admin/rounds',    label: 'Rounds'    },
  { href: '/admin/health',    label: 'Health'    },
  { href: '/admin/credits',   label: 'Credits'   },
  { href: '/admin/pool',      label: 'Pool'      },
]

function UTCClock() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const tick = () => {
      const now = new Date()
      setTime(
        now.toUTCString().slice(17, 25) + ' UTC'
      )
    }
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [])
  return <span className="admin-clock">{time}</span>
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        window.location.href = '/'
      }
    })
  }, [])

  const [criticalCount, setCriticalCount] = useState<number | null>(null)

  useEffect(() => {
    // Poll critical health events count every 30s
    const fetchCritical = async () => {
      const { data: res } = await supabase.rpc('get_admin_health_state')
      if (res?.events) {
        const critical = (res.events as { severity: string }[])
          .filter(e => e.severity === 'critical').length
        setCriticalCount(critical)
      } else {
        setCriticalCount(0)
      }
    }
    fetchCritical()
    const id = setInterval(fetchCritical, 30000)
    return () => clearInterval(id)
  }, [supabase])

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --bg:        #0a0c0f;
          --surface:   #111418;
          --surface2:  #181c22;
          --border:    #1f252e;
          --border2:   #2a3240;
          --text:      #e2e8f0;
          --muted:     #64748b;
          --accent:    #6366f1;
          --accent2:   #818cf8;
          --danger:    #ef4444;
          --warn:      #f59e0b;
          --success:   #22c55e;
          --info:      #38bdf8;
          --sidebar-w: 200px;
          --topbar-h:  48px;
          --font:      'DM Mono', 'Fira Code', 'Cascadia Code', monospace;
        }

        body { background: var(--bg); color: var(--text); font-family: var(--font); }

        /* ── top bar ── */
        .admin-topbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          height: var(--topbar-h);
          background: var(--surface);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          padding: 0 16px;
          gap: 20px;
          z-index: 100;
          font-size: 11px;
          letter-spacing: 0.05em;
        }

        .admin-brand {
          font-size: 13px;
          font-weight: 600;
          color: var(--accent2);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-right: 8px;
          white-space: nowrap;
        }

        .admin-topbar-divider {
          width: 1px;
          height: 20px;
          background: var(--border2);
        }

        .admin-clock {
          color: var(--muted);
          font-size: 11px;
          letter-spacing: 0.06em;
          white-space: nowrap;
        }

        .topbar-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .topbar-pill.danger  { background: #2a1515; color: var(--danger);  border: 1px solid #5a2020; }
        .topbar-pill.success { background: #0f2a1a; color: var(--success); border: 1px solid #1a4a2a; }
        .topbar-pill.muted   { background: var(--surface2); color: var(--muted); border: 1px solid var(--border); }

        .topbar-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: currentColor;
        }
        .topbar-dot.pulse {
          animation: topbar-pulse 1.5s ease-in-out infinite;
        }
        @keyframes topbar-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.3; }
        }

        .admin-topbar-spacer { flex: 1; }

        /* ── sidebar ── */
        .admin-sidebar {
          position: fixed;
          top: var(--topbar-h);
          left: 0;
          bottom: 0;
          width: var(--sidebar-w);
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 16px 0;
          z-index: 90;
          display: flex;
          flex-direction: column;
        }

        .admin-nav-section {
          padding: 0 10px;
          margin-bottom: 4px;
        }

        .admin-nav-label {
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 0 8px;
          margin-bottom: 6px;
          margin-top: 12px;
        }
        .admin-nav-label:first-child { margin-top: 0; }

        .admin-nav-link {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 7px 10px;
          border-radius: 5px;
          font-size: 12px;
          color: var(--muted);
          text-decoration: none;
          transition: background 0.1s, color 0.1s;
          letter-spacing: 0.02em;
          position: relative;
        }
        .admin-nav-link:hover {
          background: var(--surface2);
          color: var(--text);
        }
        .admin-nav-link.active {
          background: rgba(99,102,241,0.12);
          color: var(--accent2);
          border: 1px solid rgba(99,102,241,0.2);
        }
        .admin-nav-link.active::before {
          content: '';
          position: absolute;
          left: -10px;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 60%;
          background: var(--accent);
          border-radius: 0 2px 2px 0;
        }

        .admin-nav-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          background: var(--border2);
          flex-shrink: 0;
        }
        .admin-nav-link.active .admin-nav-dot { background: var(--accent); }

        /* ── main ── */
        .admin-main {
          margin-top: var(--topbar-h);
          margin-left: var(--sidebar-w);
          min-height: calc(100vh - var(--topbar-h));
          padding: 24px;
          background: var(--bg);
        }

        /* ── shared card ── */
        .admin-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 16px 20px;
        }

        /* ── shared stat card ── */
        .stat-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 14px 16px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          transition: border-color 0.15s;
        }
        .stat-card:hover { border-color: var(--border2); }
        .stat-card-label {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
        }
        .stat-card-value {
          font-size: 22px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
          letter-spacing: -0.02em;
        }
        .stat-card-value.accent  { color: var(--accent2); }
        .stat-card-value.success { color: var(--success); }
        .stat-card-value.danger  { color: var(--danger); }
        .stat-card-value.warn    { color: var(--warn); }
        .stat-card-sub {
          font-size: 10px;
          color: var(--muted);
        }

        /* ── badge ── */
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 2px 7px;
          border-radius: 3px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
        }
        .badge.live    { background: #0f2a1a; color: var(--success); border: 1px solid #1a4a2a; }
        .badge.warn    { background: #2a1e0a; color: var(--warn);    border: 1px solid #4a3210; }
        .badge.danger  { background: #2a1010; color: var(--danger);  border: 1px solid #5a1818; }
        .badge.info    { background: #0a1e2a; color: var(--info);    border: 1px solid #103040; }
        .badge.muted   { background: var(--surface2); color: var(--muted); border: 1px solid var(--border); }
        .badge.scheduled { background: #1a1a2a; color: var(--accent2); border: 1px solid #2a2a4a; }

        /* ── section title ── */
        .section-title {
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 12px;
        }

        /* ── page title ── */
        .page-title {
          font-size: 18px;
          font-weight: 700;
          color: var(--text);
          letter-spacing: -0.01em;
          margin-bottom: 4px;
        }
        .page-subtitle {
          font-size: 11px;
          color: var(--muted);
          margin-bottom: 24px;
        }

        /* ── table ── */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 12px;
        }
        .admin-table th {
          text-align: left;
          padding: 8px 12px;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--muted);
          border-bottom: 1px solid var(--border);
        }
        .admin-table td {
          padding: 10px 12px;
          border-bottom: 1px solid var(--border);
          color: var(--text);
          vertical-align: middle;
        }
        .admin-table tr:last-child td { border-bottom: none; }
        .admin-table tr:hover td { background: var(--surface2); }
        .admin-table td.mono { font-family: var(--font); font-size: 11px; }
        .admin-table td.muted { color: var(--muted); }

        /* ── button ── */
        .admin-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: 5px;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          border: 1px solid var(--border2);
          background: var(--surface2);
          color: var(--text);
          transition: background 0.1s, border-color 0.1s;
          font-family: var(--font);
        }
        .admin-btn:hover { background: #252d3a; border-color: #3a4555; }
        .admin-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .admin-btn.danger {
          border-color: #5a2020;
          background: #2a1515;
          color: var(--danger);
        }
        .admin-btn.danger:hover { background: #3a1818; }
        .admin-btn.primary {
          border-color: rgba(99,102,241,0.4);
          background: rgba(99,102,241,0.15);
          color: var(--accent2);
        }
        .admin-btn.primary:hover { background: rgba(99,102,241,0.25); }

        /* ── loading ── */
        .admin-loading {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--muted);
          font-size: 12px;
          padding: 40px 0;
        }
        .loading-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--accent);
          animation: ldot 1s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: 0.15s; }
        .loading-dot:nth-child(3) { animation-delay: 0.30s; }
        @keyframes ldot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40%            { transform: scale(1);   opacity: 1;   }
        }

        /* ── error ── */
        .admin-error {
          padding: 12px 16px;
          border-radius: 6px;
          background: #2a1010;
          border: 1px solid #5a1818;
          color: var(--danger);
          font-size: 12px;
        }

        /* ── grid helpers ── */
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }
        .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
        .stack  { display: flex; flex-direction: column; gap: 12px; }
        .row    { display: flex; gap: 12px; align-items: flex-start; }

        @media (max-width: 1100px) {
          .grid-4 { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 800px) {
          .grid-3, .grid-2 { grid-template-columns: 1fr; }
          .admin-sidebar { display: none; }
          .admin-main { margin-left: 0; }
        }
      `}</style>

      {/* ── top bar ── */}
      <header className="admin-topbar">
        <span className="admin-brand">VibraXX</span>
        <div className="admin-topbar-divider" />
        <UTCClock />
        <div className="admin-topbar-divider" />

        {criticalCount !== null && criticalCount > 0 ? (
          <Link href="/admin/health" style={{ textDecoration: 'none' }}>
            <span className="topbar-pill danger">
              <span className="topbar-dot pulse" />
              {criticalCount} critical
            </span>
          </Link>
        ) : (
          <span className="topbar-pill success">
            <span className="topbar-dot" />
            all clear
          </span>
        )}

        <div className="admin-topbar-spacer" />
        <span className="admin-clock" style={{ opacity: 0.4, fontSize: 10 }}>
          PHASE 1
        </span>
      </header>

      {/* ── sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-nav-section">
          <div className="admin-nav-label">Platform</div>
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`admin-nav-link${pathname === href || pathname?.startsWith(href + '/') ? ' active' : ''}`}
            >
              <span className="admin-nav-dot" />
              {label}
            </Link>
          ))}
        </div>
      </aside>

      {/* ── main ── */}
      <main className="admin-main">
        {children}
      </main>
    </>
  )
}
