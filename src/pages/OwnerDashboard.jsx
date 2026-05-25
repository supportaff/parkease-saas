import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function OwnerDashboard() {
  const { user, profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [showAddSpot, setShowAddSpot] = useState(false)

  const stats = [
    { label: 'Total Earnings', val: '₹48,620', icon: '💰', color: '#059669', sub: 'This month' },
    { label: 'Total Bookings', val: '213', icon: '📋', color: '#0D9488', sub: 'All time' },
    { label: 'Active Slots', val: '8/14', icon: '🅿️', color: '#16A34A', sub: 'Currently occupied' },
    { label: 'Avg. Rating', val: '4.8 ★', icon: '⭐', color: '#7C3AED', sub: 'Based on 218 reviews' },
  ]

  const bookings = [
    { id: 'PKE-B001', user: 'Arjun K.', vehicle: 'TN 09 AB 1234', type: '4-Wheeler', duration: '3 hrs', amount: 150, status: 'active', time: 'Today, 2:00 PM' },
    { id: 'PKE-B002', user: 'Priya M.', vehicle: 'TN 07 CD 5678', type: '2-Wheeler', duration: 'Daily', amount: 100, status: 'completed', time: 'Yesterday' },
    { id: 'PKE-B003', user: 'Ravi P.', vehicle: 'TN 22 EF 9012', type: '4-Wheeler', duration: 'Monthly', amount: 1500, status: 'active', time: 'This month' },
    { id: 'PKE-B004', user: 'Anita S.', vehicle: 'TN 11 GH 3456', type: '2-Wheeler', duration: '2 hrs', amount: 30, status: 'completed', time: '2 days ago' },
    { id: 'PKE-B005', user: 'Karthik R.', vehicle: 'TN 05 IJ 7890', type: '4-Wheeler', duration: '5 hrs', amount: 250, status: 'completed', time: '3 days ago' },
  ]

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'listings', icon: '🏗️', label: 'My Spaces' },
    { id: 'bookings', icon: '📋', label: 'Bookings' },
    { id: 'earnings', icon: '💰', label: 'Earnings' },
  ]

  const activeBookings = bookings.filter(b => b.status === 'active')
  const totalEarnings = bookings.reduce((s, b) => s + b.amount, 0)

  return (
    <div style={{ paddingTop: 60, minHeight: '100vh', display: 'flex', background: '#fff' }}>
      {/* Sidebar */}
      <div style={{
        width: 220, background: '#F6FBF8', borderRight: '1px solid #CEEADB',
        padding: '28px 12px', display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0,
      }}>
        <div style={{ padding: '12px 16px', marginBottom: 16 }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            background: 'linear-gradient(135deg, #16A34A, #15803D)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 10,
          }}>{(profile?.name || 'O')[0].toUpperCase()}</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>{profile?.name || 'Space Owner'}</div>
          <div style={{ fontSize: 12, color: '#436B53', marginTop: 2 }}>{user?.email || ''}</div>
          <div style={{
            marginTop: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
            background: '#DCFCE7', color: '#16A34A', display: 'inline-block',
          }}>🏗️ Space Owner</div>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, border: 'none',
              background: activeTab === t.id ? '#fff' : 'transparent',
              color: activeTab === t.id ? '#16A34A' : '#436B53',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
              textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif",
              boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.04)' : 'none',
            }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 4 }}>
              {activeTab === 'overview' ? 'Dashboard Overview' : activeTab === 'listings' ? 'My Parking Spaces' : activeTab === 'bookings' ? 'Booking History' : 'Earnings & Payouts'}
            </h1>
            {activeTab === 'overview' && <p style={{ color: '#436B53', fontSize: 14 }}>Welcome back! Here's your parking performance.</p>}
          </div>
          <button onClick={() => setShowAddSpot(true)}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#16A34A', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', fontFamily: "'Plus Jakarta Sans', sans-serif",
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            + Add Space
          </button>
        </div>

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
              {stats.map(s => (
                <div key={s.label} style={{
                  background: '#fff', border: '1.5px solid #CEEADB', borderRadius: 14, padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: s.color }}>{s.val}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#436B53' }}>{s.label}</div>
                  <div style={{ fontSize: 11, color: '#7EA88E', marginTop: 2 }}>{s.sub}</div>
                </div>
              ))}
            </div>

            <div style={{ background: '#F6FBF8', borderRadius: 16, padding: 24, border: '1px solid #CEEADB' }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                Active Bookings ({activeBookings.length})
              </h3>
              {activeBookings.map(b => (
                <div key={b.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '14px 0', borderBottom: '1px solid #CEEADB',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{b.user}</div>
                    <div style={{ fontSize: 12, color: '#436B53' }}>{b.vehicle} · {b.duration}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: '#16A34A' }}>₹{b.amount}</div>
                    <div style={{ fontSize: 11, color: '#7EA88E' }}>{b.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div style={{ background: '#fff', border: '1.5px solid #CEEADB', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F6FBF8', borderBottom: '1px solid #CEEADB' }}>
                  {['ID', 'User', 'Vehicle', 'Duration', 'Amount', 'Status', 'Time'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#436B53', fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #CEEADB' }}>
                    <td style={{ padding: '12px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 11 }}>{b.id}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{b.user}</td>
                    <td style={{ padding: '12px 16px', color: '#436B53' }}>{b.vehicle}</td>
                    <td style={{ padding: '12px 16px' }}>{b.duration}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16A34A' }}>₹{b.amount}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: b.status === 'active' ? '#DCFCE7' : '#F3F4F6',
                        color: b.status === 'active' ? '#16A34A' : '#6B7280',
                      }}>{b.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#7EA88E', fontSize: 12 }}>{b.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {(activeTab === 'listings' || activeTab === 'earnings') && (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '60px 20px', color: '#7EA88E', gap: 12,
          }}>
            <div style={{ fontSize: 48 }}>{activeTab === 'listings' ? '🏗️' : '💰'}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#436B53' }}>
              {activeTab === 'listings' ? 'Manage your parking spaces' : 'Track your earnings'}
            </div>
            <div style={{ fontSize: 13 }}>Connect to Firestore to see your data here.</div>
          </div>
        )}
      </div>

      {/* Add Spot Modal */}
      {showAddSpot && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowAddSpot(false)}>
          <div className="fade-up" style={{
            background: '#fff', borderRadius: 24, padding: 32, maxWidth: 480, width: '90%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20, marginBottom: 20 }}>
              Add Parking Space
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>SPACE NAME</label>
                <input placeholder="e.g. T Nagar Secure Parking"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }} />
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>ADDRESS</label>
                <input placeholder="Area, Landmark, Chennai"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>PRICE (₹/hr)</label>
                  <input type="number" placeholder="50"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }} />
                </div>
                <div>
                  <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>TOTAL SLOTS</label>
                  <input type="number" placeholder="10"
                    style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }} />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>PAYOUT UPI ID</label>
                <input placeholder="yourname@upi"
                  style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8' }} />
              </div>
              <button
                style={{
                  width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                  background: '#16A34A', color: '#fff', fontSize: 15, fontWeight: 700,
                  cursor: 'pointer', marginTop: 8, fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                Submit for Approval
              </button>
              <p style={{ textAlign: 'center', fontSize: 12, color: '#7EA88E' }}>
                Your space will be reviewed by admin before going live.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
