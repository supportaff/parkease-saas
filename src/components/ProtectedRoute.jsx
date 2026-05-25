import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function ProtectedRoute({ children, role }) {
  const { user, profile, loading } = useAuth()

  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  if (role && profile?.role !== role) {
    // Redirect to the correct dashboard based on their role
    if (profile?.role === 'admin') return <Navigate to="/admin" replace />
    if (profile?.role === 'owner') return <Navigate to="/owner" replace />
    return <Navigate to="/map" replace />
  }
  return children
}
