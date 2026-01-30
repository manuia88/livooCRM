import { createClient } from "@/utils/supabase/server";
import { Property, PropertyType, ListingType } from "@/types/property";

// Database row type (Supabase returns this structure after joins)
interface PropertyRow {
    id: string;
    title: string;
    description: string | null;
    price: number;
    currency: string;
    type: string;
    listing_type: string;
    address: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    colonia: string | null;
    lat: number | null;
    lng: number | null;
    is_featured: boolean;
    images: string[] | null;
    created_at: string;
    property_features?: {
        bedrooms: number;
        bathrooms: number;
        parking: number;
        area_m2: number;
        has_pool: boolean;
        has_gym: boolean;
        has_security: boolean;
        pet_friendly: boolean;
        furnished: boolean;
    };
    agents?: {
        name: string;
        avatar_url: string;
        whatsapp: string;
        is_verified: boolean;
    };
    commission_shared?: boolean;
    commission_percentage?: number;
    mls_views?: number;
}

// Helper to map DB Row -> Property Type
function mapRowToProperty(row: PropertyRow): Property {
    return {
        id: row.id,
        title: row.title,
        description: row.description || "",
        price: Number(row.price),
        currency: row.currency as 'MXN' | 'USD',
        type: row.type as PropertyType,
        listingType: row.listing_type as ListingType,
        location: {
            address: row.address || "",
            city: row.city || "",
            state: row.state || "",
            zip: row.zip || "",
            colonia: row.colonia || "",
            lat: row.lat ?? undefined,
            lng: row.lng ?? undefined
        },
        features: {
            bedrooms: row.property_features?.bedrooms || 0,
            bathrooms: Number(row.property_features?.bathrooms) || 0,
            parking: row.property_features?.parking || 0,
            area: Number(row.property_features?.area_m2) || 0,
            hasPool: row.property_features?.has_pool,
            hasGym: row.property_features?.has_gym,
            hasSecurity: row.property_features?.has_security,
            petFriendly: row.property_features?.pet_friendly,
            furnished: row.property_features?.furnished
        },
        images: row.images || [],
        agent: {
            name: row.agents?.name || "Unknown",
            avatar: row.agents?.avatar_url || "",
            whatsapp: row.agents?.whatsapp || "",
            verified: row.agents?.is_verified || false
        },
        featured: row.is_featured,
        createdAt: row.created_at,
        commission: {
            shared: row.commission_shared || false,
            percentage: row.commission_percentage ? Number(row.commission_percentage) : undefined
        },
        mls: {
            views: row.mls_views || 0
        }
    };
}

export async function getProperties(): Promise<Property[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_features!inner(*),
            agents!inner(*)
        `);

    if (error) {
        console.error("Error fetching properties:", error);
        return [];
    }

    return data.map(mapRowToProperty);
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_features!inner(*),
            agents!inner(*)
        `)
        .eq('id', id)
        .single();

    if (error || !data) {
        return undefined;
    }

    return mapRowToProperty(data);
}

export async function getFeaturedProperties(): Promise<Property[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_features!inner(*),
            agents!inner(*)
        `)
        .eq('is_featured', true)
        .limit(6);

    if (error) {
        console.error("Error fetching featured:", error);
        return [];
    }

    return data.map(mapRowToProperty);
}

export async function getMlsProperties(): Promise<Property[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('properties')
        .select(`
            *,
            property_features!inner(*),
            agents!inner(*)
        `)
        .eq('commission_shared', true);

    if (error) {
        console.error("Error fetching MLS properties:", error);
        return [];
    }

    return data.map(mapRowToProperty);
}
