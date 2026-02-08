'use client'

import { useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Fix iconos
// @ts-ignore
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

interface LocationPickerProps {
    initialPosition?: [number, number]
    onLocationSelect: (lat: number, lng: number) => void
    height?: string
}

function LocationMarker({
    onLocationSelect,
    initialPosition
}: {
    onLocationSelect: (lat: number, lng: number) => void,
    initialPosition: [number, number] | null
}) {
    const [position, setPosition] = useState<[number, number] | null>(initialPosition)

    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng
            setPosition([lat, lng])
            onLocationSelect(lat, lng)
        },
    })

    return position ? <Marker position={position} draggable={true} eventHandlers={{
        dragend: (e) => {
            const marker = e.target
            const { lat, lng } = marker.getLatLng()
            setPosition([lat, lng])
            onLocationSelect(lat, lng)
        }
    }} /> : null
}

export default function LocationPicker({
    initialPosition = [19.4326, -99.1332], // CDMX default
    onLocationSelect,
    height = '400px'
}: LocationPickerProps) {
    return (
        <div className="space-y-2">
            <p className="text-xs text-gray-500 italic">
                Haz clic en el mapa para seleccionar la ubicación exacta o arrastra el marcador.
            </p>

            <div style={{ height }} className="rounded-lg overflow-hidden border border-gray-200">
                <MapContainer
                    center={initialPosition}
                    zoom={14}
                    scrollWheelZoom={true}
                    style={{ height: '100%', width: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                    />

                    <LocationMarker onLocationSelect={onLocationSelect} initialPosition={initialPosition} />
                </MapContainer>
            </div>
        </div>
    )
}
