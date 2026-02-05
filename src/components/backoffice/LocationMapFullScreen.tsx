'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const CDMX: [number, number] = [19.4326, -99.1332]

// Marcador con SVG en color Livoo para no depender de imágenes externas (evita icono roto)
const LIVOO_GREEN = '#2C3E2C'
function createLivooMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'livoo-marker',
    html: `<svg width="32" height="41" viewBox="0 0 32 41" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 0C7.163 0 0 7.163 0 16c0 12.5 16 25 16 25s16-12.5 16-25C32 7.163 24.837 0 16 0z" fill="${LIVOO_GREEN}"/>
      <circle cx="16" cy="16" r="6" fill="white"/>
    </svg>`,
    iconSize: [32, 41],
    iconAnchor: [16, 41],
  })
}

export interface LocationMapFullScreenProps {
  address: string
  lat: number | null
  lng: number | null
  onAddressChange: (address: string) => void
  onLocationChange: (lat: number, lng: number, address?: string) => void
}

export function LocationMapFullScreen({
  address,
  lat,
  lng,
  onAddressChange,
  onLocationChange,
}: LocationMapFullScreenProps) {
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState(address || '')
  const [isSearching, setIsSearching] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const markerRef = useRef<L.Marker | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const doGeocode = useCallback(
    async (query: string) => {
      if (!query.trim()) return
      setIsSearching(true)
      try {
        const res = await fetch(`/api/geocode?address=${encodeURIComponent(query)}`)
        const data = await res.json()
        if (data?.lat != null && data?.lng != null) {
          const newLat = data.lat
          const newLng = data.lng
          const displayName = data.display_name || query
          onLocationChange(newLat, newLng, displayName)
          onAddressChange(displayName)
          if (markerRef.current) markerRef.current.setLatLng([newLat, newLng])
          if (mapRef.current) mapRef.current.setView([newLat, newLng], 17)
        }
      } finally {
        setIsSearching(false)
      }
    },
    [onLocationChange, onAddressChange]
  )

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    doGeocode(searchQuery)
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !containerRef.current || typeof window === 'undefined') return
    const center: [number, number] = lat != null && lng != null ? [lat, lng] : CDMX
    const map = L.map(containerRef.current).setView(center, lat != null && lng != null ? 17 : 12)
    // Tiles OSM estándar (más fiables que Carto en algunos entornos)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map)

    const marker = L.marker(center, { icon: createLivooMarkerIcon(), draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const pos = marker.getLatLng()
      onLocationChange(pos.lat, pos.lng)
    })

    mapRef.current = map
    markerRef.current = marker
    // Asegurar que los tiles se dibujen tras tener dimensiones reales
    const t = setTimeout(() => { map.invalidateSize() }, 100)
    return () => {
      clearTimeout(t)
      map.remove()
      mapRef.current = null
      markerRef.current = null
    }
  }, [mounted]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (lat == null || lng == null || !markerRef.current || !mapRef.current) return
    markerRef.current.setLatLng([lat, lng])
    mapRef.current.setView([lat, lng], mapRef.current.getZoom())
  }, [lat, lng])

  if (!mounted) {
    return (
      <div className="relative w-full min-h-[70vh] sm:min-h-[80vh] rounded-2xl bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500 text-sm">Cargando mapa…</p>
      </div>
    )
  }

  return (
    <div className="relative w-full min-h-[70vh] sm:min-h-[80vh] rounded-2xl overflow-hidden bg-white border border-[#E5E3DB] shadow-sm">
      <style>{`.livoo-marker.leaflet-marker-icon { background: none !important; border: none !important; }`}</style>
      <form
        onSubmit={handleSearchSubmit}
        className="absolute top-4 left-4 right-4 z-[1000] flex gap-2"
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Ingresa la dirección"
          className="flex-1 h-12 px-4 rounded-xl border border-[#E5E3DB] bg-white text-[#2C3E2C] placeholder:text-[#6B7B6B] shadow-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="h-12 px-5 rounded-xl bg-[#2C3E2C] text-white font-semibold text-sm shadow-lg hover:bg-[#3F5140] disabled:opacity-60"
        >
          {isSearching ? 'Buscando…' : 'Buscar'}
        </button>
      </form>
      <div ref={containerRef} className="absolute inset-0 z-0 w-full h-full min-h-[70vh] sm:min-h-[80vh]" />
    </div>
  )
}
