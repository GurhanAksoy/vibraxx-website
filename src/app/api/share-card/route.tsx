/**
 * VIBRAXX SOCIAL SHARE CARD API - WITH LOGO
 * Generates dynamic Open Graph images for social media sharing
 * Route: /api/share-card
 */

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract parameters
    const score = searchParams.get('score') || '0';
    const correct = searchParams.get('correct') || '0';
    const wrong = searchParams.get('wrong') || '0';
    const accuracy = searchParams.get('accuracy') || '0';
    const userName = searchParams.get('userName') || 'Anonymous';
    const country = searchParams.get('country') || '🌍';
    const rank = searchParams.get('rank');
    const roundNumber = searchParams.get('roundNumber');
    
    // Fetch logo from public directory
    let logoData = '';
    try {
      const logoUrl = new URL('/images/logo.png', request.url);
      const logoResponse = await fetch(logoUrl.toString());
      if (logoResponse.ok) {
        const logoBuffer = await logoResponse.arrayBuffer();
        logoData = `data:image/png;base64,${Buffer.from(logoBuffer).toString('base64')}`;
      }
    } catch (e) {
      console.log('Logo could not be loaded, using text fallback');
    }
    
    return new ImageResponse(
      (
        <div
          style={{
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Background Glow Effects - VibraXX Style */}
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '-10%',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.4) 0%, transparent 70%)',
              filter: 'blur(60px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '-20%',
              right: '-10%',
              width: '700px',
              height: '700px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(217,70,239,0.3) 0%, transparent 70%)',
              filter: 'blur(80px)',
            }}
          />
          
          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10,
              textAlign: 'center',
            }}
          >
            {/* Logo + Brand */}
            {logoData ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '20px',
                  marginBottom: '30px',
                }}
              >
                <img
                  src={logoData}
                  width="100"
                  height="100"
                  style={{
                    borderRadius: '50%',
                    border: '4px solid rgba(167, 139, 250, 0.6)',
                    boxShadow: '0 0 30px rgba(124, 58, 237, 0.8), 0 0 60px rgba(167, 139, 250, 0.4)',
                  }}
                />
                <div
                  style={{
                    fontSize: '56px',
                    fontWeight: 900,
                    letterSpacing: '0.1em',
                    background: 'linear-gradient(90deg, #a78bfa, #d946ef, #22d3ee)',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  VIBRAXX
                </div>
              </div>
            ) : (
              <div
                style={{
                  fontSize: '48px',
                  fontWeight: 900,
                  letterSpacing: '0.1em',
                  marginBottom: '30px',
                  background: 'linear-gradient(90deg, #a78bfa, #d946ef, #22d3ee)',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                VIBRAXX
              </div>
            )}
            
            {/* Trophy Icon */}
            <div
              style={{
                fontSize: '80px',
                marginBottom: '20px',
              }}
            >
              🏆
            </div>
            
            {/* Score */}
            <div
              style={{
                fontSize: '96px',
                fontWeight: 900,
                color: 'white',
                marginBottom: '10px',
                textShadow: '0 0 40px rgba(167,139,250,0.6)',
              }}
            >
              {score}
            </div>
            
            <div
              style={{
                fontSize: '32px',
                color: '#94a3b8',
                fontWeight: 600,
                marginBottom: '40px',
                letterSpacing: '0.05em',
              }}
            >
              POINTS
            </div>
            
            {/* Stats Grid - VibraXX Colors */}
            <div
              style={{
                display: 'flex',
                gap: '60px',
                marginBottom: '40px',
              }}
            >
              {/* Correct */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '48px' }}>✅</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#22c55e',
                    }}
                  >
                    {correct}
                  </span>
                  <span
                    style={{
                      fontSize: '20px',
                      color: '#86efac',
                      fontWeight: 600,
                    }}
                  >
                    Correct
                  </span>
                </div>
              </div>
              
              {/* Wrong */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '48px' }}>❌</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#ef4444',
                    }}
                  >
                    {wrong}
                  </span>
                  <span
                    style={{
                      fontSize: '20px',
                      color: '#fca5a5',
                      fontWeight: 600,
                    }}
                  >
                    Wrong
                  </span>
                </div>
              </div>
              
              {/* Accuracy */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <span style={{ fontSize: '48px' }}>🎯</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                  <span
                    style={{
                      fontSize: '48px',
                      fontWeight: 900,
                      color: '#a78bfa',
                    }}
                  >
                    {accuracy}%
                  </span>
                  <span
                    style={{
                      fontSize: '20px',
                      color: '#c4b5fd',
                      fontWeight: 600,
                    }}
                  >
                    Accuracy
                  </span>
                </div>
              </div>
            </div>
            
            {/* Rank (if provided) - VibraXX Style */}
            {rank && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '16px 32px',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.3), rgba(217, 70, 239, 0.2))',
                  border: '2px solid rgba(167, 139, 250, 0.5)',
                  marginBottom: '30px',
                  boxShadow: '0 0 20px rgba(124, 58, 237, 0.4)',
                }}
              >
                <span style={{ fontSize: '32px' }}>👑</span>
                <span
                  style={{
                    fontSize: '28px',
                    fontWeight: 700,
                    color: '#fbbf24',
                    textShadow: '0 0 20px rgba(251, 191, 36, 0.6)',
                  }}
                >
                  Ranked #{rank}
                </span>
              </div>
            )}
            
            {/* User Info - VibraXX Style */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 28px',
                borderRadius: '999px',
                background: 'rgba(15, 23, 42, 0.8)',
                border: '2px solid rgba(139, 92, 246, 0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <span style={{ fontSize: '36px' }}>{country}</span>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 600,
                  color: '#e2e8f0',
                }}
              >
                {userName}
              </span>
            </div>
            
            {/* Footer - VibraXX Branding */}
            <div
              style={{
                position: 'absolute',
                bottom: '40px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '24px',
                color: '#64748b',
                fontWeight: 600,
              }}
            >
              <span>Join the competition at</span>
              <span
                style={{
                  color: '#a78bfa',
                  fontWeight: 700,
                  textShadow: '0 0 20px rgba(167, 139, 250, 0.6)',
                }}
              >
                vibraxx.com
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Share card generation error:', error);
    
    return new Response('Failed to generate image', {
      status: 500,
    });
  }
}
