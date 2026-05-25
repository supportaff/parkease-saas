import { Router } from 'express'
import { getDb, getAuth } from '../lib/firebase.js'
import { authenticate, requireRole } from '../lib/auth.js'

const router = Router()

// All admin routes require admin role
router.use(authenticate, requireRole('admin'))

/**
 * GET /api/admin/stats
 * Dashboard overview: user counts, space stats, booking stats, revenue
 */
router.get('/stats', async (req, res) => {
  try {
    const db = getDb()

    // User counts by role
    const usersSnap = await db.collection('users').get()
    const users = usersSnap.docs.map(d => d.data())
    const userStats = {
      total: users.length,
      admins: users.filter(u => u.role === 'admin').length,
      owners: users.filter(u => u.role === 'owner').length,
      tenants: users.filter(u => u.role === 'tenant').length,
    }

    // Space stats
    const spacesSnap = await db.collection('spaces').get()
    const spaces = spacesSnap.docs.map(d => d.data())
    const spaceStats = {
      total: spaces.length,
      active: spaces.filter(s => s.status === 'active').length,
      pending: spaces.filter(s => s.status === 'pending').length,
      disabled: spaces.filter(s => s.status === 'disabled').length,
    }

    // Booking stats
    const bookingsSnap = await db.collection('bookings').get()
    const bookings = bookingsSnap.docs.map(d => d.data())
    const bookingStats = {
      total: bookings.length,
      upcoming: bookings.filter(b => b.status === 'upcoming').length,
      active: bookings.filter(b => b.status === 'active').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'cancelled').length,
      pendingPayment: bookings.filter(b => b.status === 'pending_payment').length,
    }

    // Revenue
    const totalRevenue = bookings
      .filter(b => b.status === 'completed' || b.status === 'active')
      .reduce((sum, b) => sum + (b.amount || 0), 0)

    const totalCommission = bookings
      .filter(b => b.status === 'completed' || b.status === 'active')
      .reduce((sum, b) => sum + (b.commission || 0), 0)

    res.json({
      users: userStats,
      spaces: spaceStats,
      bookings: bookingStats,
      revenue: {
        totalGross: totalRevenue,
        totalCommission: totalCommission,
        totalPayouts: totalRevenue - totalCommission,
      },
    })
  } catch (err) {
    console.error('[admin/stats]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/admin/spaces
 * All spaces including pending/disabled (full admin view)
 */
router.get('/spaces', async (req, res) => {
  try {
    const db = getDb()
    const snapshot = await db.collection('spaces').orderBy('createdAt', 'desc').get()
    const spaces = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(spaces)
  } catch (err) {
    console.error('[admin/spaces]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/admin/spaces/:id/approve
 * Approve pending space
 */
router.put('/spaces/:id/approve', async (req, res) => {
  try {
    const db = getDb()
    const spaceRef = db.collection('spaces').doc(req.params.id)
    const doc = await spaceRef.get()

    if (!doc.exists) return res.status(404).json({ error: 'Space not found' })

    await spaceRef.update({
      status: 'active',
      approvedBy: req.user.uid,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true, status: 'active' })
  } catch (err) {
    console.error('[admin/spaces/approve]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/admin/spaces/:id/toggle
 * Toggle space between active/disabled
 */
router.put('/spaces/:id/toggle', async (req, res) => {
  try {
    const db = getDb()
    const spaceRef = db.collection('spaces').doc(req.params.id)
    const doc = await spaceRef.get()

    if (!doc.exists) return res.status(404).json({ error: 'Space not found' })

    const currentStatus = doc.data().status
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active'

    await spaceRef.update({
      status: newStatus,
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true, status: newStatus })
  } catch (err) {
    console.error('[admin/spaces/toggle]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/admin/users
 * List all users
 */
router.get('/users', async (req, res) => {
  try {
    const db = getDb()
    const snapshot = await db.collection('users').orderBy('createdAt', 'desc').get()
    const users = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(users)
  } catch (err) {
    console.error('[admin/users]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/admin/users/:id/role
 * Change user role
 */
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body
    if (!['admin', 'owner', 'tenant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    const auth = getAuth()
    await auth.setCustomUserClaims(req.params.id, { role })

    const db = getDb()
    await db.collection('users').doc(req.params.id).update({
      role,
      updatedAt: new Date().toISOString(),
    })

    res.json({ success: true })
  } catch (err) {
    console.error('[admin/users/role]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/admin/bookings
 * All bookings
 */
router.get('/bookings', async (req, res) => {
  try {
    const db = getDb()
    let query = db.collection('bookings')

    if (req.query.status) {
      query = query.where('status', '==', req.query.status)
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get()
    const bookings = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    res.json(bookings)
  } catch (err) {
    console.error('[admin/bookings]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/admin/payouts
 * List completed bookings pending owner payout
 */
router.get('/payouts', async (req, res) => {
  try {
    const db = getDb()
    const snapshot = await db.collection('bookings')
      .where('status', '==', 'completed')
      .where('ownerPayoutStatus', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .get()

    const payouts = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
    const totalPending = payouts.reduce((sum, p) => sum + (p.ownerPayout || 0), 0)

    res.json({ payouts, totalPending })
  } catch (err) {
    console.error('[admin/payouts]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/admin/payouts/:id/mark-paid
 * Mark owner payout as paid
 */
router.post('/payouts/:id/mark-paid', async (req, res) => {
  try {
    const db = getDb()
    await db.collection('bookings').doc(req.params.id).update({
      ownerPayoutStatus: 'paid',
      paidAt: new Date().toISOString(),
      paidBy: req.user.uid,
      updatedAt: new Date().toISOString(),
    })
    res.json({ success: true })
  } catch (err) {
    console.error('[admin/payouts/mark-paid]', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router