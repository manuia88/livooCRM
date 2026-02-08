'use client'

import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import { Icon, LatLngBounds } from 'leaflet'
import { useEffect } from 'react'
import 'leaflet/dist/leaflet.css'
import Image from 'next/image'
import Link from 'next/link'

// Fix para iconos en Next.js
// @ts-ignore
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface Property {
    id: string
    title: string
    price: number
    currency: string
    listingType: 'rent' | 'buy'
    location: {
        lat?: number
        lng?: number
        colonia?: string
        city?: string
        address?: string
    }
    images: string[]
    features: {
        bedrooms: number
        bathrooms: number
        area: number
    }
}

interface PropertyMapProps {
    properties: Property[]
    center?: [number, number]
    zoom?: number
    height?: string
    onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void
    selectedPropertyId?: string
    onPropertyClick?: (propertyId: string) => void
}

// Componente para ajustar bounds automáticamente
function MapBounds({ properties }: { properties: Property[] }) {
    const map = useMap()

    useEffect(() => {
        if (properties.length === 0) return

        const validCoords = properties
            .filter(p => p.location.lat !== undefined && p.location.lng !== undefined)
            .map(p => [p.location.lat!, p.location.lng!] as [number, number])

        if (validCoords.length === 0) return

        const bounds = new LatLngBounds(validCoords)

        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 15
        })
    }, [properties, map])

    return null
}

// Componente para detectar cambios de bounds
function BoundsDetector({ onBoundsChange }: { onBoundsChange?: (bounds: any) => void }) {
    const map = useMap()

    useEffect(() => {
        if (!onBoundsChange) return

        const handleMoveEnd = () => {
            const bounds = map.getBounds()
            onBoundsChange({
                north: bounds.getNorth(),
                south: bounds.getSouth(),
                east: bounds.getEast(),
                west: bounds.getWest()
            })
        }

        map.on('moveend', handleMoveEnd)

        // Llamar inmediatamente
        handleMoveEnd()

        return () => {
            map.off('moveend', handleMoveEnd)
        }
    }, [map, onBoundsChange])

    return null
}

export default function PropertyMap({
    properties,
    center = [19.4326, -99.1332], // CDMX default
    zoom = 12,
    height = '100%',
    onBoundsChange,
    selectedPropertyId,
    onPropertyClick
}: PropertyMapProps) {
    // Crear iconos personalizados con precio
    const createCustomIcon = (property: Property) => {
        const priceFormatted = new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: property.currency,
            maximumFractionDigits: 0,
            notation: 'compact',
            compactDisplay: 'short'
        }).format(property.price)

        return new Icon({
            iconUrl: `data:image/svg+xml;utf8,${encodeURIComponent(`
        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="30" viewBox="0 0 60 30">
          <rect x="0" y="0" width="60" height="24" rx="12" fill="white" stroke="#2C3E2C" stroke-width="2"/>
          <path d="M30 30 L25 24 L35 24 Z" fill="#2C3E2C"/>
          <text x="30" y="17" font-family="Arial" font-size="12" font-weight="bold" text-anchor="middle" fill="#2C3E2C">${priceFormatted}</text>
        </svg>
      `)}`,
            iconSize: [60, 30],
            iconAnchor: [30, 30],
            popupAnchor: [0, -30]
        })
    }

    return (
        <div style={{ height }}>
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                {/* Ajustar bounds automáticamente */}
                {properties.length > 0 && <MapBounds properties={properties} />}

                {/* Detectar cambios de bounds */}
                {onBoundsChange && <BoundsDetector onBoundsChange={onBoundsChange} />}

                {/* Marcadores de propiedades */}
                {properties.map((property) => (
                    property.location.lat !== undefined && property.location.lng !== undefined && (
                        <Marker
                            key={property.id}
                            position={[property.location.lat, property.location.lng]}
                            icon={createCustomIcon(property)}
                            eventHandlers={{
                                click: () => onPropertyClick?.(property.id)
                            }}
                        >
                            <Popup className="premium-popup">
                                <div className="w-[200px] overflow-hidden">
                                    {property.images && property.images[0] && (
                                        <div className="relative h-24 w-full">
                                            <Image
                                                src={property.images[0]}
                                                alt={property.title}
                                                fill
                                                className="object-cover rounded-t-lg"
                                            />
                                        </div>
                                    )}

                                    <div className="p-2 space-y-1">
                                        <p className="font-bold text-sm text-[#2C3E2C] truncate">{property.title}</p>

                                        <p className="font-bold text-[#B8975A]">
                                            ${property.price.toLocaleString('es-MX')}
                                            {property.listingType === 'rent' && ' /mes'}
                                        </p>

                                        <div className="flex gap-2 text-[10px] text-gray-500">
                                            <span>{property.features.bedrooms} rec</span>
                                            <span>{property.features.bathrooms} baños</span>
                                            <span>{property.features.area} m²</span>
                                        </div>

                                        <p className="text-[10px] text-gray-400 truncate">
                                            {property.location.colonia}, {property.location.city}
                                        </p>

                                        <Link
                                            href={`/propiedades/${property.id}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block mt-2 px-3 py-1.5 bg-[#2C3E2C] text-white text-xs text-center rounded-lg hover:bg-[#3F5140] transition-colors"
                                        >
                                            Ver detalles
                                        </Link>
                                    </div>
                                </div>
                            </Popup>
                        </Marker>
                    )
                ))}
            </MapContainer>
        </div>
    )
}
