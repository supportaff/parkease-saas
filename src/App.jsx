import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import TenantDashboard from './pages/TenantDashboard'
import OwnerDashboard from './pages/OwnerDashboard'
import AdminPanel from './pages/AdminPanel'
import BookingPage from './pages/BookingPage'
import ProtectedRoute from './components/ProtectedRoute'

export default function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg, #16A34A, #15803D)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 900, color: '#fff' }}>P</div>
        <div style={{ color: '#436B53', fontSize: 14 }}>Loading ParkEase...</div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />

          {/* Tenant routes */}
          <Route path="/map" element={
            <ProtectedRoute role="tenant">
              <TenantDashboard />
            </ProtectedRoute>
          } />
          <Route path="/booking/:spaceId" element={
            <ProtectedRoute role="tenant">
              <BookingPage />
            </ProtectedRoute>
          } />

          {/* Owner routes */}
          <Route path="/owner/*" element={
            <ProtectedRoute role="owner">
              <OwnerDashboard />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/*" element={
            <ProtectedRoute role="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
