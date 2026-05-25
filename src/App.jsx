import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import TenantDashboard from './pages/TenantDashboard.jsx'
import OwnerDashboard from './pages/OwnerDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import BookingPage from './pages/BookingPage.jsx'
import MyBookings from './pages/MyBookings.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/tenant" element={<TenantDashboard />} />
      <Route path="/owner" element={<OwnerDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/book/:spotId" element={<BookingPage />} />
      <Route path="/my-bookings" element={<MyBookings />} />
    </Routes>
  )
}