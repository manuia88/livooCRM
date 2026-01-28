"use client";

import { PropertyCard } from "@/components/property-card";
import { MOCK_PROPERTIES } from "@/data/mock-properties";

export function FeaturedGrid() {
    // Show top 3 featured properties
    const featured = MOCK_PROPERTIES.filter(p => p.featured).slice(0, 3);

    // If not enough featured, fill with others
    const displayProps = featured.length < 3
        ? [...featured, ...MOCK_PROPERTIES.filter(p => !p.featured).slice(0, 3 - featured.length)]
        : featured;

    return (
        <>
            {displayProps.map(property => (
                <PropertyCard key={property.id} property={property} />
            ))}
        </>
    );
}
