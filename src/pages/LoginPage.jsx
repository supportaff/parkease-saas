import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth'
import { auth } from '../../lib/firebase'

export default function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      navigate('/map', { replace: true })
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').split('.')[0] + '.')
    }
    setLoading(false)
  }

  const handleGoogleLogin = async () => {
    setError('')
    setLoading(true)
    try {
      await signInWithPopup(auth, new GoogleAuthProvider())
      navigate('/map', { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-in failed. Try email instead.')
      }
    }
    setLoading(false)
  }

  return (
    <div style={{
      paddingTop: 60, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(165deg, #F6FBF8, #FFFFFF)',
    }}>
      <div className="fade-up" style={{
        width: '100%', maxWidth: 420, padding: 40, borderRadius: 24,
        background: '#fff', border: '1.5px solid #CEEADB',
        boxShadow: '0 8px 40px rgba(22,163,74,0.08)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14,
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 auto 16px',
          }}>P</div>
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Welcome Back</h1>
          <p style={{ color: '#436B53', fontSize: 14 }}>Sign in to find and book parking</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FECACA',
            borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#DC2626',
          }}>{error}</div>
        )}

        <button onClick={handleGoogleLogin} disabled={loading}
          style={{
            width: '100%', padding: '12px', borderRadius: 12, border: '1.5px solid #CEEADB',
            background: '#fff', color: '#0A1F14', fontSize: 14, fontWeight: 600,
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            gap: 10, marginBottom: 20,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
          <span style={{ fontSize: 20 }}>G</span>
          Continue with Google
        </button>

        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20,
        }}>
          <div style={{ flex: 1, height: 1, background: '#CEEADB' }} />
          <span style={{ fontSize: 12, color: '#7EA88E', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#CEEADB' }} />
        </div>

        <form onSubmit={handleEmailLogin}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }}
              onFocus={e => e.target.style.borderColor = '#16A34A'}
              onBlur={e => e.target.style.borderColor = '#CEEADB'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }}
              onFocus={e => e.target.style.borderColor = '#16A34A'}
              onBlur={e => e.target.style.borderColor = '#CEEADB'}
            />
          </div>
          <button type="submit" disabled={loading}
            style={{
              width: '100%', padding: '12px', borderRadius: 12, border: 'none',
              background: loading ? '#7EA88E' : '#16A34A', color: '#fff', fontSize: 15, fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#436B53' }}>
          Don't have an account? <Link to="/signup" style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>Sign Up</Link>
        </p>
        <p style={{ textAlign: 'center', marginTop: 8, fontSize: 12, color: '#7EA88E' }}>
          🔐 256-bit SSL • PayU Payments
        </p>
      </div>
    </div>
  )
}
