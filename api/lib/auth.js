import { getAuth } from './firebase.js'

/**
 * Middleware: Verify Firebase ID token and attach user to req
 */
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const auth = getAuth()
    const decoded = await auth.verifyIdToken(token)
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'tenant',
      phone: decoded.phone_number,
      name: decoded.name,
    }
    next()
  } catch (err) {
    console.error('[auth] Token verification failed:', err.message)
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

/**
 * Middleware: Restrict to specific roles
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' })
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` })
    }
    next()
  }
}

/**
 * Middleware: Optional auth — doesn't fail if no token, but attaches user if present
 */
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    req.user = null
    return next()
  }

  const token = authHeader.split('Bearer ')[1]
  try {
    const auth = getAuth()
    const decoded = await auth.verifyIdToken(token)
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      role: decoded.role || 'tenant',
    }
  } catch {
    req.user = null
  }
  next()
}