"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Property } from "@/types/property";
import L from "leaflet";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// Fix Leaflet default icon issue in Next.js
const iconUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png';
const iconRetinaUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png';
const shadowUrl = 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl,
    iconRetinaUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom DivIcon for Price Markers (Premium feel)
const createPriceIcon = (price: number, currency: string) => {
    const formattedPrice = new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
        compactDisplay: "short",
        notation: "compact"
    }).format(price);

    return L.divIcon({
        className: 'custom-map-marker',
        html: `<div style="background-color: white; color: #0F172A; padding: 4px 8px; border-radius: 12px; font-weight: bold; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); font-size: 12px; white-space: nowrap;">
                 ${formattedPrice}
               </div>`,
        iconSize: [60, 30],
        iconAnchor: [30, 40] // Anchor near bottom
    });
};

interface MapComponentProps {
    properties: Property[];
}

const CDMX_CENTER: [number, number] = [19.4326, -99.1332]; // Default fallback

export default function MapComponent({ properties }: MapComponentProps) {
    if (typeof window === "undefined") return null;

    // Calculate center based on properties if available, else CDMX default
    const center = properties.length > 0 && properties[0].location.lat && properties[0].location.lng
        ? [properties[0].location.lat, properties[0].location.lng] as [number, number]
        : CDMX_CENTER;

    return (
        <MapContainer
            center={center}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Light theme for "Premium" look
            />

            {properties.map((property) => (
                property.location.lat && property.location.lng && (
                    <Marker
                        key={property.id}
                        position={[property.location.lat, property.location.lng]}
                        icon={createPriceIcon(property.price, property.currency)}
                    >
                        <Popup className="premium-popup">
                            <div className="w-[200px] p-0 overflow-hidden">
                                <div className="relative h-24 w-full">
                                    <Image
                                        src={property.images[0]}
                                        alt={property.title}
                                        fill
                                        className="object-cover rounded-t-lg"
                                    />
                                </div>
                                <div className="p-2">
                                    <p className="font-bold text-sm text-primary truncate">{property.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{property.location.colonia}</p>
                                    <div className="flex justify-between items-center mt-2">
                                        <span className="font-bold text-sm">
                                            {new Intl.NumberFormat('es-MX', { style: 'currency', currency: property.currency, maximumFractionDigits: 0 }).format(property.price)}
                                        </span>
                                        <Link href={`/propiedades/${property.id}`}>
                                            <Button size="sm" variant="outline" className="h-6 text-xs px-2">Ver</Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )
            ))}
        </MapContainer>
    );
}
