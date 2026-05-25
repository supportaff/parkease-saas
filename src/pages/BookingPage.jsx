import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function BookingPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [status, setStatus] = useState('processing')

  const txnid = searchParams.get('txnid')
  const payuStatus = searchParams.get('status')
  const hash = searchParams.get('hash')

  useEffect(() => {
    if (!txnid) {
      // No params means we came here directly — show a generic view
      setStatus('no_params')
      return
    }

    if (payuStatus === 'success') {
      // Verify hash on backend
      fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ txnid, hash, status: payuStatus, ...Object.fromEntries(searchParams) }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.verified) {
            setStatus('success')
          } else {
            setStatus('verify_failed')
          }
        })
        .catch(() => setStatus('success')) // optimistic
    } else if (payuStatus === 'failure' || payuStatus === 'failed') {
      setStatus('failed')
    } else {
      setStatus('unknown')
    }
  }, [txnid, payuStatus])

  if (status === 'processing') {
    return (
      <div style={{ paddingTop: 60, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, borderRadius: '50%', border: '3px solid #16A34A44',
            borderTopColor: '#16A34A', animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <div style={{ fontSize: 14, color: '#436B53' }}>Verifying payment...</div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ paddingTop: 60, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px' }}>
      <div className="fade-up" style={{
        maxWidth: 480, width: '100%', textAlign: 'center',
        background: '#fff', borderRadius: 24, padding: 40,
        border: '1.5px solid #CEEADB', boxShadow: '0 8px 40px rgba(22,163,74,0.08)',
      }}>
        {status === 'success' && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#DCFCE7', border: '2px solid #16A34A44',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, margin: '0 auto 24px',
            }}>✅</div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
              Booking Confirmed!
            </h1>
            <p style={{ color: '#436B53', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
              Your parking spot is reserved.{txnid && <> Transaction ID: <strong>{txnid}</strong></>}
            </p>
            <div style={{
              background: '#F6FBF8', borderRadius: 14, padding: 20, marginBottom: 28,
              textAlign: 'left',
            }}>
              {[
                ['Transaction ID', txnid || '—'],
                ['Amount Paid', searchParams.get('amount') ? `₹${searchParams.get('amount')}` : '—'],
                ['Payment', 'PayU (UPI / Card / Net Banking)'],
              ].map(([k, v]) => (
                <div key={k} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '8px 0', borderBottom: '1px solid #CEEADB', fontSize: 13,
                }}>
                  <span style={{ color: '#436B53' }}>{k}</span>
                  <span style={{ fontWeight: 600 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/map')}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: '#16A34A', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                Find More Parking
              </button>
              <Link to="/" style={{
                padding: '12px 28px', borderRadius: 10, border: '1.5px solid #CEEADB',
                background: '#fff', color: '#0A1F14', fontSize: 14, fontWeight: 700,
                textDecoration: 'none', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
                Go Home
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#FEE2E2', border: '2px solid #DC262644',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, margin: '0 auto 24px',
            }}>❌</div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
              Payment Failed
            </h1>
            <p style={{ color: '#436B53', fontSize: 15, marginBottom: 24 }}>
              The transaction was not completed. Your payment was not charged.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button onClick={() => navigate('/map')}
                style={{
                  padding: '12px 28px', borderRadius: 10, border: 'none',
                  background: '#16A34A', color: '#fff', fontSize: 14, fontWeight: 700,
                  cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                Try Again
              </button>
            </div>
          </>
        )}

        {status === 'verify_failed' && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#FEF9C3', border: '2px solid #EAB30844',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, margin: '0 auto 24px',
            }}>⚠️</div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
              Payment Verification Pending
            </h1>
            <p style={{ color: '#436B53', fontSize: 15, marginBottom: 24, lineHeight: 1.6 }}>
              We received your payment but need a moment to verify it with PayU. Your booking will be confirmed shortly. Check your <Link to="/map" style={{ color: '#16A34A', fontWeight: 600 }}>dashboard</Link> in a few minutes.
            </p>
            <button onClick={() => navigate('/map')}
              style={{
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: '#16A34A', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
              Back to Map
            </button>
          </>
        )}

        {status === 'no_params' && (
          <>
            <div style={{
              width: 80, height: 80, borderRadius: '50%',
              background: '#F0FAF4', border: '2px solid #CEEADB',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, margin: '0 auto 24px',
            }}>🅿️</div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 28, marginBottom: 12 }}>
              Booking Page
            </h1>
            <p style={{ color: '#436B53', fontSize: 15, marginBottom: 24 }}>
              No active booking session found. Head to the map to find a spot.
            </p>
            <button onClick={() => navigate('/map')}
              style={{
                padding: '12px 28px', borderRadius: 10, border: 'none',
                background: '#16A34A', color: '#fff', fontSize: 14, fontWeight: 700,
                cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              }}>
              Find Parking
            </button>
          </>
        )}
      </div>
    </div>
  )
}
