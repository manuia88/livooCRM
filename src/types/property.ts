export type PropertyType = 'apartment' | 'house' | 'loft' | 'penthouse';
export type ListingType = 'rent' | 'buy';

export interface Location {
    address: string;
    city: string;
    state: string;
    zip: string;
    lat?: number;
    lng?: number;
    colonia?: string; // Neighborhood (important in Mexico)
}

export interface Features {
    bedrooms: number;
    bathrooms: number;
    parking: number;
    area: number; // m2
    hasPool?: boolean;
    hasGym?: boolean;
    hasSecurity?: boolean;
    petFriendly?: boolean;
    furnished?: boolean;
}

export interface Agent {
    name: string;
    avatar: string; // URL
    whatsapp: string;
    verified: boolean;
}

export interface Property {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: 'MXN' | 'USD';
    type: PropertyType;
    listingType: ListingType;
    location: Location;
    features: Features;
    images: string[];
    agent: Agent;
    featured?: boolean;
    createdAt: string;
}
