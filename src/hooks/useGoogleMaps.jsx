import { useState, useEffect } from 'react'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

let scriptState = 'idle'
const listeners = []

export function useGoogleMaps() {
  const [loaded, setLoaded] = useState(scriptState === 'loaded')

  useEffect(() => {
    if (scriptState === 'loaded') {
      setLoaded(true)
      return
    }
    if (!API_KEY) {
      console.warn('[ParkEase] VITE_GOOGLE_MAPS_API_KEY is not set.')
      return
    }

    const notify = () => setLoaded(true)
    listeners.push(notify)

    if (scriptState === 'idle') {
      scriptState = 'loading'
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places,geometry&callback=__parkeaseMapsCallback`
      script.async = true
      script.defer = true
      window.__parkeaseMapsCallback = () => {
        scriptState = 'loaded'
        listeners.forEach(fn => fn())
        listeners.length = 0
      }
      document.head.appendChild(script)
    }

    return () => {
      const idx = listeners.indexOf(notify)
      if (idx > -1) listeners.splice(idx, 1)
    }
  }, [])

  return { loaded, apiKeySet: !!API_KEY }
}
