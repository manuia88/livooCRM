'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import Link from 'next/link'

const CDMX_CENTER: [number, number] = [19.4326, -99.1332]

const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
})
L.Marker.prototype.options.icon = defaultIcon

export interface BackofficePropertyForMap {
  id: string
  title?: string
  price?: number
  lat?: number | null
  lng?: number | null
}

interface BackofficePropertiesMapProps {
  properties: BackofficePropertyForMap[]
  onBoundsChange?: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void
}

function MapBoundsReporter({
  onBoundsChange,
}: {
  onBoundsChange: (bounds: { ne: { lat: number; lng: number }; sw: { lat: number; lng: number } }) => void
}) {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds()
      const ne = b.getNorthEast()
      const sw = b.getSouthWest()
      onBoundsChange({
        ne: { lat: ne.lat, lng: ne.lng },
        sw: { lat: sw.lat, lng: sw.lng },
      })
    },
  })
  return null
}

export function BackofficePropertiesMap({ properties, onBoundsChange }: BackofficePropertiesMapProps) {
  const withCoords = properties.filter((p) => p.lat != null && p.lng != null && !Number.isNaN(p.lat) && !Number.isNaN(p.lng))
  const center: [number, number] =
    withCoords.length > 0 ? [withCoords[0].lat!, withCoords[0].lng!] : CDMX_CENTER

  if (typeof window === 'undefined') return null

  return (
    <MapContainer
      center={center}
      zoom={withCoords.length > 0 ? 13 : 10}
      scrollWheelZoom
      style={{ height: '100%', width: '100%' }}
      className="z-0 rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      {onBoundsChange && <MapBoundsReporter onBoundsChange={onBoundsChange} />}
      {withCoords.map((p) => (
        <Marker key={p.id} position={[p.lat!, p.lng!]}>
          <Popup>
            <div className="min-w-[160px]">
              <p className="font-semibold text-sm text-gray-900 truncate">{p.title || 'Sin título'}</p>
              {p.price != null && (
                <p className="text-xs text-gray-600 mt-0.5">
                  {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 }).format(p.price)}
                </p>
              )}
              <Link
                href={`/backoffice/propiedades/${p.id}`}
                className="inline-block mt-2 text-xs font-medium text-gray-900 underline"
              >
                Ver ficha
              </Link>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
