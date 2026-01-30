export type PropertyType =
    | 'house'
    | 'apartment'
    | 'condo'
    | 'townhouse'
    | 'land'
    | 'commercial'
    | 'office'
    | 'warehouse'
    | 'building'
    | 'farm'
    | 'development';

export type OperationType = 'sale' | 'rent' | 'both';

export type PropertyStatus =
    | 'draft'
    | 'active'
    | 'reserved'
    | 'sold'
    | 'rented'
    | 'suspended'
    | 'archived';

export type Currency = 'MXN' | 'USD';

export interface PropertyAddress {
    street?: string;
    exterior_number?: string;
    interior_number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    // Google Maps specific
    formatted_address?: string;
    place_id?: string;
}

export interface Coordinates {
    lat: number;
    lng: number;
}

export interface PropertyImage {
    id: string; // generated client-side for temp or server-side for persisted
    url: string;
    file?: File; // Only present during upload
}

export interface Property {
    id: string;
    agency_id: string;
    producer_id?: string;
    seller_id?: string;
    owner_id?: string;

    // Basic Info
    title: string;
    description?: string;
    property_type: PropertyType;
    operation_type: OperationType;
    status: PropertyStatus;

    // Location
    address: PropertyAddress;
    coordinates?: Coordinates;
    show_exact_location: boolean;

    // Characteristics
    bedrooms?: number;
    bathrooms?: number;
    half_bathrooms?: number;
    parking_spaces?: number;
    construction_m2?: number;
    land_m2?: number;
    total_m2?: number;
    floors?: number;
    floor_number?: number;
    year_built?: number;
    condition?: 'new' | 'excellent' | 'good' | 'needs_repair' | 'under_construction';

    // Pricing
    sale_price?: number;
    rent_price?: number;
    currency: Currency;
    maintenance_fee?: number;
    property_tax?: number;

    // Features & Amenities
    amenities: string[];
    features: Record<string, any>;

    // MLS & Sharing
    shared_in_mls: boolean;
    mls_id?: string;
    commission_shared: boolean;
    commission_percentage?: number;
    commission_amount?: number;
    is_exclusive: boolean;
    exclusivity_expires_at?: string;

    // Health Score
    health_score: number;

    // Multimedia
    photos: string[]; // persisted as string array
    videos: string[];
    virtual_tour_url?: string;
    floor_plan_url?: string;

    // Analytics
    views_count: number;
    favorites_count: number;
    inquiries_count: number;

    // SEO
    slug?: string;
    meta_title?: string;
    meta_description?: string;

    // Timestamps
    published_at?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

// For the form, we might need a partial or slightly different structure
export interface PropertyFormData extends Omit<Property, 'id' | 'agency_id' | 'created_at' | 'updated_at' | 'deleted_at' | 'health_score' | 'views_count' | 'favorites_count' | 'inquiries_count' | 'slug' | 'photos'> {
    id?: string; // Optional for new properties
    photos: PropertyImage[]; // Handle File objects
}
