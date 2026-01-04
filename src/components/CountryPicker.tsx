"use client";

import { useState, useEffect } from "react";
import { Globe, Search, X } from "lucide-react";
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
  size = "md"
}: CountryPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDetecting, setIsDetecting] = useState(false);
  const [showAll, setShowAll] = useState(false);

  // Auto-detect country on mount
  useEffect(() => {
    if (autoDetect && value === '🌍') {
      handleAutoDetect();
    }
  }, []);

  const handleAutoDetect = async () => {
    setIsDetecting(true);
    try {
      const countryData = await detectCountry();
      onChange(countryData.flag);
    } catch (error) {
      console.error('Country detection failed:', error);
    } finally {
      setIsDetecting(false);
    }
  };

  const filteredCountries = (showAll ? ALL_COUNTRIES : POPULAR_COUNTRIES).filter(
    (country) =>
      country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedCountry = ALL_COUNTRIES.find(c => c.flag === value);

  const sizeStyles = {
    sm: { fontSize: '24px', padding: '8px 12px', buttonHeight: '40px' },
    md: { fontSize: '32px', padding: '12px 16px', buttonHeight: '50px' },
    lg: { fontSize: '48px', padding: '16px 20px', buttonHeight: '60px' }
  };

  const currentSize = sizeStyles[size];

  return (
    <div style={{ position: 'relative', width: '100%' }}>
      {/* Selected Country Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isDetecting}
        style={{
          width: '100%',
          height: currentSize.buttonHeight,
          padding: currentSize.padding,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          borderRadius: '12px',
          border: '2px solid rgba(139, 92, 246, 0.5)',
          background: 'linear-gradient(135deg, rgba(30,27,75,0.8), rgba(15,23,42,0.9))',
          color: 'white',
          fontSize: '16px',
          fontWeight: 600,
          cursor: isDetecting ? 'wait' : 'pointer',
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
        }}
        onMouseEnter={(e) => {
          if (!isDetecting) {
            e.currentTarget.style.borderColor = 'rgba(167, 139, 250, 0.8)';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 92, 246, 0.4)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: currentSize.fontSize }}>
            {isDetecting ? '🌍' : value}
          </span>
          <span style={{ color: '#cbd5e1' }}>
            {isDetecting ? 'Detecting...' : (selectedCountry?.name || 'Select Country')}
          </span>
        </div>
        <Globe style={{ width: '20px', height: '20px', color: '#a78bfa' }} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setIsOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              zIndex: 999,
              backdropFilter: 'blur(4px)',
            }}
          />

          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              maxHeight: '400px',
              borderRadius: '16px',
              border: '2px solid rgba(139, 92, 246, 0.5)',
              background: 'linear-gradient(135deg, rgba(30,27,75,0.98), rgba(15,23,42,0.98))',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(139, 92, 246, 0.4)',
              zIndex: 1000,
              backdropFilter: 'blur(20px)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Search Bar */}
            {showSearch && (
              <div style={{ padding: '16px', borderBottom: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <div style={{ position: 'relative' }}>
                  <Search
                    style={{
                      position: 'absolute',
                      left: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '18px',
                      height: '18px',
                      color: '#94a3b8',
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Search country..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 40px',
                      borderRadius: '8px',
                      border: '1px solid rgba(139, 92, 246, 0.3)',
                      background: 'rgba(15, 23, 42, 0.6)',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            )}

            {/* Auto-detect Button */}
            {autoDetect && (
              <button
                onClick={handleAutoDetect}
                disabled={isDetecting}
                style={{
                  padding: '12px 16px',
                  borderBottom: '1px solid rgba(139, 92, 246, 0.2)',
                  background: 'rgba(124, 58, 237, 0.2)',
                  color: '#a78bfa',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: isDetecting ? 'wait' : 'pointer',
                  border: 'none',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isDetecting) e.currentTarget.style.background = 'rgba(124, 58, 237, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                }}
              >
                🌍 {isDetecting ? 'Detecting...' : 'Auto-detect my country'}
              </button>
            )}

            {/* Country List */}
            <div
              style={{
                overflowY: 'auto',
                maxHeight: '280px',
              }}
            >
              {filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => {
                    onChange(country.flag);
                    setIsOpen(false);
                    setSearchTerm('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    background: value === country.flag ? 'rgba(124, 58, 237, 0.3)' : 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    if (value !== country.flag) {
                      e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (value !== country.flag) {
                      e.currentTarget.style.background = 'transparent';
                    }
                  }}
                >
                  <span style={{ fontSize: '24px' }}>{country.flag}</span>
                  <span style={{ flex: 1 }}>{country.name}</span>
                  {value === country.flag && (
                    <span style={{ color: '#22c55e', fontSize: '18px' }}>✓</span>
                  )}
                </button>
              ))}

              {filteredCountries.length === 0 && (
                <div
                  style={{
                    padding: '24px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontSize: '14px',
                  }}
                >
                  No countries found
                </div>
              )}
            </div>

            {/* Show All Toggle */}
            {!showAll && searchTerm === '' && (
              <button
                onClick={() => setShowAll(true)}
                style={{
                  padding: '12px 16px',
                  borderTop: '1px solid rgba(139, 92, 246, 0.2)',
                  background: 'rgba(15, 23, 42, 0.8)',
                  color: '#a78bfa',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  textAlign: 'center',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(124, 58, 237, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(15, 23, 42, 0.8)';
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
