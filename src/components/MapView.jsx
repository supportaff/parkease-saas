import { useRef, useEffect, useState } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'

const MAP_STYLES = [
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
  { featureType: 'water', stylers: [{ color: '#C8E8F5' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#E2F5E9' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#FEF3C7' }] },
  { featureType: 'road.local', elementType: 'geometry', stylers: [{ color: '#F7F7F7' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#F8FAF9' }] },
]

function getMarkerColor(status) {
  switch (status) {
    case 'available': return { fill: '#16A34A', label: '₹' }
    case 'reserved':  return { fill: '#EAB308', label: '📅' }
    case 'occupied':  return { fill: '#DC2626', label: '🚗' }
    default:          return { fill: '#9CA3AF', label: '⚫' }
  }
}

export default function MapView({ spots = [], onSpotClick, selectedSpot, userLocation }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef({})
  const infoWindowRef = useRef(null)
  const { loaded: mapsLoaded, apiKeySet } = useGoogleMaps()

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current || mapInstanceRef.current) return
    const map = new window.google.maps.Map(mapRef.current, {
      center: { lat: 13.0827, lng: 80.2707 },
      zoom: 12,
      styles: MAP_STYLES,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      gestureHandling: 'greedy',
    })
    mapInstanceRef.current = map
    infoWindowRef.current = new window.google.maps.InfoWindow()
  }, [mapsLoaded])

  // Place/update markers when spots change
  useEffect(() => {
    if (!mapInstanceRef.current || !mapsLoaded) return
    const map = mapInstanceRef.current

    // Clear old markers
    Object.values(markersRef.current).forEach(m => m.setMap(null))
    markersRef.current = {}

    spots.forEach(spot => {
      if (!spot.location?.lat || !spot.location?.lng) return
      const pos = { lat: spot.location.lat, lng: spot.location.lng }
      const colors = getMarkerColor(spot.status || 'available')
      const isSelected = selectedSpot?.id === spot.id

      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: spot.name || spot.label,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          fillColor: colors.fill,
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2.5,
          scale: isSelected ? 16 : 12,
        },
        label: {
          text: isSelected ? '📍' : `${spot.price || ''}`,
          color: '#ffffff',
          fontWeight: '700',
          fontSize: '11px',
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        },
        zIndex: isSelected ? 100 : 10,
      })

      marker.addListener('click', () => {
        if (onSpotClick) onSpotClick(spot)
        infoWindowRef.current.setContent(`
          <div style="font-family:'Plus Jakarta Sans',sans-serif;padding:8px;min-width:200px;">
            <div style="font-weight:800;font-size:15px;color:#0A1F14;margin-bottom:4px;">
              ${spot.name || spot.label || 'Parking Spot'}
            </div>
            <div style="font-size:12px;color:#436B53;margin-bottom:8px;">
              📍 ${spot.address || spot.area || 'Chennai'}
            </div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-weight:800;font-size:18px;color:#16A34A;">
                ₹${spot.price || 40}/hr
              </span>
              <span style="font-size:12px;color:${spot.availableSpots > 0 ? '#16A34A' : '#DC2626'};font-weight:700;
                background:${spot.availableSpots > 0 ? '#DCFCE7' : '#FEE2E2'};padding:2px 8px;border-radius:4px;">
                ${spot.availableSpots || 0} slots
              </span>
            </div>
          </div>
        `)
        infoWindowRef.current.open(map, marker)
      })

      markersRef.current[spot.id] = marker
    })
  }, [spots, mapsLoaded, selectedSpot])

  // User location marker
  useEffect(() => {
    if (!mapInstanceRef.current || !userLocation || !mapsLoaded) return
    const map = mapInstanceRef.current
    const marker = new window.google.maps.Marker({
      position: userLocation,
      map,
      title: 'You are here',
      icon: {
        path: window.google.maps.SymbolPath.CIRCLE,
        fillColor: '#0EA5E9',
        fillOpacity: 1,
        strokeColor: '#ffffff',
        strokeWeight: 3,
        scale: 9,
      },
      zIndex: 999,
    })
    map.panTo(userLocation)
    map.setZoom(14)
    return () => marker.setMap(null)
  }, [userLocation, mapsLoaded])

  if (!apiKeySet) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#F0FAF4', gap: 12 }}>
        <div style={{ fontSize: 36 }}>🗺️</div>
        <div style={{ color: '#436B53', fontSize: 14, textAlign: 'center', maxWidth: 260 }}>
          Map not configured.<br />
          Add <code style={{ background: '#F6FBF8', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>VITE_GOOGLE_MAPS_API_KEY</code> to .env
        </div>
      </div>
    )
  }

  if (!mapsLoaded) {
    return (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F0FAF4', gap: 12 }}>
        <div style={{ width: 44, height: 44, borderRadius: '50%', border: '2px solid #16A34A44', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🗺️</div>
        <span style={{ color: '#436B53', fontSize: 14 }}>Loading Chennai map...</span>
      </div>
    )
  }

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
}
