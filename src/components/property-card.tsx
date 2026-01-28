"use client";

import { Property } from "@/types/property";
import { MapPin, BedDouble, Bath, Car, Heart } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface PropertyCardProps {
    property: Property;
    className?: string;
}

export function PropertyCard({ property, className }: PropertyCardProps) {
    const { title, price, currency, location, features, images, type, listingType } = property;

    const formatPrice = (amount: number) => {
        return new Intl.NumberFormat('es-MX', {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className={cn("group bg-white rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300", className)}>
            {/* Image Container */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={images[0]}
                    alt={title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <span className="bg-primary/90 text-white text-xs font-semibold px-2 py-1 rounded backdrop-blur-sm uppercase tracking-wide">
                        {listingType === 'buy' ? 'Venta' : 'Renta'}
                    </span>
                    {property.featured && (
                        <span className="bg-accent/90 text-white text-xs font-semibold px-2 py-1 rounded backdrop-blur-sm shadow-sm">
                            Destacado
                        </span>
                    )}
                </div>

                {/* Favorite Button */}
                <button className="absolute top-3 right-3 p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white hover:text-red-500 transition-colors">
                    <Heart className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <p className="text-secondary font-bold text-xl">{formatPrice(price)}</p>
                        <p className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">{type}</p>
                    </div>
                </div>

                <h3 className="font-medium text-foreground text-lg mb-2 line-clamp-1 group-hover:text-accent transition-colors">
                    {title}
                </h3>

                <div className="flex items-center text-muted-foreground text-sm mb-4">
                    <MapPin className="w-4 h-4 mr-1 text-accent" />
                    <span className="truncate">{location.colonia}, {location.city}</span>
                </div>

                <div className="border-t border-border pt-3 flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BedDouble className="w-4 h-4" />
                        <span>{features.bedrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        <span>{features.bathrooms}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Car className="w-4 h-4" />
                        <span>{features.parking}</span>
                    </div>
                    <div className="flex items-center gap-1 font-medium">
                        <span>{features.area} m²</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
