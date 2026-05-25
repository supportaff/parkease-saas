import express from 'express'
import cors from 'cors'
import { initFirebase } from './lib/firebase.js'

const app = express()
const PORT = process.env.PORT || 8080

// Initialize Firebase on startup
initFirebase()

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true })) // PayU sends form POST data

// Health check
app.get('/health', (_, res) => res.json({
  status: 'ok',
  service: 'parkease-api',
  version: '1.0.0',
  timestamp: new Date().toISOString(),
}))

// Routes
import authRoutes from './routes/auth.js'
import listingRoutes from './routes/listings.js'
import bookingRoutes from './routes/bookings.js'
import paymentRoutes from './routes/payments.js'
import adminRoutes from './routes/admin.js'

app.use('/api/auth', authRoutes)
app.use('/api/listings', listingRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error('[unhandled]', err)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`ParkEase API running on port ${PORT}`)
})

export default app