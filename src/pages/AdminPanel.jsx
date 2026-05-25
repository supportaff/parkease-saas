import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

const SAMPLE_SPACES = [
  { id: 1, name: 'T Nagar Secure Parking', owner: 'Rajesh K.', slots: 14, price: 50, status: 'approved', rating: 4.8, bookings: 87, earnings: 12450 },
  { id: 2, name: 'Anna Nagar Covered Lot', owner: 'Priya M.', slots: 10, price: 65, status: 'pending', rating: 0, bookings: 0, earnings: 0 },
  { id: 3, name: 'Adyar Open Space', owner: 'Suresh R.', slots: 22, price: 40, status: 'approved', rating: 4.4, bookings: 45, earnings: 5400 },
  { id: 4, name: 'Velachery New Lot', owner: 'Anita S.', slots: 15, price: 35, status: 'pending', rating: 0, bookings: 0, earnings: 0 },
  { id: 5, name: 'OMR Premium Parking', owner: 'Vijay P.', slots: 8, price: 90, status: 'rejected', rating: 0, bookings: 0, earnings: 0 },
]

const SAMPLE_USERS = [
  { id: 1, name: 'Rajesh K.', email: 'rajesh@email.com', role: 'owner', status: 'active', spaces: 2, earnings: 12450 },
  { id: 2, name: 'Arjun M.', email: 'arjun@email.com', role: 'tenant', status: 'active', bookings: 12, spent: 1850 },
  { id: 3, name: 'Priya M.', email: 'priya@email.com', role: 'owner', status: 'active', spaces: 1, earnings: 0 },
  { id: 4, name: 'Sneha K.', email: 'sneha@email.com', role: 'tenant', status: 'suspended', bookings: 3, spent: 420 },
]

export default function AdminPanel() {
  const { profile } = useAuth()
  const [activeTab, setActiveTab] = useState('overview')
  const [spaces] = useState(SAMPLE_SPACES)
  const [users] = useState(SAMPLE_USERS)

  const pendingSpaces = spaces.filter(s => s.status === 'pending')
  const approvedSpaces = spaces.filter(s => s.status === 'approved')
  const totalRevenue = spaces.reduce((s, sp) => s + sp.earnings, 0)

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'spaces', icon: '🏗️', label: 'Spaces' },
    { id: 'users', icon: '👥', label: 'Users' },
  ]

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
            background: 'linear-gradient(135deg, #7C3AED, #6D28D9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 10,
          }}>A</div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>Admin Panel</div>
          <div style={{ fontSize: 12, color: '#436B53', marginTop: 2 }}>Platform management</div>
          <div style={{
            marginTop: 8, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4,
            background: '#EDE9FE', color: '#7C3AED', display: 'inline-block',
          }}>👑 Admin</div>
        </div>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', borderRadius: 10, border: 'none',
              background: activeTab === t.id ? '#fff' : 'transparent',
              color: activeTab === t.id ? '#7C3AED' : '#436B53',
              fontSize: 13, fontWeight: 600, cursor: 'pointer', width: '100%',
              textAlign: 'left', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '28px 32px', overflow: 'auto' }}>
        <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 24, marginBottom: 28 }}>
          {activeTab === 'overview' ? 'Platform Overview' : activeTab === 'spaces' ? 'Manage Spaces' : 'Manage Users'}
        </h1>

        {activeTab === 'overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
              {[
                { label: 'Total Spaces', val: spaces.length.toString(), icon: '🏗️', color: '#7C3AED' },
                { label: 'Pending Approval', val: pendingSpaces.length.toString(), icon: '⏳', color: '#EAB308' },
                { label: 'Approved', val: approvedSpaces.length.toString(), icon: '✅', color: '#16A34A' },
                { label: 'Total Revenue', val: `₹${totalRevenue.toLocaleString()}`, icon: '💰', color: '#059669' },
              ].map(s => (
                <div key={s.label} style={{
                  background: '#fff', border: '1.5px solid #CEEADB', borderRadius: 14, padding: '18px 20px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 28 }}>{s.icon}</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: s.color }}>{s.val}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#436B53' }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Pending approvals */}
            <div style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 16, padding: 24 }}>
              <h3 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 16, marginBottom: 16 }}>
                ⏳ Pending Approvals ({pendingSpaces.length})
              </h3>
              {pendingSpaces.map(s => (
                <div key={s.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 0', borderBottom: '1px solid #FDE68A',
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: '#436B53' }}>By {s.owner} · {s.slots} slots · ₹{s.price}/hr</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button style={{
                      padding: '6px 16px', borderRadius: 8, border: 'none',
                      background: '#16A34A', color: '#fff', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer',
                    }}>Approve</button>
                    <button style={{
                      padding: '6px 16px', borderRadius: 8, border: '1.5px solid #DC2626',
                      background: 'transparent', color: '#DC2626', fontSize: 12, fontWeight: 700,
                      cursor: 'pointer',
                    }}>Reject</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spaces' && (
          <div style={{ background: '#fff', border: '1.5px solid #CEEADB', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F6FBF8', borderBottom: '1px solid #CEEADB' }}>
                  {['Name', 'Owner', 'Slots', 'Price/hr', 'Status', 'Rating', 'Bookings', 'Earnings'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#436B53', fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {spaces.map(s => (
                  <tr key={s.id} style={{ borderBottom: '1px solid #CEEADB' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{s.name}</td>
                    <td style={{ padding: '12px 16px', color: '#436B53' }}>{s.owner}</td>
                    <td style={{ padding: '12px 16px' }}>{s.slots}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700 }}>₹{s.price}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: s.status === 'approved' ? '#DCFCE7' : s.status === 'pending' ? '#FEF9C3' : '#FEE2E2',
                        color: s.status === 'approved' ? '#16A34A' : s.status === 'pending' ? '#CA8A04' : '#DC2626',
                      }}>{s.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>{s.rating > 0 ? `★ ${s.rating}` : '—'}</td>
                    <td style={{ padding: '12px 16px' }}>{s.bookings}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16A34A' }}>₹{s.earnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div style={{ background: '#fff', border: '1.5px solid #CEEADB', borderRadius: 16, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#F6FBF8', borderBottom: '1px solid #CEEADB' }}>
                  {['Name', 'Email', 'Role', 'Status', 'Spaces/Bookings', 'Revenue/Spent'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 700, color: '#436B53', fontSize: 12, textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #CEEADB' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: '12px 16px', color: '#436B53', fontSize: 12 }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: u.role === 'owner' ? '#DCFCE7' : '#DBEAFE',
                        color: u.role === 'owner' ? '#16A34A' : '#2563EB',
                      }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
                        background: u.status === 'active' ? '#DCFCE7' : '#FEE2E2',
                        color: u.status === 'active' ? '#16A34A' : '#DC2626',
                      }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#436B53' }}>
                      {u.spaces ? `${u.spaces} spaces` : `${u.bookings} bookings`}
                    </td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#16A34A' }}>
                      ₹{(u.earnings || u.spent || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
