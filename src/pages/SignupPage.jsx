import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, updateProfile } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useAuth } from '../hooks/useAuth'

export default function SignupPage() {
  const navigate = useNavigate()
  const { createProfile } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('tenant')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEmailSignup = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(cred.user, { displayName: name })
      // Create Firestore profile with selected role
      await createProfile(role, { name, phone: '' })
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'owner') navigate('/owner', { replace: true })
      else navigate('/map', { replace: true })
    } catch (err) {
      setError(err.message.replace('Firebase: ', '').split('.')[0] + '.')
    }
    setLoading(false)
  }

  const handleGoogleSignup = async () => {
    setError('')
    setLoading(true)
    try {
      const cred = await signInWithPopup(auth, new GoogleAuthProvider())
      await createProfile(role, { name: cred.user.displayName || '', phone: '' })
      if (role === 'admin') navigate('/admin', { replace: true })
      else if (role === 'owner') navigate('/owner', { replace: true })
      else navigate('/map', { replace: true })
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError('Google sign-up failed. Try email instead.')
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
          <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 6 }}>Join ParkEase</h1>
          <p style={{ color: '#436B53', fontSize: 14 }}>Create your account to start parking</p>
        </div>

        {error && (
          <div style={{
            padding: '10px 14px', background: '#FEE2E2', border: '1px solid #FECACA',
            borderRadius: 10, marginBottom: 16, fontSize: 13, color: '#DC2626',
          }}>{error}</div>
        )}

        <button onClick={handleGoogleSignup} disabled={loading}
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

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ flex: 1, height: 1, background: '#CEEADB' }} />
          <span style={{ fontSize: 12, color: '#7EA88E', fontWeight: 500 }}>OR</span>
          <div style={{ flex: 1, height: 1, background: '#CEEADB' }} />
        </div>

        {/* Role selector */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          {[
            { id: 'tenant', icon: '🚗', label: 'Tenant' },
            { id: 'owner', icon: '🏗️', label: 'Owner' },
          ].map(r => (
            <button key={r.id} onClick={() => setRole(r.id)}
              style={{
                flex: 1, padding: '12px', borderRadius: 12,
                border: `1.5px solid ${role === r.id ? '#16A34A66' : '#CEEADB'}`,
                background: role === r.id ? '#16A34A18' : '#fff',
                cursor: 'pointer', textAlign: 'center',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
              <div style={{ fontSize: 24 }}>{r.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: role === r.id ? '#16A34A' : '#436B53', marginTop: 4 }}>
                {r.label}
              </div>
            </button>
          ))}
        </div>

        <form onSubmit={handleEmailSignup}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>NAME</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} required placeholder="Your name"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }}
              onFocus={e => e.target.style.borderColor = '#16A34A'}
              onBlur={e => e.target.style.borderColor = '#CEEADB'}
            />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>EMAIL</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@email.com"
              style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }}
              onFocus={e => e.target.style.borderColor = '#16A34A'}
              onBlur={e => e.target.style.borderColor = '#CEEADB'}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>PASSWORD</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="Min 6 characters" minLength={6}
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
            {loading ? 'Creating account...' : `Create ${role === 'owner' ? 'Owner' : 'Tenant'} Account`}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#436B53' }}>
          Already have an account? <Link to="/login" style={{ color: '#16A34A', fontWeight: 700, textDecoration: 'none' }}>Sign In</Link>
        </p>
      </div>
    </div>
  )
}
