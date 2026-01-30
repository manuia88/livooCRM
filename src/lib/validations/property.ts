import { z } from 'zod';

export const propertyAddressSchema = z.object({
    street: z.string().optional(),
    exterior_number: z.string().optional(),
    interior_number: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postal_code: z.string().optional(),
    country: z.string().default('México'),
    formatted_address: z.string().optional(),
    place_id: z.string().optional(),
});

export const coordinatesSchema = z.object({
    lat: z.number(),
    lng: z.number(),
});

export const propertySchema = z.object({
    // Basic Info
    title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(150, 'El título es muy largo'),
    description: z.string().optional(),
    property_type: z.enum([
        'house', 'apartment', 'condo', 'townhouse', 'land', 'commercial',
        'office', 'warehouse', 'building', 'farm', 'development'
    ]),
    operation_type: z.enum(['sale', 'rent', 'both']),
    status: z.enum(['draft', 'active', 'reserved', 'sold', 'rented', 'suspended', 'archived']).default('draft'),

    // Location
    address: propertyAddressSchema,
    coordinates: coordinatesSchema.optional(),
    show_exact_location: z.boolean().default(false),

    // Characteristics
    bedrooms: z.number().min(0).optional(),
    bathrooms: z.number().min(0).optional(),
    half_bathrooms: z.number().min(0).optional(),
    parking_spaces: z.number().min(0).optional(),
    construction_m2: z.number().min(0).optional(),
    land_m2: z.number().min(0).optional(),
    total_m2: z.number().min(0).optional(),
    floors: z.number().min(0).optional(),
    floor_number: z.number().optional(),
    year_built: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
    condition: z.enum(['new', 'excellent', 'good', 'needs_repair', 'under_construction']).optional(),

    // Pricing
    sale_price: z.number().min(0).optional(),
    rent_price: z.number().min(0).optional(),
    currency: z.enum(['MXN', 'USD']).default('MXN'),
    maintenance_fee: z.number().min(0).optional(),
    property_tax: z.number().min(0).optional(),

    // Features
    amenities: z.array(z.string()).default([]),
    features: z.record(z.string(), z.any()).default({}),

    // MLS & Sharing
    shared_in_mls: z.boolean().default(false),
    commission_shared: z.boolean().default(false),
    commission_percentage: z.number().min(0).max(100).optional(),
    commission_amount: z.number().min(0).optional(),
    is_exclusive: z.boolean().default(false),

    // Multimedia
    photos: z.array(z.any()).default([]),
    videos: z.array(z.any()).default([]),
    virtual_tour_url: z.string().url().optional().or(z.literal('')),
    floor_plan_url: z.string().url().optional().or(z.literal('')),

    // Owner
    owner_id: z.string().optional(),
});

export type PropertyFormValues = z.infer<typeof propertySchema>;
