import { Router } from 'express'
import { getDb } from '../lib/firebase.js'
import { authenticate, requireRole } from '../lib/auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

const SPACES_COL = 'spaces'
const SPOTS_COL = 'spots'
const BOOKINGS_COL = 'bookings'

/**
 * POST /api/bookings
 * Tenant creates a booking. Must provide spaceId, spotId, startTime, endTime
 * Uses Firestore transaction for concurrency safety
 */
router.post('/', authenticate, requireRole('tenant', 'admin'), async (req, res) => {
  try {
    const db = getDb()
    const { spaceId, spotId, startTime, endTime } = req.body

    if (!spaceId || !spotId || !startTime || !endTime) {
      return res.status(400).json({ error: 'Missing required fields: spaceId, spotId, startTime, endTime' })
    }

    const start = new Date(startTime)
    const end = new Date(endTime)

    if (end <= start) {
      return res.status(400).json({ error: 'End time must be after start time' })
    }

    // Get space details for pricing
    const spaceDoc = await db.collection(SPACES_COL).doc(spaceId).get()
    if (!spaceDoc.exists) {
      return res.status(404).json({ error: 'Parking space not found' })
    }
    const spaceData = spaceDoc.data()
    if (spaceData.status !== 'active') {
      return res.status(400).json({ error: 'Parking space is not active' })
    }

    // Calculate amount
    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)))
    const amount = hours * spaceData.basePrice

    // Firestore transaction: check spot availability + create booking atomically
    const bookingId = uuidv4()
    const txnId = 'PKE-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 5).toUpperCase()

    await db.runTransaction(async (transaction) => {
      const spotRef = db.collection(SPACES_COL).doc(spaceId).collection(SPOTS_COL).doc(spotId)
      const spotDoc = await transaction.get(spotRef)

      if (!spotDoc.exists) {
        throw new Error('Spot not found')
      }

      if (spotDoc.data().currentStatus !== 'available') {
        throw new Error('Spot is already booked or occupied')
      }

      // Mark spot as booked
      transaction.update(spotRef, {
        currentStatus: 'booked',
        currentBookingId: bookingId,
      })

      // Create booking
      const bookingRef = db.collection(BOOKINGS_COL).doc(bookingId)
      transaction.set(bookingRef, {
        bookingId,
        spaceId,
        spotId,
        tenantId: req.user.uid,
        ownerId: spaceData.ownerId,
        spaceName: spaceData.name,
        spotLabel: spotDoc.data().label,
        startTime: start.toISOString(),
        endTime: end.toISOString(),
        hours,
        basePrice: spaceData.basePrice,
        amount,
        commission: Math.round(amount * 0.1), // 10% platform fee
        ownerPayout: amount - Math.round(amount * 0.1),
        status: 'pending_payment', // awaiting PayU payment
        txnId,
        paymentId: null,
        paymentMethod: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
    })

    res.status(201).json({
      bookingId,
      txnId,
      amount,
      hours,
      spaceName: spaceData.name,
      status: 'pending_payment',
    })
  } catch (err) {
    console.error('[bookings/create]', err.message)
    if (err.message === 'Spot not found' || err.message === 'Spot is already booked or occupied') {
      return res.status(409).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/bookings/:id/confirm
 * Called by payment success webhook — marks booking as confirmed
 */
router.put('/:id/confirm', async (req, res) => {
  try {
    const db = getDb()
    const { paymentId, paymentMethod } = req.body
    const bookingRef = db.collection(BOOKINGS_COL).doc(req.params.id)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    if (bookingDoc.data().status !== 'pending_payment') {
      return res.status(400).json({ error: `Cannot confirm booking with status: ${bookingDoc.data().status}` })
    }

    await bookingRef.update({
      status: 'upcoming',
      paymentId,
      paymentMethod,
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true, status: 'upcoming' })
  } catch (err) {
    console.error('[bookings/confirm]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/bookings/:id/cancel
 * Cancel an upcoming booking — frees the spot
 */
router.put('/:id/cancel', authenticate, async (req, res) => {
  try {
    const db = getDb()
    const bookingRef = db.collection(BOOKINGS_COL).doc(req.params.id)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = bookingDoc.data()

    // Only tenant who booked or admin can cancel
    if (req.user.role !== 'admin' && booking.tenantId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only cancel your own bookings' })
    }

    if (!['upcoming', 'pending_payment'].includes(booking.status)) {
      return res.status(400).json({ error: `Cannot cancel booking with status: ${booking.status}` })
    }

    // Free the spot
    const spotRef = db.collection(SPACES_COL).doc(booking.spaceId).collection(SPOTS_COL).doc(booking.spotId)
    await spotRef.update({
      currentStatus: 'available',
      currentBookingId: null,
    })

    // Update booking
    await bookingRef.update({
      status: 'cancelled',
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true, status: 'cancelled' })
  } catch (err) {
    console.error('[bookings/cancel]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/bookings/:id/checkin
 * Tenant checks in — marks spot as occupied
 */
router.put('/:id/checkin', authenticate, async (req, res) => {
  try {
    const db = getDb()
    const bookingRef = db.collection(BOOKINGS_COL).doc(req.params.id)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = bookingDoc.data()
    if (req.user.uid !== booking.tenantId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (booking.status !== 'upcoming') {
      return res.status(400).json({ error: `Cannot check-in booking with status: ${booking.status}` })
    }

    // Mark spot as occupied
    const spotRef = db.collection(SPACES_COL).doc(booking.spaceId).collection(SPOTS_COL).doc(booking.spotId)
    await spotRef.update({ currentStatus: 'occupied' })

    // Update booking
    await bookingRef.update({
      status: 'active',
      checkedInAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true, status: 'active' })
  } catch (err) {
    console.error('[bookings/checkin]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/bookings/:id/checkout
 * Tenant checks out — marks spot available, booking completed
 */
router.put('/:id/checkout', authenticate, async (req, res) => {
  try {
    const db = getDb()
    const bookingRef = db.collection(BOOKINGS_COL).doc(req.params.id)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = bookingDoc.data()
    if (req.user.uid !== booking.tenantId && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (booking.status !== 'active') {
      return res.status(400).json({ error: `Cannot checkout booking with status: ${booking.status}` })
    }

    // Free the spot
    const spotRef = db.collection(SPACES_COL).doc(booking.spaceId).collection(SPOTS_COL).doc(booking.spotId)
    await spotRef.update({
      currentStatus: 'available',
      currentBookingId: null,
    })

    // Complete booking
    await bookingRef.update({
      status: 'completed',
      checkedOutAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true, status: 'completed' })
  } catch (err) {
    console.error('[bookings/checkout]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/bookings
 * List bookings. Tenant sees own, owner sees for their spaces, admin sees all.
 * Query: ?status=upcoming (filter by status)
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const db = getDb()
    let query = db.collection(BOOKINGS_COL)

    if (req.user.role === 'tenant') {
      query = query.where('tenantId', '==', req.user.uid)
    } else if (req.user.role === 'owner') {
      query = query.where('ownerId', '==', req.user.uid)
    }
    // Admin sees all

    if (req.query.status) {
      query = query.where('status', '==', req.query.status)
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get()
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))

    res.json(bookings)
  } catch (err) {
    console.error('[bookings/list]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/bookings/:id
 * Single booking detail
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = getDb()
    const bookingDoc = await db.collection(BOOKINGS_COL).doc(req.params.id).get()
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }
    res.json({ id: bookingDoc.id, ...bookingDoc.data() })
  } catch (err) {
    console.error('[bookings/detail]', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router