import { Router } from 'express'
import { getAuth, getDb } from '../lib/firebase.js'
import { authenticate } from '../lib/auth.js'

const router = Router()

/**
 * POST /api/auth/register
 * Body: { uid, role: "owner" | "tenant" | "admin", name, phone }
 * Sets custom claims on Firebase Auth user
 */
router.post('/register', authenticate, async (req, res) => {
  try {
    const { role } = req.body
    const { uid, email, name: authName } = req.user

    if (!['admin', 'owner', 'tenant'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Must be admin, owner, or tenant' })
    }

    // Admins can only be created by other admins (checked via auth)
    if (role === 'admin' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can create admin accounts' })
    }

    // Set custom claims
    const auth = getAuth()
    await auth.setCustomUserClaims(uid, { role })

    // Create/update Firestore user document
    const db = getDb()
    const userRef = db.collection('users').doc(uid)
    const userData = {
      uid,
      email: email || '',
      name: req.body.name || authName || '',
      phone: req.body.phone || '',
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    await userRef.set(userData, { merge: true })

    res.status(200).json({ success: true, role, uid })
  } catch (err) {
    console.error('[auth/register]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/auth/me
 * Returns current user profile from Firestore
 */
router.get('/me', authenticate, async (req, res) => {
  try {
    const db = getDb()
    const userDoc = await db.collection('users').doc(req.user.uid).get()
    if (!userDoc.exists) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({ id: userDoc.id, ...userDoc.data() })
  } catch (err) {
    console.error('[auth/me]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/auth/profile
 * Update user profile fields (name, phone)
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const db = getDb()
    const { name, phone } = req.body
    const updates = { updatedAt: new Date().toISOString() }
    if (name) updates.name = name
    if (phone) updates.phone = phone

    await db.collection('users').doc(req.user.uid).update(updates)
    res.json({ success: true })
  } catch (err) {
    console.error('[auth/profile]', err.message)
    res.status(500).json({ error: err.message })
  }
})

export default router