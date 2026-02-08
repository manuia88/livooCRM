"use client";

import { useState } from "react";
import { Property } from "@/types/property";
import { PropertyCard } from "@/components/property-card";
import MapLoader from "@/components/map-loader";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Filter, Map as MapIcon, ChevronDown, Bell, BedDouble, Bath, Car } from "@/components/icons";

interface PropertiesListingProps {
    properties: Property[];
    listingLabel: string; // e.g. "en venta" or "en renta"
    locationLabel: string; // e.g. "CDMX" or "Ciudad de México"
}

const OPTIONS = ["Cualquier", "1+", "2+", "3+", "4+"] as const;
const PRICE_MIN = 0;
const PRICE_MAX = 50_000_000;
const PRICE_STEP = 500_000;

function formatPrice(value: number) {
    if (value <= 0) return "Mínimo";
    return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(value);
}

export function PropertiesListing({
    properties,
    listingLabel,
    locationLabel,
}: PropertiesListingProps) {
    const [showMap, setShowMap] = useState(false);
    const [recamaras, setRecamaras] = useState<string>("Cualquier");
    const [banos, setBanos] = useState<string>("Cualquier");
    const [estacionamientos, setEstacionamientos] = useState<string>("Cualquier");
    const [priceMin, setPriceMin] = useState(PRICE_MIN);
    const [priceMax, setPriceMax] = useState(PRICE_MAX);
    const [belowMarket, setBelowMarket] = useState(false);
    const activeFiltersCount = 0; // can be derived from real filter state later

    return (
        <div className="flex flex-col flex-1 min-h-0">
            {/* Filter bar - estilo referencia */}
            <div className="sticky top-20 z-30 bg-white/95 backdrop-blur-xl border-b border-[#E5E3DB] shadow-sm">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-2 border-[#2C3E2C] bg-[#2C3E2C] text-white hover:bg-[#3F5140] hover:border-[#3F5140] font-semibold px-4 relative"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Filtrar
                                {activeFiltersCount > 0 && (
                                    <span className="ml-2 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-bold">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </Button>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-[#E5E3DB] bg-white text-[#2C3E2C] hover:bg-[#F8F7F4]"
                                    >
                                        Precio <ChevronDown className="w-4 h-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-xl border-[#E5E3DB] p-4 min-w-[320px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                                    <p className="text-sm font-semibold text-[#2C3E2C] mb-3">Precio</p>
                                    <Slider
                                        min={PRICE_MIN}
                                        max={PRICE_MAX}
                                        step={PRICE_STEP}
                                        value={[priceMin, priceMax]}
                                        onValueChange={(values) => {
                                            if (!values?.length) return;
                                            const [a, b] = values.length >= 2 ? [values[0], values[1]] : [values[0], values[0]];
                                            const min = Math.min(a, b);
                                            const max = Math.max(a, b);
                                            setPriceMin(min);
                                            setPriceMax(max);
                                        }}
                                        className="mb-4"
                                    />
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={priceMin === PRICE_MIN ? "" : formatPrice(priceMin)}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, "");
                                                    if (v === "") setPriceMin(PRICE_MIN);
                                                    else setPriceMin(Math.min(Number(v), priceMax));
                                                }}
                                                placeholder="Precio mínimo"
                                                className="w-full px-3 py-2 rounded-lg border border-[#E5E3DB] text-sm text-[#2C3E2C] placeholder:text-[#6B7B6B] focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50"
                                            />
                                            <p className="text-xs text-[#6B7B6B] mt-1">Precio mínimo.</p>
                                        </div>
                                        <div>
                                            <input
                                                type="text"
                                                inputMode="numeric"
                                                value={priceMax === PRICE_MAX ? "" : formatPrice(priceMax)}
                                                onChange={(e) => {
                                                    const v = e.target.value.replace(/\D/g, "");
                                                    if (v === "") setPriceMax(PRICE_MAX);
                                                    else setPriceMax(Math.max(Number(v), priceMin));
                                                }}
                                                placeholder="Precio máximo"
                                                className="w-full px-3 py-2 rounded-lg border border-[#E5E3DB] text-sm text-[#2C3E2C] placeholder:text-[#6B7B6B] focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50"
                                            />
                                            <p className="text-xs text-[#6B7B6B] mt-1">Precio máximo.</p>
                                        </div>
                                    </div>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            checked={belowMarket}
                                            onChange={(e) => setBelowMarket(e.target.checked)}
                                            className="mt-1 rounded border-[#E5E3DB] text-[#2C3E2C] focus:ring-[#B8975A]/50"
                                        />
                                        <span className="text-sm text-[#2C3E2C] group-hover:text-[#3F5140]">
                                            Precio por debajo del valor de mercado.
                                        </span>
                                    </label>
                                    <p className="text-xs text-[#6B7B6B] mt-2">
                                        Propiedades con precios por debajo del valor de mercado.
                                    </p>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-[#E5E3DB] bg-white text-[#2C3E2C] hover:bg-[#F8F7F4]"
                                    >
                                        Características <ChevronDown className="w-4 h-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-xl border-[#E5E3DB] p-4 min-w-[280px]" onCloseAutoFocus={(e) => e.preventDefault()}>
                                    <div className="space-y-4">
                                        <div>
                                            <p className="text-sm font-semibold text-[#2C3E2C] flex items-center gap-2 mb-2">
                                                <BedDouble className="w-4 h-4 text-[#6B7B6B]" />
                                                Recámaras
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setRecamaras(opt)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${recamaras === opt
                                                                ? "border-2 border-[#2C3E2C] bg-[#F8F7F4] text-[#2C3E2C]"
                                                                : "border border-[#E5E3DB] bg-white text-[#6B7B6B] hover:bg-[#F8F7F4]"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#2C3E2C] flex items-center gap-2 mb-2">
                                                <Bath className="w-4 h-4 text-[#6B7B6B]" />
                                                Baños
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setBanos(opt)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${banos === opt
                                                                ? "border-2 border-[#2C3E2C] bg-[#F8F7F4] text-[#2C3E2C]"
                                                                : "border border-[#E5E3DB] bg-white text-[#6B7B6B] hover:bg-[#F8F7F4]"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#2C3E2C] flex items-center gap-2 mb-2">
                                                <Car className="w-4 h-4 text-[#6B7B6B]" />
                                                Estacionamientos
                                            </p>
                                            <div className="flex flex-wrap gap-2">
                                                {OPTIONS.map((opt) => (
                                                    <button
                                                        key={opt}
                                                        type="button"
                                                        onClick={() => setEstacionamientos(opt)}
                                                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${estacionamientos === opt
                                                                ? "border-2 border-[#2C3E2C] bg-[#F8F7F4] text-[#2C3E2C]"
                                                                : "border border-[#E5E3DB] bg-white text-[#6B7B6B] hover:bg-[#F8F7F4]"
                                                            }`}
                                                    >
                                                        {opt}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-[#E5E3DB] bg-white text-[#2C3E2C] hover:bg-[#F8F7F4]"
                                    >
                                        Tipo de propiedad <ChevronDown className="w-4 h-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-xl border-[#E5E3DB]">
                                    <DropdownMenuItem>Todos</DropdownMenuItem>
                                    <DropdownMenuItem>Departamento</DropdownMenuItem>
                                    <DropdownMenuItem>Casa</DropdownMenuItem>
                                    <DropdownMenuItem>Loft</DropdownMenuItem>
                                    <DropdownMenuItem>Cobertura</DropdownMenuItem>
                                    <DropdownMenuItem>Estudio</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-[#E5E3DB] bg-white text-[#2C3E2C] hover:bg-[#F8F7F4]"
                                    >
                                        Colonias <ChevronDown className="w-4 h-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-xl border-[#E5E3DB]">
                                    <div className="p-2 border-b border-[#E5E3DB]">
                                        <p className="text-xs font-semibold text-[#6B7B6B] mb-2">Colonias</p>
                                        <input
                                            type="text"
                                            placeholder="Agregar colonias"
                                            className="w-full px-3 py-2 rounded-lg border border-[#E5E3DB] text-sm placeholder:text-[#6B7B6B] focus:outline-none focus:ring-2 focus:ring-[#B8975A]/50"
                                        />
                                    </div>
                                    <div className="p-2">
                                        <p className="text-xs text-[#6B7B6B] mb-2">Sugerencias</p>
                                        <DropdownMenuItem className="rounded-lg">Condesa</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg">Roma</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg">Polanco</DropdownMenuItem>
                                        <DropdownMenuItem className="rounded-lg">Del Valle</DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="rounded-xl border-[#E5E3DB] bg-white text-[#2C3E2C] hover:bg-[#F8F7F4]"
                                    >
                                        Imágenes <ChevronDown className="w-4 h-4 ml-1" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="start" className="rounded-xl border-[#E5E3DB]">
                                    <DropdownMenuItem>Cualquier cantidad</DropdownMenuItem>
                                    <DropdownMenuItem>Con fotos profesionales</DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-xl border-[#E5E3DB] bg-white text-[#2C3E2C] hover:bg-[#F8F7F4]"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Crear alerta
                            </Button>
                        </div>

                        <Button
                            variant={showMap ? "default" : "outline"}
                            size="sm"
                            onClick={() => setShowMap(!showMap)}
                            className={`rounded-xl font-medium ${showMap
                                    ? "bg-[#2C3E2C] text-white hover:bg-[#3F5140]"
                                    : "border-[#E5E3DB] text-[#2C3E2C] hover:bg-[#F8F7F4]"
                                }`}
                        >
                            <MapIcon className="w-4 h-4 mr-2" />
                            Ver mapa
                        </Button>
                    </div>
                </div>

                {/* Title + count + sort */}
                <div className="container mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#E5E3DB]/60">
                    <p className="text-sm sm:text-base text-[#2C3E2C] font-medium">
                        <span className="font-semibold">{properties.length.toLocaleString()}</span>{" "}
                        propiedades {listingLabel} en {locationLabel}
                    </p>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#6B7B6B] hover:text-[#2C3E2C] font-normal"
                            >
                                Ordenar por: Lo más relevante <ChevronDown className="w-4 h-4 ml-1" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl border-[#E5E3DB]">
                            <DropdownMenuItem>Lo más relevante</DropdownMenuItem>
                            <DropdownMenuItem>Precio: menor a mayor</DropdownMenuItem>
                            <DropdownMenuItem>Precio: mayor a menor</DropdownMenuItem>
                            <DropdownMenuItem>Más recientes</DropdownMenuItem>
                            <DropdownMenuItem>Área: mayor a menor</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Content: grid and optional map */}
            <div className="flex flex-1 min-h-0 bg-gradient-to-b from-[#F8F7F4]/50 to-white">
                <div
                    className={`flex gap-0 ${showMap ? "w-full md:flex-row" : "w-full"}`}
                >
                    <div
                        className={`overflow-y-auto ${showMap
                                ? "w-full md:w-1/2 lg:w-[55%] p-4 md:p-6"
                                : "w-full p-4 md:p-6 container mx-auto"
                            }`}
                    >
                        <div
                            className={`grid gap-6 ${showMap
                                    ? "grid-cols-1 md:grid-cols-2"
                                    : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                                }`}
                        >
                            {properties.map((property) => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    </div>

                    {showMap && (
                        <div className="hidden md:block md:w-1/2 lg:w-[45%] bg-[#F8F7F4] relative h-[calc(100vh-220px)] min-h-[400px] sticky top-[220px] rounded-l-2xl overflow-hidden border-l border-[#E5E3DB] shadow-2xl shadow-[#2C3E2C]/5">
                            <MapLoader properties={properties} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
