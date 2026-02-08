"use client";

import OptimizedImage from "@/components/ui/OptimizedImage";
import Link from "next/link";
import { Property } from "@/types/property";
import { MapPin, BedDouble, Bath, Ruler, Heart, Handshake } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { SharingModal } from "@/features/mls/components/sharing-modal";

interface PropertyCardProps {
    property: Property;
    isMls?: boolean;
}

export function PropertyCard({ property, isMls = false }: PropertyCardProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: property.currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const handleNextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === property.images.length - 1 ? 0 : prev + 1
        );
    };

    const handlePrevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) =>
            prev === 0 ? property.images.length - 1 : prev - 1
        );
    };

    return (
        <div className="group bg-white/95 backdrop-blur-sm rounded-3xl overflow-hidden border border-[#E5E3DB] shadow-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 flex flex-col h-full hover:border-[#B8975A]/50">
            <Link href={isMls ? `/mls/${property.id}` : `/propiedades/${property.id}`}>
                {/* Image Container with carousel */}
                <div className="relative h-56 overflow-hidden bg-[#F8F7F4]">
                    <OptimizedImage
                        src={property.images[currentImageIndex]}
                        alt={property.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Badge - Llegó hace X día */}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xl px-3 py-1.5 rounded-xl shadow-lg border border-[#E5E3DB]/50">
                        <span className="text-xs font-semibold text-[#2C3E2C]">
                            Llegó hace 1 día
                        </span>
                    </div>

                    {/* Featured badge if applicable */}
                    {property.featured && (
                        <div className="absolute top-3 left-3 mt-10 bg-gradient-to-r from-[#B8975A] to-[#C4A872] px-3 py-1 rounded-lg shadow-md">
                            <span className="text-xs font-bold text-white uppercase tracking-wide">
                                Destacado
                            </span>
                        </div>
                    )}

                    {/* Commission Badge */}
                    {property.commission?.shared && (
                        <div className="absolute top-3 right-14 bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-1 rounded-lg shadow-md flex items-center gap-1">
                            <Handshake className="w-3 h-3" />
                            <span className="text-xs font-bold">
                                {property.commission.percentage}%
                            </span>
                        </div>
                    )}

                    {/* Actions: Favorite & Share */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                        <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                            <SharingModal property={property} />
                        </div>

                        <button
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setIsFavorite(!isFavorite);
                            }}
                            className="w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-md border border-[#E5E3DB]"
                        >
                            <Heart
                                className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-[#B85C5C] text-[#B85C5C]' : 'text-[#6B7B6B]'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Image Navigation Dots */}

                    {/* Image Navigation Dots */}
                    {property.images.length > 1 && (
                        <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                            {property.images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`h-1.5 rounded-full transition-all ${index === currentImageIndex
                                        ? 'bg-white w-6'
                                        : 'bg-white/60 hover:bg-white/80 w-1.5'
                                        }`}
                                />
                            ))}
                        </div>
                    )}

                    {/* Navigation arrows */}
                    {property.images.length > 1 && (
                        <>
                            <button
                                onClick={handlePrevImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md border border-[#E5E3DB]"
                            >
                                <span className="text-[#2C3E2C] font-bold">‹</span>
                            </button>
                            <button
                                onClick={handleNextImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-md border border-[#E5E3DB]"
                            >
                                <span className="text-[#2C3E2C] font-bold">›</span>
                            </button>
                        </>
                    )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">
                    {/* Property Type Badge */}
                    <span className="text-xs font-semibold text-[#6B7B6B] uppercase tracking-wide mb-2">
                        {property.type === 'apartment' && 'Departamento'}
                        {property.type === 'house' && 'Casa'}
                        {property.type === 'studio' && 'Estudio'}
                        {property.type === 'loft' && 'Loft'}
                    </span>

                    {/* Price */}
                    <p className="text-2xl font-bold text-[#2C3E2C] mb-2">
                        {formatPrice(property.price)}
                    </p>

                    {/* Location */}
                    <div className="flex items-start gap-1.5 text-sm text-[#6B7B6B] mb-4">
                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-[#B8975A]" />
                        <span className="line-clamp-1">
                            {property.location.colonia}, {property.location.city}
                        </span>
                    </div>

                    {/* Features */}
                    <div className="flex items-center gap-4 text-sm text-[#2C3E2C] mb-4 flex-wrap">
                        <div className="flex items-center gap-1.5">
                            <Ruler className="w-4 h-4 text-[#6B7B6B]" />
                            <span className="font-medium">{property.features.area} m²</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <BedDouble className="w-4 h-4 text-[#6B7B6B]" />
                            <span className="font-medium">{property.features.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Bath className="w-4 h-4 text-[#6B7B6B]" />
                            <span className="font-medium">{property.features.bathrooms}</span>
                        </div>
                    </div>

                    {/* Button - Pushed to bottom */}
                    <div className="mt-auto pt-3 border-t border-[#E5E3DB]">
                        <Button
                            variant="outline"
                            className="w-full rounded-xl border-[#E5E3DB] hover:border-[#B8975A] hover:text-[#B8975A] hover:bg-[#FAF8F3] font-semibold shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={(e) => {
                                e.preventDefault();
                                // Handle contact action
                            }}
                        >
                            Ver contacto
                        </Button>
                    </div>
                </div>
            </Link>
        </div>
    );
}
