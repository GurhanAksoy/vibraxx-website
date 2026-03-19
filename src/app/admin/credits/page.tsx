'use client'

import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface UserResult {
  user_id: string
  full_name: string
  email: string | null
  avatar_url: string | null
  country: string | null
  paid_credits: number
  bonus_credits: number
}

const Loading = () => (
  <div className="admin-loading">
    <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
    <span>searching</span>
  </div>
)

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--surface2)',
  border: '1px solid var(--border2)',
  borderRadius: 5,
  padding: '7px 12px',
  color: 'var(--text)',
  fontSize: 12,
  fontFamily: 'var(--font)',
  outline: 'none',
}

export default function AdminCredits() {
  const [query, setQuery]         = useState('')
  const [results, setResults]     = useState<UserResult[]>([])
  const [searching, setSearching] = useState(false)
  const [searchErr, setSearchErr] = useState<string | null>(null)

  const [selected, setSelected]   = useState<UserResult | null>(null)
  const [amount, setAmount]       = useState('')
  const [note, setNote]           = useState('')
  const [gifting, setGifting]     = useState(false)
  const [giftMsg, setGiftMsg]     = useState<string | null>(null)
  const [giftErr, setGiftErr]     = useState<string | null>(null)

  const search = useCallback(async () => {
    if (query.trim().length < 2) return
    setSearching(true)
    setSearchErr(null)
    setResults([])
    setSelected(null)

    const { data, error } = await supabase.rpc('admin_search_users', { p_query: query.trim() })
    if (error) setSearchErr(error.message)
    else setResults((data as { users: UserResult[] }).users ?? [])
    setSearching(false)
  }, [query])

  const giftCredits = async () => {
    if (!selected) return
    const credits = parseInt(amount)
    if (!credits || credits <= 0 || credits > 1000) {
      setGiftErr('Enter a number between 1 and 1000')
      return
    }
    setGifting(true)
    setGiftErr(null)
    setGiftMsg(null)

    const { data, error } = await supabase.rpc('admin_gift_credits', {
      p_target_user_id: selected.user_id,
      p_credits:        credits,
      p_note:           note.trim(),
    })

    if (error) {
      setGiftErr(error.message)
    } else {
      const res = data as { success: boolean; target_user: string; credits: number }
      setGiftMsg(`${res.credits} credits gifted to ${res.target_user}`)
      setAmount('')
      setNote('')
      setSelected(null)
      setResults([])
      setQuery('')
    }
    setGifting(false)
  }

  return (
    <>
      <div className="page-title">Gift credits</div>
      <div className="page-subtitle">Gift round credits to a user</div>

      {giftMsg && (
        <div style={{
          padding: '10px 16px', borderRadius: 6,
          background: '#0f2a1a', border: '1px solid #1a4a2a',
          color: 'var(--success)', fontSize: 12, marginBottom: 20,
        }}>
          {giftMsg}
        </div>
      )}

      <div className="section-title">Search user</div>
      <div className="admin-card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Search by name..."
            style={{ ...inputStyle, flex: 1 }}
          />
          <button
            className="admin-btn primary"
            onClick={search}
            disabled={searching || query.trim().length < 2}
          >
            Search
          </button>
        </div>

        {searchErr && <div style={{ color: 'var(--danger)', fontSize: 11, marginTop: 8 }}>{searchErr}</div>}
        {searching  && <div style={{ marginTop: 12 }}><Loading /></div>}

        {results.length > 0 && (
          <table className="admin-table" style={{ marginTop: 12 }}>
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Country</th>
                <th>Paid</th>
                <th>Bonus</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {results.map(u => (
                <tr
                  key={u.user_id}
                  style={{ background: selected?.user_id === u.user_id ? 'rgba(99,102,241,0.08)' : undefined }}
                >
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {u.avatar_url && (
                        <img src={u.avatar_url} alt="" style={{ width: 24, height: 24, borderRadius: '50%' }} />
                      )}
                      <span style={{ fontSize: 12 }}>{u.full_name}</span>
                    </div>
                  </td>
                  <td className="muted" style={{ fontSize: 11 }}>{u.email ?? '—'}</td>
                  <td className="muted">{u.country ?? '—'}</td>
                  <td>{u.paid_credits}</td>
                  <td>{u.bonus_credits}</td>
                  <td>
                    <button
                      className="admin-btn primary"
                      style={{ fontSize: 10, padding: '3px 10px' }}
                      onClick={() => setSelected(u)}
                    >
                      Select
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {results.length === 0 && !searching && query.trim().length >= 2 && (
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>No users found</div>
        )}
      </div>

      {selected && (
        <>
          <div className="section-title">Gift credits</div>
          <div className="admin-card">
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 16, padding: '10px 14px',
              background: 'rgba(99,102,241,0.08)',
              border: '1px solid rgba(99,102,241,0.2)',
              borderRadius: 6,
            }}>
              {selected.avatar_url && (
                <img src={selected.avatar_url} alt="" style={{ width: 32, height: 32, borderRadius: '50%' }} />
              )}
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--accent2)' }}>
                  {selected.full_name}
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)' }}>
                  {selected.email && <span style={{ marginRight: 8 }}>{selected.email}</span>}
                  Current: {selected.paid_credits} paid · {selected.bonus_credits} bonus
                </div>
              </div>
              <button
                className="admin-btn"
                style={{ marginLeft: 'auto', fontSize: 10, padding: '3px 10px' }}
                onClick={() => setSelected(null)}
              >
                Cancel
              </button>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <div style={{ flex: 1 }}>
                <div className="stat-card-label" style={{ marginBottom: 4 }}>Amount (1–1000)</div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="e.g. 5"
                  style={inputStyle}
                />
              </div>
              <div style={{ flex: 2 }}>
                <div className="stat-card-label" style={{ marginBottom: 4 }}>Note (optional)</div>
                <input
                  type="text"
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="e.g. promotion"
                  style={inputStyle}
                />
              </div>
            </div>

            {giftErr && <div style={{ color: 'var(--danger)', fontSize: 11, marginBottom: 8 }}>{giftErr}</div>}

            <button
              className="admin-btn primary"
              onClick={giftCredits}
              disabled={gifting || !amount}
              style={{ marginTop: 4 }}
            >
              {gifting ? 'Gifting…' : `Gift ${amount || '?'} credits`}
            </button>
          </div>
        </>
      )}
    </>
  )
}
