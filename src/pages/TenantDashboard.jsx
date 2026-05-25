import { useState, useEffect, useRef } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../../lib/firebase'
import { useAuth } from '../hooks/useAuth'
import { useGoogleMaps } from '../hooks/useGoogleMaps'
import MapView from '../components/MapView'

const STATUS_COLORS = {
  available: { bg: '#DCFCE7', text: '#16A34A', label: 'Available' },
  reserved:  { bg: '#FEF9C3', text: '#CA8A04', label: 'Reserved' },
  occupied:  { bg: '#FEE2E2', text: '#DC2626', label: 'Occupied' },
}

const SAMPLE_SPOTS = [
  { id: 1, name: 'T Nagar Secure Parking', area: 'T Nagar, Chennai', price: 50, status: 'available', availableSpots: 4, totalSpots: 14, amenities: ['CCTV', 'Security Guard', 'Gated Entry'], rating: 4.8, location: { lat: 13.0418, lng: 80.2341 }, image: '🏢' },
  { id: 2, name: 'Anna Nagar Covered Lot', area: 'Anna Nagar, Chennai', price: 65, status: 'available', availableSpots: 2, totalSpots: 10, amenities: ['Covered', 'CCTV', 'EV Charging'], rating: 4.9, location: { lat: 13.0850, lng: 80.2101 }, image: '🏬' },
  { id: 3, name: 'Adyar Open Space', area: 'Adyar, Chennai', price: 40, status: 'available', availableSpots: 13, totalSpots: 22, amenities: ['Lighting', 'CCTV', 'Nearby Washroom'], rating: 4.4, location: { lat: 13.0063, lng: 80.2574 }, image: '🏪' },
  { id: 4, name: 'Nungambakkam Premium', area: 'Nungambakkam, Chennai', price: 90, status: 'occupied', availableSpots: 1, totalSpots: 8, amenities: ['Covered', 'Security', 'EV Charging'], rating: 5.0, location: { lat: 13.0569, lng: 80.2425 }, image: '🏙️' },
  { id: 5, name: 'Velachery IT Park', area: 'Velachery, Chennai', price: 45, status: 'available', availableSpots: 20, totalSpots: 35, amenities: ['CCTV', 'Open Air', 'Lighting'], rating: 4.3, location: { lat: 12.9815, lng: 80.2180 }, image: '🏗️' },
  { id: 6, name: 'OMR Tech Corridor', area: 'OMR, Chennai', price: 55, status: 'occupied', availableSpots: 9, totalSpots: 18, amenities: ['CCTV', '24/7 Access', 'Security Guard'], rating: 4.7, location: { lat: 12.8958, lng: 80.2271 }, image: '🏢' },
  { id: 7, name: 'Thoraipakkam Parking Hub', area: 'Thoraipakkam, Chennai', price: 35, status: 'reserved', availableSpots: 5, totalSpots: 12, amenities: ['CCTV', 'Lighting'], rating: 4.2, location: { lat: 12.9344, lng: 80.2279 }, image: '🏭' },
  { id: 8, name: 'Mount Road Parking', area: 'Mount Road, Chennai', price: 70, status: 'available', availableSpots: 7, totalSpots: 20, amenities: ['CCTV', 'Covered', 'Security'], rating: 4.6, location: { lat: 13.0652, lng: 80.2634 }, image: '🏛️' },
]

export default function TenantDashboard() {
  const { user } = useAuth()
  const [spots, setSpots] = useState(SAMPLE_SPOTS)
  const [selectedSpot, setSelectedSpot] = useState(null)
  const [userLocation, setUserLocation] = useState(null)
  const [typeFilter, setTypeFilter] = useState('all')
  const [maxPrice, setMaxPrice] = useState(100)
  const [query, setQuery] = useState('')
  const [showBooking, setShowBooking] = useState(false)
  const searchRef = useRef(null)
  const { loaded: mapsLoaded } = useGoogleMaps()

  // Try to fetch live spots from Firestore, fallback to sample
  useEffect(() => {
    try {
      const unsub = onSnapshot(collection(db, 'spots'), (snap) => {
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }))
        if (data.length > 0) setSpots(data)
      })
      return () => unsub()
    } catch {
      // Keep sample data
    }
  }, [])

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 }
      )
    }
  }, [])

  // Google Places autocomplete on search
  useEffect(() => {
    if (!mapsLoaded || !searchRef.current) return
    const autocomplete = new window.google.maps.places.Autocomplete(searchRef.current, {
      componentRestrictions: { country: 'in' },
      types: ['geocode', 'establishment'],
    })
    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace()
      if (place?.geometry?.location) {
        setUserLocation({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() })
      }
    })
  }, [mapsLoaded])

  const filtered = spots.filter(s => {
    if (typeFilter !== 'all' && s.status !== typeFilter) return false
    if (s.price > maxPrice) return false
    return true
  })

  const handleBook = (spot) => {
    setSelectedSpot(spot)
    setShowBooking(true)
  }

  return (
    <div style={{ paddingTop: 60, height: 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column' }}>
      {/* Search & filter bar */}
      <div style={{
        background: '#F6FBF8', borderBottom: '1px solid #CEEADB',
        padding: '12px 24px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', zIndex: 10,
      }}>
        <div style={{ flex: 1, minWidth: 240, position: 'relative' }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>📍</span>
          <input ref={searchRef} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search area in Chennai..."
            style={{
              width: '100%', padding: '11px 14px 11px 42px', borderRadius: 10,
              border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#fff',
            }}
            onFocus={e => e.target.style.borderColor = '#16A34A'}
            onBlur={e => e.target.style.borderColor = '#CEEADB'}
          />
        </div>
        <button onClick={() => { navigator.geolocation.getCurrentPosition(p => setUserLocation({ lat: p.coords.latitude, lng: p.coords.longitude })) }}
          style={{
            padding: '10px 16px', borderRadius: 10, border: '1.5px solid #CEEADB',
            background: userLocation ? '#0D948820' : 'transparent',
            color: userLocation ? '#0D9488' : '#436B53',
            fontSize: 13, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}>
          📍 Near Me
        </button>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{
            padding: '10px 14px', borderRadius: 10, border: '1.5px solid #CEEADB',
            background: '#fff', fontSize: 13, outline: 'none', cursor: 'pointer',
          }}>
          <option value="all">All Status</option>
          <option value="available">🟢 Available</option>
          <option value="reserved">🟡 Reserved</option>
          <option value="occupied">🔴 Occupied</option>
        </select>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: '#436B53', whiteSpace: 'nowrap' }}>Max ₹{maxPrice}</span>
          <input type="range" min={20} max={200} value={maxPrice} onChange={e => setMaxPrice(+e.target.value)}
            style={{ accentColor: '#16A34A', width: 100 }} />
        </div>
      </div>

      {/* Map + List */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '380px 1fr', overflow: 'hidden' }}>
        {/* List panel */}
        <div style={{ overflow: 'auto', padding: '16px', borderRight: '1px solid #CEEADB', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 14 }}>
              {filtered.length} spot{filtered.length !== 1 ? 's' : ''} found
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#16A34A', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#EAB308', display: 'inline-block' }} />
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626', display: 'inline-block' }} />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(spot => {
              const sc = STATUS_COLORS[spot.status] || STATUS_COLORS.available
              return (
                <div key={spot.id}
                  onClick={() => { setSelectedSpot(spot); setShowBooking(false) }}
                  style={{
                    background: selectedSpot?.id === spot.id ? '#F6FBF8' : '#fff',
                    border: `1.5px solid ${selectedSpot?.id === spot.id ? '#16A34A66' : '#CEEADB'}`,
                    borderRadius: 14, padding: 14, cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: 12,
                      background: '#16A34A18', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 26, flexShrink: 0,
                    }}>{spot.image || '🅿️'}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 13, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {spot.name}
                      </div>
                      <div style={{ fontSize: 12, color: '#436B53', marginBottom: 6 }}>📍 {spot.area}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 15, color: '#16A34A' }}>
                          ₹{spot.price}<span style={{ fontWeight: 400, fontSize: 11 }}>/hr</span>
                        </span>
                        <span style={{
                          fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 4,
                          background: sc.bg, color: sc.text,
                        }}>
                          {sc.label}
                        </span>
                        <span style={{ fontSize: 11, color: '#7EA88E' }}>
                          {spot.availableSpots}/{spot.totalSpots}
                        </span>
                      </div>
                    </div>
                    <div style={{ fontSize: 11, color: '#EAB308' }}>
                      {'★'.repeat(Math.round(spot.rating || 4))}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Map */}
        <div style={{ position: 'relative' }}>
          <MapView
            spots={filtered}
            selectedSpot={selectedSpot}
            onSpotClick={setSelectedSpot}
            userLocation={userLocation}
          />
          {/* Legend */}
          <div style={{
            position: 'absolute', bottom: 20, left: 20,
            background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
            border: '1px solid #CEEADB', borderRadius: 10, padding: '10px 14px',
            fontSize: 12, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', zIndex: 5,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#16A34A' }} /> Available
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#EAB308' }} /> Reserved
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#DC2626' }} /> Occupied
            </div>
          </div>
        </div>
      </div>

      {/* Booking modal */}
      {showBooking && selectedSpot && selectedSpot.status === 'available' && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowBooking(false)}>
          <div className="fade-up" style={{
            background: '#fff', borderRadius: 24, padding: 32, maxWidth: 440, width: '90%',
            boxShadow: '0 24px 80px rgba(0,0,0,0.2)',
          }} onClick={e => e.stopPropagation()}>
            <BookingForm spot={selectedSpot} user={user} onClose={() => setShowBooking(false)} />
          </div>
        </div>
      )}
    </div>
  )
}

// ── Booking form with PayU redirect ──
function BookingForm({ spot, user, onClose }) {
  const [hours, setHours] = useState(2)
  const [vehicleType, setVehicleType] = useState('4-wheeler')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [processing, setProcessing] = useState(false)

  const subtotal = spot.price * hours
  const commission = Math.round(subtotal * 0.12)
  const total = subtotal + commission

  const handlePay = async () => {
    setProcessing(true)
    try {
      // Call backend to get PayU hash
      const payload = {
        txnid: 'PKE-' + Date.now(),
        amount: total.toString(),
        productinfo: `${spot.name} - ${hours}h parking`,
        firstname: user?.displayName || 'Guest',
        email: user?.email || 'guest@parkease.in',
        phone: user?.phoneNumber || '',
        udf1: user?.uid || '',
        udf2: spot.id.toString(),
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/payments/hash`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!data.hash) throw new Error('No hash returned')

      // Create hidden form and auto-submit to PayU
      const form = document.createElement('form')
      form.method = 'POST'
      form.action = data.action || 'https://secure.payu.in/_payment'
      form.style.display = 'none'

      const fields = ['key', 'txnid', 'amount', 'productinfo', 'firstname', 'email', 'phone', 'udf1', 'udf2', 'hash', 'surl', 'furl']
      fields.forEach(f => {
        const input = document.createElement('input')
        input.type = 'hidden'
        input.name = f
        input.value = data[f] || payload[f] || ''
        form.appendChild(input)
      })

      document.body.appendChild(form)
      form.submit()
    } catch (err) {
      alert('Payment initiation failed. Please try again.')
      console.error('[PayU]', err)
      setProcessing(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 20 }}>Book This Spot</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#436B53', lineHeight: 1 }}>✕</button>
      </div>

      <div style={{
        background: '#F6FBF8', borderRadius: 12, padding: 16, marginBottom: 20,
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <div style={{ fontSize: 32 }}>{spot.image || '🅿️'}</div>
        <div>
          <div style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 700, fontSize: 15 }}>{spot.name}</div>
          <div style={{ fontSize: 13, color: '#436B53' }}>{spot.area}</div>
          <div style={{ fontSize: 12, color: '#7EA88E', marginTop: 2 }}>₹{spot.price}/hr</div>
        </div>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>VEHICLE</label>
        <select value={vehicleType} onChange={e => setVehicleType(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 10,
            border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8',
          }}>
          <option value="2-wheeler">🛵 2-Wheeler</option>
          <option value="3-wheeler">🛺 3-Wheeler</option>
          <option value="4-wheeler">🚗 4-Wheeler</option>
        </select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>DATE</label>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 10,
            border: '1.5px solid #CEEADB', fontSize: 14, outline: 'none', background: '#F6FBF8',
          }} />
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 12, color: '#436B53', fontWeight: 600, display: 'block', marginBottom: 6 }}>
          DURATION: {hours} hour{hours > 1 ? 's' : ''}
        </label>
        <input type="range" min={1} max={12} value={hours} onChange={e => setHours(+e.target.value)}
          style={{ width: '100%', accentColor: '#16A34A' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#7EA88E', marginTop: 2 }}>
          <span>1h</span><span>12h</span>
        </div>
      </div>

      <div style={{
        background: '#F6FBF8', borderRadius: 12, padding: 16, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#436B53', marginBottom: 6 }}>
          <span>Parking fee</span><span>₹{subtotal}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#436B53', marginBottom: 6 }}>
          <span>Service charge (12%)</span><span>₹{commission}</span>
        </div>
        <div style={{ height: 1, background: '#CEEADB', margin: '8px 0' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: "'Plus Jakarta Sans', sans-serif", fontWeight: 800, fontSize: 18 }}>
          <span>Total</span><span style={{ color: '#16A34A' }}>₹{total}</span>
        </div>
      </div>

      <button onClick={handlePay} disabled={processing}
        style={{
          width: '100%', padding: '14px', borderRadius: 12, border: 'none',
          background: processing ? '#7EA88E' : '#16A34A', color: '#fff',
          fontSize: 15, fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 4px 16px #16A34A44',
        }}>
        {processing ? '⏳ Connecting to PayU...' : `Pay ₹${total} via PayU →`}
      </button>
      <p style={{ textAlign: 'center', fontSize: 11, color: '#7EA88E', marginTop: 8 }}>
        🔐 Secured by PayU • UPI • Cards • Net Banking
      </p>
    </div>
  )
}
