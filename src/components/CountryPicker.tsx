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
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const selected = ALL_COUNTRIES.find((c) => c.code === value);

  useEffect(() => {
    if (autoDetect && !value) {
      handleDetect();
    }
  }, []);

  const handleDetect = async () => {
    setLoading(true);
    try {
      const code = await detectCountry();
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
      <button
        onClick={() => setIsOpen((v) => !v)}
        disabled={loading}
        style={{
          width: "100%",
          padding: "12px 16px",
          borderRadius: "12px",
          border: "2px solid rgba(139,92,246,0.5)",
          background: "#020817",
          color: "white",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>
          {selected?.flag || "🌍"} {selected?.name || "Select country"}
        </span>
        <Globe size={18} />
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "110%",
            left: 0,
            right: 0,
            background: "#020817",
            borderRadius: "12px",
            border: "2px solid rgba(139,92,246,0.5)",
            maxHeight: 300,
            overflow: "auto",
            zIndex: 50,
          }}
        >
          {showSearch && (
            <div style={{ padding: 8 }}>
              <div style={{ position: "relative" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                  }}
                />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  style={{
                    width: "100%",
                    padding: "8px 8px 8px 32px",
                    borderRadius: "8px",
                    background: "#020817",
                    border: "1px solid rgba(139,92,246,0.4)",
                    color: "white",
                  }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleDetect}
            style={{
              width: "100%",
              padding: 10,
              background: "rgba(124,58,237,0.2)",
              color: "#a78bfa",
              border: "none",
            }}
          >
            🌍 Auto detect
          </button>

          {list.map((c: Country) => (
            <button
              key={c.code}
              onClick={() => {
                onChange(c.code);
                setIsOpen(false);
              }}
              style={{
                width: "100%",
                padding: "10px 14px",
                display: "flex",
                gap: 10,
                background: value === c.code ? "rgba(124,58,237,0.3)" : "none",
                color: "white",
                border: "none",
                cursor: "pointer",
              }}
            >
              <span>{c.flag}</span>
              <span>{c.name}</span>
            </button>
          ))}

          {!showAll && (
            <button
              onClick={() => setShowAll(true)}
              style={{
                width: "100%",
                padding: 10,
                background: "rgba(15,23,42,0.9)",
                color: "#a78bfa",
                border: "none",
              }}
            >
              Show all →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
