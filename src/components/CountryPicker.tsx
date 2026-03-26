"use client";

import { useState, useEffect } from "react";
import { Globe, Search } from "lucide-react";
import {
  ALL_COUNTRIES,
  POPULAR_COUNTRIES,
  detectCountry,
  Country,
} from "@/lib/countryService";

interface CountryPickerProps {
  value: string; // ISO code: "GB"
  onChange: (countryCode: string) => void;
  autoDetect?: boolean;
  showSearch?: boolean;
}

export default function CountryPicker({
  value,
  onChange,
  autoDetect = true,
  showSearch = true,
}: CountryPickerProps) {
  const [isOpen,   setIsOpen]   = useState(false);
  const [search,   setSearch]   = useState("");
  const [loading,  setLoading]  = useState(false);
  const [showAll,  setShowAll]  = useState(false);

  const selected = ALL_COUNTRIES.find((c) => c.code === value);

  useEffect(() => {
    if (autoDetect && !value) handleDetect();
  }, []);

  const handleDetect = async () => {
    setLoading(true);
    try {
      const code  = await detectCountry();
      const found = ALL_COUNTRIES.find((c) => c.code === code);
      if (found) onChange(found.code);
    } finally {
      setLoading(false);
    }
  };

  const list = (showAll ? ALL_COUNTRIES : POPULAR_COUNTRIES).filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        disabled={loading}
        style={{
          width: "100%", padding: "12px 16px", borderRadius: "12px",
          border: "2px solid rgba(139,92,246,0.5)", background: "#020817",
          color: "white", display: "flex", justifyContent: "space-between",
          alignItems: "center", gap: 10, cursor: "pointer",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {selected
            ? <img src={selected.flag} alt={selected.code} style={{ width: 24, height: 18, borderRadius: 2, objectFit: "cover" }} />
            : <Globe size={18} color="#64748b" />
          }
          <span style={{ fontSize: 14, fontWeight: 600 }}>
            {loading ? "Detecting..." : selected?.name || "Select country"}
          </span>
        </span>
        <Globe size={16} color="#64748b" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div style={{
          position: "absolute", top: "110%", left: 0, right: 0,
          background: "#0f172a", borderRadius: "12px",
          border: "2px solid rgba(139,92,246,0.5)",
          maxHeight: 320, overflow: "auto", zIndex: 50,
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
        }}>
          {showSearch && (
            <div style={{ padding: "8px 8px 4px", position: "sticky", top: 0, background: "#0f172a", borderBottom: "1px solid rgba(139,92,246,0.2)" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#64748b" }} />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setShowAll(true); }}
                  placeholder="Search country..."
                  autoFocus
                  style={{
                    width: "100%", padding: "8px 8px 8px 32px", borderRadius: "8px",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(139,92,246,0.3)",
                    color: "white", fontSize: 13, outline: "none",
                  }}
                />
              </div>
            </div>
          )}

          {/* Auto detect */}
          <button
            onClick={handleDetect}
            style={{
              width: "100%", padding: "10px 14px", background: "rgba(124,58,237,0.15)",
              color: "#a78bfa", border: "none", borderBottom: "1px solid rgba(139,92,246,0.15)",
              cursor: "pointer", fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 8,
            }}
          >
            <Globe size={14} />
            Auto detect my location
          </button>

          {/* Country list */}
          {list.map((c: Country) => (
            <button
              key={c.code}
              onClick={() => { onChange(c.code); setIsOpen(false); setSearch(""); }}
              style={{
                width: "100%", padding: "9px 14px",
                display: "flex", alignItems: "center", gap: 10,
                background: value === c.code ? "rgba(124,58,237,0.3)" : "transparent",
                color: value === c.code ? "#c4b5fd" : "#e2e8f0",
                border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
                transition: "background 0.15s",
                textAlign: "left",
              }}
              onMouseEnter={e => { if (value !== c.code) e.currentTarget.style.background = "rgba(139,92,246,0.1)"; }}
              onMouseLeave={e => { if (value !== c.code) e.currentTarget.style.background = "transparent"; }}
            >
              <img src={c.flag} alt={c.code} style={{ width: 24, height: 18, borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />
              <span>{c.name}</span>
              {value === c.code && <span style={{ marginLeft: "auto", color: "#a78bfa", fontSize: 12 }}>✓</span>}
            </button>
          ))}

          {/* Show all toggle */}
          {!showAll && !search && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                width: "100%", padding: "10px 14px",
                background: "rgba(15,23,42,0.9)", color: "#64748b",
                border: "none", borderTop: "1px solid rgba(139,92,246,0.15)",
                cursor: "pointer", fontSize: 12, fontWeight: 600,
                position: "sticky", bottom: 0,
              }}
            >
              Show all countries →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
