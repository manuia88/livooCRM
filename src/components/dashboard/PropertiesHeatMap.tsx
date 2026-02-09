'use client'

import { useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'

interface PropertyLocation {
  id: string
  title: string
  lat: number
  lng: number
  status: string
  price: number | null
}

const STATUS_COLORS: Record<string, string> = {
  disponible: '#3b82f6',
  active: '#3b82f6',
  apartado: '#f59e0b',
  sold: '#10b981',
  vendida: '#10b981',
  rented: '#8b5cf6',
  rentada: '#8b5cf6',
  inactive: '#6b7280',
  draft: '#9ca3af',
}

export default function PropertiesHeatMap() {
  const supabase = createClient()
  const { data: currentUser } = useCurrentUser()
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [mapReady, setMapReady] = useState(false)

  const { data: locations, isLoading } = useQuery<PropertyLocation[]>({
    queryKey: ['properties-locations', currentUser?.agency_id],
    queryFn: async () => {
      if (!currentUser) return []

      const { data: properties } = await supabase
        .from('properties')
        .select('id, title, coordinates, status, sale_price, rent_price')
        .eq('agency_id', currentUser.agency_id)
        .is('deleted_at', null)
        .not('coordinates', 'is', null)
        .limit(500)

      if (!properties) return []

      return properties
        .map((p) => {
          let lat: number | null = null
          let lng: number | null = null

          if (p.coordinates) {
            // Handle GeoJSON Point format or raw {lat, lng}
            if (typeof p.coordinates === 'object') {
              if (p.coordinates.coordinates) {
                // GeoJSON: {type: "Point", coordinates: [lng, lat]}
                lng = p.coordinates.coordinates[0]
                lat = p.coordinates.coordinates[1]
              } else if (p.coordinates.lat !== undefined) {
                lat = p.coordinates.lat
                lng = p.coordinates.lng
              }
            }
          }

          if (lat === null || lng === null || isNaN(lat) || isNaN(lng)) return null

          return {
            id: p.id,
            title: p.title || 'Sin título',
            lat,
            lng,
            status: p.status || 'draft',
            price: p.sale_price || p.rent_price || null,
          }
        })
        .filter((p): p is PropertyLocation => p !== null)
    },
    enabled: !!currentUser,
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Dynamic import of Leaflet to avoid SSR issues
    const initMap = async () => {
      const L = (await import('leaflet')).default
      await import('leaflet/dist/leaflet.css')

      const map = L.map(mapRef.current!, {
        center: [19.4326, -99.1332], // Mexico City default
        zoom: 11,
        zoomControl: true,
        scrollWheelZoom: false,
      })

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
        maxZoom: 18,
      }).addTo(map)

      mapInstanceRef.current = map
      setMapReady(true)
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        setMapReady(false)
      }
    }
  }, [])

  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current || !locations || locations.length === 0) return

    const loadMarkers = async () => {
      const L = (await import('leaflet')).default

      // Clear existing layers except tile layer
      mapInstanceRef.current.eachLayer((layer: any) => {
        if (layer instanceof L.Marker || layer instanceof L.CircleMarker) {
          layer.remove()
        }
      })

      const bounds = L.latLngBounds([])

      locations.forEach((loc) => {
        const color = STATUS_COLORS[loc.status] || '#6b7280'

        const marker = L.circleMarker([loc.lat, loc.lng], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8,
        }).addTo(mapInstanceRef.current)

        const priceStr = loc.price
          ? `$${(loc.price / 1000000).toFixed(1)}M`
          : 'Sin precio'

        marker.bindPopup(
          `<div style="font-family: system-ui; min-width: 150px;">
            <p style="font-weight: 600; margin: 0 0 4px 0; font-size: 13px;">${loc.title}</p>
            <p style="color: #6b7280; margin: 0; font-size: 12px;">${priceStr}</p>
          </div>`
        )

        bounds.extend([loc.lat, loc.lng])
      })

      if (bounds.isValid()) {
        mapInstanceRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 })
      }
    }

    loadMarkers()
  }, [mapReady, locations])

  if (isLoading) {
    return <div className="h-96 bg-gray-100 animate-pulse rounded-lg" />
  }

  if (!locations || locations.length === 0) {
    return (
      <div className="h-96 flex flex-col items-center justify-center text-gray-400 text-sm gap-2">
        <p>Sin propiedades con coordenadas disponibles</p>
        <p className="text-xs">Las propiedades necesitan coordenadas para aparecer en el mapa</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div ref={mapRef} className="h-96 rounded-lg overflow-hidden border border-gray-200" />

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        {[
          { label: 'Disponible', color: '#3b82f6' },
          { label: 'Apartada', color: '#f59e0b' },
          { label: 'Vendida', color: '#10b981' },
          { label: 'Rentada', color: '#8b5cf6' },
          { label: 'Inactiva', color: '#6b7280' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: item.color }}
            />
            <span>{item.label}</span>
          </div>
        ))}
        <span className="ml-auto text-gray-400">
          {locations.length} propiedad{locations.length !== 1 ? 'es' : ''}
        </span>
      </div>
    </div>
  )
}
