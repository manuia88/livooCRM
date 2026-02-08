'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
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

interface SinglePropertyMapProps {
    lat: number
    lng: number
    title: string
    height?: string
}

export default function SinglePropertyMap({
    lat,
    lng,
    title,
    height = '400px'
}: SinglePropertyMapProps) {
    return (
        <div style={{ height }}>
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                />

                <Marker position={[lat, lng]}>
                    <Popup>
                        <span className="font-semibold text-[#2C3E2C]">{title}</span>
                    </Popup>
                </Marker>
            </MapContainer>
        </div>
    )
}
