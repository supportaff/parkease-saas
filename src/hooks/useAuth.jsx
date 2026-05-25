import { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // Firebase auth user obj
  const [profile, setProfile] = useState(null) // Firestore user doc
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser)
        // Fetch Firestore profile for role
        try {
          const snap = await getDoc(doc(db, 'users', firebaseUser.uid))
          if (snap.exists()) {
            setProfile(snap.data())
          } else {
            setProfile(null) // New user, needs role selection
          }
        } catch {
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const createProfile = async (role, extra = {}) => {
    if (!user) return
    const data = {
      uid: user.uid,
      email: user.email,
      name: user.displayName || extra.name || 'User',
      phone: user.phoneNumber || extra.phone || '',
      role,
      avatar: user.photoURL || '',
      createdAt: new Date().toISOString(),
      ...extra,
    }
    await setDoc(doc(db, 'users', user.uid), data)
    setProfile(data)
    return data
  }

  const logout = () => signOut(auth)

  return (
    <AuthContext.Provider value={{ user, profile, loading, createProfile, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
