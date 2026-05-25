import admin from 'firebase-admin'

let db, auth

export function initFirebase() {
  if (db && auth) return { db, auth }

  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
    ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
    : undefined

  const projectId = process.env.FIREBASE_PROJECT_ID || 'parkease'

  if (!admin.apps.length) {
    if (serviceAccount) {
      admin.initializeApp({ credential: admin.credential.cert(serviceAccount) })
    } else {
      admin.initializeApp({ projectId })
    }
  }

  db = admin.firestore()
  auth = admin.auth()
  return { db, auth }
}

export function getDb() {
  if (!db) initFirebase()
  return db
}

export function getAuth() {
  if (!auth) initFirebase()
  return auth
}

export default admin