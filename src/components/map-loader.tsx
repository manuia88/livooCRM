"use client";

import dynamic from "next/dynamic";
import { Property } from "@/types/property";

const PropertyMap = dynamic(() => import("@/components/maps/PropertyMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-medium">Cargando Mapa de Propiedades...</div>
});

const SinglePropertyMap = dynamic(() => import("@/components/maps/SinglePropertyMap"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 font-medium">Cargando Ubicación...</div>
});

interface MapLoaderProps {
    properties: Property[];
    single?: boolean;
}

export default function MapLoader({ properties, single = false }: MapLoaderProps) {
    if (single && properties.length > 0) {
        const p = properties[0];
        if (p.location.lat && p.location.lng) {
            return (
                <SinglePropertyMap
                    lat={p.location.lat}
                    lng={p.location.lng}
                    title={p.title}
                    height="100%"
                />
            );
        }
    }

    return <PropertyMap properties={properties} height="100%" />;
}
