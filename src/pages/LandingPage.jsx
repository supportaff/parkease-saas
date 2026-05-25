import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

const AREAS = ['T Nagar', 'Anna Nagar', 'Adyar', 'Velachery', 'Nungambakkam', 'OMR']

const FEATURES = [
  { icon: '🗺️', title: 'Live Google Maps', desc: 'Every spot is pinned on a real-time Google Map. Navigate directly with one tap.' },
  { icon: '✅', title: 'Verified Listings', desc: 'Each space is manually reviewed before going live. No fake or outdated spots.' },
  { icon: '⚡', title: 'Instant Booking', desc: 'Book a spot in seconds. Get a unique digital ID and gate code immediately.' },
  { icon: '💰', title: 'Fair Pricing', desc: 'What you see is what you pay. Transparent hourly, daily, and monthly rates.' },
  { icon: '🔒', title: 'Secure Payments', desc: 'All transactions powered by PayU with 256-bit SSL encryption. UPI, cards, net banking.' },
  { icon: '🏙️', title: 'Chennai-First', desc: 'Designed for Chennai roads and parking culture. Local support, local listings.' },
]

const TICKER = [
  '🟢 Verified parking spots across Chennai',
  '⚡ Instant booking confirmation',
  '📍 Google Maps navigation built-in',
  '🔒 Secured via PayU payments',
  '🚗 2-Wheeler · 3-Wheeler · 4-Wheeler supported',
  '📅 Hourly · Daily · Monthly plans',
  '🏗️ List your space, earn from every booking',
]

export default function LandingPage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [query, setQuery] = useState('')

  // Redirect already logged-in users
  useEffect(() => {
    if (!user || !profile) return
    if (profile.role === 'admin') navigate('/admin', { replace: true })
    else if (profile.role === 'owner') navigate('/owner', { replace: true })
    else navigate('/map', { replace: true })
  }, [user, profile])

  return (
    <div>
      {/* Hero */}
      <section style={{
        padding: '140px 24px 100px',
        background: 'linear-gradient(165deg, #F6FBF8 0%, #FFFFFF 50%, #F0FAF4 100%)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: -100, right: -100, width: 500, height: 500,
          borderRadius: '50%', background: 'radial-gradient(circle, #16A34A08, transparent 70%)',
        }} />
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center', position: 'relative' }}>
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#16A34A18', border: '1px solid #16A34A33', borderRadius: 30,
            padding: '6px 16px 6px 8px', marginBottom: 24, fontSize: 13, color: '#15803D', fontWeight: 600,
          }}>
            <span style={{ fontSize: 16 }}>🅿️</span>
            Chennai's Smart Parking Marketplace
          </div>
          <h1 className="fade-up-1" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: 54, fontWeight: 800, letterSpacing: '-0.03em',
            lineHeight: 1.1, marginBottom: 20, color: '#0A1F14',
          }}>
            Find & Book Parking<br />
            <span style={{
              background: 'linear-gradient(135deg, #16A34A, #0D9488)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            }}>Instantly in Chennai</span>
          </h1>
          <p className="fade-up-2" style={{ fontSize: 18, color: '#436B53', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
            Skip the circle. Browse live parking spots on Google Maps, book in seconds, and pay securely via PayU.
          </p>
          <div className="fade-up-3" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/map"
              style={{
                padding: '14px 32px', borderRadius: 12, border: 'none',
                background: '#16A34A', color: '#fff', fontSize: 15, fontWeight: 700,
                textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
                boxShadow: '0 4px 20px #16A34A44',
              }}
            >Find Parking Now →</Link>
            <Link to="/signup"
              style={{
                padding: '14px 32px', borderRadius: 12, border: '1.5px solid #CEEADB',
                background: '#fff', color: '#0A1F14', fontSize: 15, fontWeight: 700,
                textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >List Your Space</Link>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div style={{
        background: '#0A1F14', padding: '14px 0', overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}>
        <div style={{
          display: 'inline-block', animation: 'ticker 40s linear infinite',
          fontSize: 14, color: '#7EA88E',
        }}>
          {TICKER.join(' &nbsp;·&nbsp; ')} &nbsp;·&nbsp;{' '}
          {TICKER.join(' &nbsp;·&nbsp; ')} &nbsp;·&nbsp;{' '}
          {TICKER.join(' &nbsp;·&nbsp; ')}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: '88px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 className="fade-up" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
            fontSize: 32, textAlign: 'center', marginBottom: 48, color: '#0A1F14',
          }}>
            Why ParkEase?
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}
            className="pe-features-grid">
            {FEATURES.map((f, i) => (
              <div key={f.title} className={`hover-lift fade-up-${Math.min(i + 1, 4)}`} style={{
                background: '#fff', border: '1.5px solid #CEEADB', borderRadius: 20,
                padding: '28px 24px',
              }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{f.icon}</div>
                <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 10 }}>{f.title}</div>
                <div style={{ fontSize: 14, color: '#436B53', lineHeight: 1.65 }}>{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section style={{ padding: '88px 24px', background: '#F6FBF8', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 className="fade-up" style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800,
            fontSize: 32, marginBottom: 16, color: '#0A1F14',
          }}>
            Ready to Park?
          </h2>
          <p className="fade-up-1" style={{ fontSize: 16, color: '#436B53', marginBottom: 32, lineHeight: 1.6 }}>
            Join hundreds of Chennai drivers and property owners. Find a spot or list yours today.
          </p>
          <div className="fade-up-2" style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/map"
              style={{
                padding: '14px 36px', borderRadius: 12, border: 'none',
                background: '#16A34A', color: '#fff', fontSize: 15, fontWeight: 700,
                textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >Get Started →</Link>
          </div>
        </div>
      </section>
    </div>
  )
}
