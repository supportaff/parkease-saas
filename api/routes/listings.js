import { Router } from 'express'
import admin, { getDb } from '../lib/firebase.js'
import { authenticate, requireRole, optionalAuth } from '../lib/auth.js'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

const SPACES_COL = 'spaces'
const SPOTS_COL = 'spots'

/**
 * POST /api/listings
 * Owner creates a new parking space
 * Admin auto-approved; owner spaces need admin approval
 * Auto-generates spots
 */
router.post('/', authenticate, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const db = getDb()
    const {
      name, address, location, // { lat, lng }
      basePrice,               // ₹/hr
      totalSpots,
      spotTypes,               // e.g. [{ count: 8, type: 'car' }, { count: 4, type: 'bike' }]
      photos = [],
      amenities = [],
      instructions = '',
    } = req.body

    if (!name || !address || !location || !basePrice || !totalSpots) {
      return res.status(400).json({ error: 'Missing required fields: name, address, location, basePrice, totalSpots' })
    }

    const spaceId = uuidv4()
    const isAdmin = req.user.role === 'admin'

    // Create space document
    const spaceData = {
      spaceId,
      ownerId: req.user.uid,
      ownerName: req.user.name || '',
      name,
      address,
      location: new admin.firestore.GeoPoint(location.lat, location.lng),
      basePrice: Number(basePrice),
      totalSpots: Number(totalSpots),
      photos,
      amenities,
      instructions,
      status: isAdmin ? 'active' : 'pending', // admin spaces auto-active
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await db.collection(SPACES_COL).doc(spaceId).set(spaceData)

    // Auto-generate spots
    const spotLabels = generateSpotLabels(totalSpots, spotTypes)
    const batch = db.batch()
    for (const label of spotLabels) {
      const spotRef = db.collection(SPACES_COL).doc(spaceId).collection(SPOTS_COL).doc()
      batch.set(spotRef, {
        label,
        type: label.startsWith('B') ? 'bike' : 'car',
        currentStatus: 'available',
        currentBookingId: null,
        createdAt: new Date().toISOString(),
      })
    }
    await batch.commit()

    res.status(201).json({ spaceId, status: spaceData.status, spotCount: spotLabels.length })
  } catch (err) {
    console.error('[listings/create]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/listings
 * List all active spaces with available spot counts
 * Query: ?lat=X&lng=Y&radius=2 (filters by proximity)
 * Query: ?ownerId=X (owner's own spaces)
 * Query: ?status=pending (admin only)
 */
router.get('/', optionalAuth, async (req, res) => {
  try {
    const db = getDb()
    let query = db.collection(SPACES_COL)

    // Admin can see all; owners see their own + active; tenants see active only
    if (req.user?.role === 'owner') {
      query = query.where('ownerId', '==', req.user.uid)
    } else if (!req.user || req.user.role === 'tenant') {
      query = query.where('status', '==', 'active')
    }

    const snapshot = await query.get()
    const spaces = []

    for (const doc of snapshot.docs) {
      const space = { id: doc.id, ...doc.data() }

      // Count available spots
      const spotsSnap = await db
        .collection(SPACES_COL).doc(doc.id).collection(SPOTS_COL)
        .where('currentStatus', '==', 'available')
        .get()

      space.availableSpots = spotsSnap.size
      spaces.push(space)
    }

    // Filter by radius if lat/lng provided (simple bounding box)
    if (req.query.lat && req.query.lng) {
      const lat = parseFloat(req.query.lat)
      const lng = parseFloat(req.query.lng)
      const radius = parseFloat(req.query.radius) || 2 // km

      // Approx: 1° lat ≈ 111km, 1° lng ≈ 111*cos(lat) km
      const latDelta = radius / 111
      const lngDelta = radius / (111 * Math.cos(lat * Math.PI / 180))

      return res.json(
        spaces.filter(s => {
          const loc = s.location
          if (!loc?._latitude) return false
          return (
            Math.abs(loc._latitude - lat) <= latDelta &&
            Math.abs(loc._longitude - lng) <= lngDelta
          )
        }).map(s => ({
          ...s,
          // Color code for frontend
          color: s.availableSpots >= 3 ? 'green' : s.availableSpots >= 1 ? 'yellow' : 'red',
        }))
      )
    }

    res.json(spaces)
  } catch (err) {
    console.error('[listings/list]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * GET /api/listings/:id
 * Single space detail with all spots
 */
router.get('/:id', async (req, res) => {
  try {
    const db = getDb()
    const spaceDoc = await db.collection(SPACES_COL).doc(req.params.id).get()
    if (!spaceDoc.exists) {
      return res.status(404).json({ error: 'Space not found' })
    }

    const space = { id: spaceDoc.id, ...spaceDoc.data() }

    // Get all spots
    const spotsSnap = await db
      .collection(SPACES_COL).doc(req.params.id).collection(SPOTS_COL)
      .get()
    const spots = spotsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

    res.json({ ...space, spots })
  } catch (err) {
    console.error('[listings/detail]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * PUT /api/listings/:id
 * Update space details (owner or admin)
 */
router.put('/:id', authenticate, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const db = getDb()
    const spaceRef = db.collection(SPACES_COL).doc(req.params.id)
    const spaceDoc = await spaceRef.get()

    if (!spaceDoc.exists) {
      return res.status(404).json({ error: 'Space not found' })
    }

    // Owners can only edit their own spaces
    if (req.user.role === 'owner' && spaceDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only edit your own spaces' })
    }

    const allowedFields = ['name', 'address', 'basePrice', 'photos', 'amenities', 'instructions']
    const updates = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) updates[field] = req.body[field]
    }
    updates.updatedAt = new Date().toISOString()

    await spaceRef.update(updates)
    res.json({ success: true })
  } catch (err) {
    console.error('[listings/update]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * DELETE /api/listings/:id
 * Soft delete — set status to 'disabled'
 */
router.delete('/:id', authenticate, requireRole('owner', 'admin'), async (req, res) => {
  try {
    const db = getDb()
    const spaceRef = db.collection(SPACES_COL).doc(req.params.id)
    const spaceDoc = await spaceRef.get()

    if (!spaceDoc.exists) {
      return res.status(404).json({ error: 'Space not found' })
    }

    if (req.user.role === 'owner' && spaceDoc.data().ownerId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only delete your own spaces' })
    }

    await spaceRef.update({ status: 'disabled', updatedAt: new Date().toISOString() })
    res.json({ success: true })
  } catch (err) {
    console.error('[listings/delete]', err.message)
    res.status(500).json({ error: err.message })
  }
})

// Helper: generate spot labels by type
function generateSpotLabels(total, types) {
  const labels = []
  let count = 1
  if (types && types.length > 0) {
    for (const t of types) {
      const prefix = t.type === 'bike' ? 'B' : 'P'
      for (let i = 0; i < t.count && labels.length < total; i++) {
        labels.push(`${prefix}${count++}`)
      }
    }
  }
  // Fill remaining with car spots
  while (labels.length < total) {
    labels.push(`P${count++}`)
  }
  return labels
}

export default router