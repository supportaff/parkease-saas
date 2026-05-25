import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 8080

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (_, res) => res.json({ status: 'ok', service: 'parkease-api' }))

// Routes
app.use('/api/auth', (req, res) => res.json({ message: 'Auth routes' }))
app.use('/api/listings', (req, res) => res.json({ message: 'Listings routes' }))
app.use('/api/bookings', (req, res) => res.json({ message: 'Bookings routes' }))
app.use('/api/payments', (req, res) => res.json({ message: 'PayU payment routes' }))
app.use('/api/admin', (req, res) => res.json({ message: 'Admin routes' }))

app.listen(PORT, () => {
  console.log(`ParkEase API running on port ${PORT}`)
})