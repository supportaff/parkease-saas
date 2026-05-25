import { Router } from 'express'
import { getDb } from '../lib/firebase.js'
import { authenticate, requireRole } from '../lib/auth.js'
import { getPayUFormParams, verifyResponseHash } from '../lib/payu.js'

const router = Router()

/**
 * POST /api/payments/create-order
 * Generates PayU form params for the frontend to redirect
 * Body: { bookingId }
 */
router.post('/create-order', authenticate, requireRole('tenant', 'admin'), async (req, res) => {
  try {
    const db = getDb()
    const { bookingId } = req.body

    if (!bookingId) {
      return res.status(400).json({ error: 'bookingId is required' })
    }

    const bookingDoc = await db.collection('bookings').doc(bookingId).get()
    if (!bookingDoc.exists) {
      return res.status(404).json({ error: 'Booking not found' })
    }

    const booking = bookingDoc.data()

    // Only the tenant who created the booking can pay
    if (req.user.role !== 'admin' && booking.tenantId !== req.user.uid) {
      return res.status(403).json({ error: 'You can only pay for your own bookings' })
    }

    if (booking.status !== 'pending_payment') {
      return res.status(400).json({ error: `Booking already has status: ${booking.status}` })
    }

    // Get tenant user info
    const userDoc = await db.collection('users').doc(req.user.uid).get()
    const user = userDoc.exists ? userDoc.data() : {}

    // Generate PayU form params
    // udf1 = bookingId, udf2 = spaceId (used in webhook to identify booking)
    const payuParams = getPayUFormParams({
      txnid: booking.txnId,
      amount: booking.amount,
      productinfo: `ParkEase: ${booking.spaceName} - ${booking.spotLabel}`,
      firstname: user.name || req.user.name || 'Guest',
      email: user.email || req.user.email || 'guest@parkease.in',
      phone: user.phone || '',
      udf1: bookingId,
      udf2: booking.spaceId,
    })

    res.json(payuParams)
  } catch (err) {
    console.error('[payments/create-order]', err.message)
    res.status(500).json({ error: err.message })
  }
})

/**
 * POST /api/payments/success
 * PayU redirects here on successful payment
 * Body: PayU response params (form POST)
 */
router.post('/success', async (req, res) => {
  try {
    const db = getDb()
    const payuResponse = req.body

    console.log('[PayU Success]', JSON.stringify(payuResponse))

    // Verify hash
    const isValid = verifyResponseHash({
      salt: process.env.PAYU_SALT,
      status: payuResponse.status,
      udf5: payuResponse.udf5 || '',
      udf4: payuResponse.udf4 || '',
      udf3: payuResponse.udf3 || '',
      udf2: payuResponse.udf2 || '',
      udf1: payuResponse.udf1 || '',
      email: payuResponse.email,
      firstname: payuResponse.firstname,
      productinfo: payuResponse.productinfo,
      amount: payuResponse.amount,
      txnid: payuResponse.txnid,
      key: process.env.PAYU_MERCHANT_KEY,
      expectedHash: payuResponse.hash,
    })

    if (!isValid) {
      console.error('[PayU] Hash verification failed')
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?error=hash_mismatch`)
    }

    if (payuResponse.status !== 'success') {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?status=${payuResponse.status}`)
    }

    // Confirm booking
    const bookingId = payuResponse.udf1
    const bookingRef = db.collection('bookings').doc(bookingId)
    const bookingDoc = await bookingRef.get()

    if (!bookingDoc.exists) {
      return res. redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?error=booking_not_found`)
    }

    await bookingRef.update({
      status: 'upcoming',
      paymentId: payuResponse.mihpayid || payuResponse.txnid,
      paymentMethod: 'PayU',
      payuResponse: JSON.stringify(payuResponse),
      updatedAt: new Date().toISOString(),
    })

    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/success?bookingId=${bookingId}&txnId=${payuResponse.txnid}`)
  } catch (err) {
    console.error('[payments/success]', err.message)
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?error=server_error`)
  }
})

/**
 * POST /api/payments/failure
 * PayU redirects here on failed payment
 */
router.post('/failure', async (req, res) => {
  const payuResponse = req.body
  console.error('[PayU Failure]', JSON.stringify(payuResponse))
  const bookingId = payuResponse.udf1 || ''
  res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/failure?bookingId=${bookingId}&error=payment_failed`)
})

/**
 * POST /api/payments/webhook
 * PayU server-to-server notification (optional, for async status updates)
 */
router.post('/webhook', async (req, res) => {
  try {
    const db = getDb()
    const payload = req.body
    console.log('[PayU Webhook]', JSON.stringify(payload))

    const txnId = payload.txnid
    if (!txnId) {
      return res.status(200).send('OK') // Acknowledge even if missing data
    }

    const bookingSnap = await db.collection('bookings').where('txnId', '==', txnId).get()
    if (bookingSnap.empty) {
      console.error('[PayU Webhook] No booking found for txnId:', txnId)
      return res.status(200).send('OK')
    }

    const bookingDoc = bookingSnap.docs[0]
    const status = payload.status === 'success' ? 'upcoming' : 'payment_failed'

    if (status === 'payment_failed' && bookingDoc.data().status === 'pending_payment') {
      // Free the spot if payment failed
      const booking = bookingDoc.data()
      const spotRef = db.collection('spaces').doc(booking.spaceId).collection('spots').doc(booking.spotId)
      await spotRef.update({ currentStatus: 'available', currentBookingId: null })
    }

    await bookingDoc.ref.update({
      status,
      paymentId: payload.mihpayid || payload.txnid,
      payuResponse: JSON.stringify(payload),
      updatedAt: new Date().toISOString(),
    })

    res.status(200).send('OK')
  } catch (err) {
    console.error('[payments/webhook]', err.message)
    res.status(200).send('OK') // Always ack PayU
  }
})

export default router