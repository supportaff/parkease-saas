import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()

  const isOwner = profile?.role === 'owner'
  const isAdmin = profile?.role === 'admin'

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #CEEADB',
      padding: '0 24px', height: 60,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    }}>
      {/* Logo */}
      <Link to="/" style={{
        display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none',
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'linear-gradient(135deg, #16A34A, #15803D)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 800, color: '#fff',
        }}>P</div>
        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 18, color: '#0A1F14' }}>
          ParkEase
        </span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <NavLink to="/" label="Home" />
        <NavLink to="/map" label="Find Parking" />

        {user ? (
          <>
            {isAdmin && <NavLink to="/admin" label="Admin" />}
            {isOwner && <NavLink to="/owner" label="Dashboard" />}
            {!isOwner && !isAdmin && <NavLink to="/map" label="My Bookings" />}

            <div style={{
              display: 'flex', alignItems: 'center', gap: 10, marginLeft: 8,
              padding: '6px 12px', background: '#F6FBF8', borderRadius: 10,
              border: '1px solid #CEEADB',
            }}>
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                background: isAdmin ? 'linear-gradient(135deg, #7C3AED, #6D28D9)' :
                            isOwner ? 'linear-gradient(135deg, #16A34A, #15803D)' :
                                      'linear-gradient(135deg, #0D9488, #0284C7)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
              }}>
                {(user.displayName || user.email || 'U')[0].toUpperCase()}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: '#0A1F14' }}>
                {user.displayName || user.email?.split('@')[0] || 'User'}
              </span>
            </div>

            <button onClick={logout}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1.5px solid #CEEADB',
                background: 'transparent', color: '#436B53', fontSize: 13,
                fontWeight: 600, cursor: 'pointer',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >Logout</button>
          </>
        ) : (
          <>
            <Link to="/login"
              style={{
                padding: '8px 20px', borderRadius: 8, border: '1.5px solid #CEEADB',
                background: 'transparent', color: '#436B53', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >Log In</Link>
            <Link to="/signup"
              style={{
                padding: '8px 20px', borderRadius: 8, border: 'none',
                background: '#16A34A', color: '#fff', fontSize: 13,
                fontWeight: 600, cursor: 'pointer', textDecoration: 'none',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}
            >Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, label }) {
  const isActive = window.location.pathname.startsWith(to)
  return (
    <Link to={to} style={{
      padding: '6px 14px', borderRadius: 8,
      background: isActive ? '#F6FBF8' : 'transparent',
      color: isActive ? '#16A34A' : '#436B53',
      fontSize: 13, fontWeight: 600, textDecoration: 'none',
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      transition: 'all 0.15s',
    }}>{label}</Link>
  )
}
