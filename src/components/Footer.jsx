import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid #CEEADB', background: '#F6FBF8',
      padding: '40px 24px 24px',
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8,
              background: 'linear-gradient(135deg, #16A34A, #15803D)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 800, color: '#fff',
            }}>P</div>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, color: '#0A1F14' }}>ParkEase</span>
          </div>
          <p style={{ color: '#436B53', fontSize: 13, maxWidth: 260, lineHeight: 1.6 }}>
            Chennai's smart parking marketplace. Find, book, and pay for parking — all on Google Cloud.
          </p>
        </div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#0A1F14', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Platform</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <Link to="/map" style={{ fontSize: 13, color: '#436B53', textDecoration: 'none' }}>Find Parking</Link>
            <Link to="/signup" style={{ fontSize: 13, color: '#436B53', textDecoration: 'none' }}>List Your Space</Link>
          </div>
        </div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, color: '#0A1F14', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Legal</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#436B53' }}>Privacy Policy</span>
            <span style={{ fontSize: 13, color: '#436B53' }}>Terms of Service</span>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: '32px auto 0', paddingTop: 20, borderTop: '1px solid #CEEADB', textAlign: 'center', fontSize: 12, color: '#7EA88E' }}>
        © 2026 ParkEase Technologies. Built on Google Cloud Platform. Payments powered by PayU.
      </div>
    </footer>
  )
}
