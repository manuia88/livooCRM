"use client";

import dynamic from "next/dynamic";
import { Property } from "@/types/property";

const MapComponent = dynamic(() => import("@/components/ui/map-component"), {
    ssr: false,
    loading: () => <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">Cargando Mapa...</div>
});

export default function MapLoader({ properties }: { properties: Property[] }) {
    return <MapComponent properties={properties} />;
}
