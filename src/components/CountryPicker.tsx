"use client";

import { useState, useEffect } from "react";
import { Globe, Search } from "lucide-react";
import { POPULAR_COUNTRIES, ALL_COUNTRIES, detectCountry } from "@/lib/countryService";

interface CountryPickerProps {
  value: string;
  onChange: (country: string) => void;
  autoDetect?: boolean;
  showSearch?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function CountryPicker({
  value,
  onChange,
  autoDetect = true,
  showSearch = true,
  size = "md",
}: CountryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [hasDetected, setHasDetected] = useState(false);

  // Auto-detect country only once
  useEffect(() => {
    if (autoDetect && value === "🌍" && !hasDetected) {
      handleAutoDetect();
      setHasDetected(true);
    }
  }, [autoDetect, value, hasDetected]);

  // Lock body scroll when dropdown open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const countryData = await detectCountry();
      onChange(countryData.flag);
    } catch (error) {
      console.error("Country detection failed:", error);
    } finally {
      setIsDetecting(false);
    }
  };

  const filteredCountries = (showAll ? ALL_COUNTRIES : POPULAR_COUNTRIES).filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = ALL_COUNTRIES.find((c) => c.flag === value);

  const sizeStyles = {
    sm: { fontSize: "24px", padding: "8px 12px", buttonHeight: "40px" },
    md: { fontSize: "32px", padding: "12px 16px", buttonHeight: "50px" },
    lg: { fontSize: "48px", padding: "16px 20px", buttonHeight: "60px" },
  };

  const currentSize = sizeStyles[size];

  return (
    <div style={{ position: "relative", width: "100%" }}>
      {/* Selected Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDetecting}
        style={{
          width: "100%",
          height: currentSize.buttonHeight,
          padding: currentSize.padding,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          borderRadius: "12px",
          border: "2px solid rgba(139, 92, 246, 0.5)",
          background: "linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))",
          color: "white",
          fontSize: "16px",
          fontWeight: 600,
          cursor: isDetecting ? "wait" : "pointer",
          transition: "all 0.3s ease",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: currentSize.fontSize }}>
            {isDetecting ? "🌍" : value}
          </span>
          <span style={{ color: "#cbd5e1" }}>
            {isDetecting
              ? "Detecting..."
              : selectedCountry?.name || "Select Country"}
          </span>
        </div>
        <Globe style={{ width: "20px", height: "20px", color: "#a78bfa" }} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 999,
            }}
          />

          <div
            style={{
              position: "absolute",
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              maxHeight: "400px",
              borderRadius: "16px",
              border: "2px solid rgba(139, 92, 246, 0.5)",
              background: "linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(139,92,246,0.4)",
              zIndex: 1000,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {showSearch && (
              <div style={{ padding: "16px" }}>
                <div style={{ position: "relative" }}>
                  <Search
                    style={{
                      position: "absolute",
                      left: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: "18px",
                      height: "18px",
                      color: "#94a3b8",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "10px 12px 10px 40px",
                      borderRadius: "8px",
                      border: "1px solid rgba(139,92,246,0.3)",
                      background: "rgba(15,23,42,0.6)",
                      color: "white",
                    }}
                  />
                </div>
              </div>
            )}

            {autoDetect && (
              <button
                onClick={handleAutoDetect}
                disabled={isDetecting}
                style={{
                  padding: "12px 16px",
                  background: "rgba(124,58,237,0.2)",
                  color: "#a78bfa",
                  fontWeight: 600,
                  border: "none",
                }}
              >
                🌍 Auto-detect my country
              </button>
            )}

            <div style={{ overflowY: "auto", maxHeight: "280px" }}>
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country.flag);
                    setIsOpen(false);
                    setSearchTerm("");
                  }}
                  style={{
                    width: "100%",
                    padding: "12px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    background:
                      value === country.flag
                        ? "rgba(124,58,237,0.3)"
                        : "transparent",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ fontSize: "24px" }}>{country.flag}</span>
                  <span style={{ flex: 1 }}>{country.name}</span>
                  {value === country.flag && (
                    <span style={{ color: "#22c55e" }}>✓</span>
                  )}
                </button>
              ))}
            </div>

            {!showAll && searchTerm === "" && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  padding: "12px 16px",
                  background: "rgba(15,23,42,0.8)",
                  color: "#a78bfa",
                  border: "none",
                }}
              >
                Show all countries →
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
