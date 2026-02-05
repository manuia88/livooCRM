import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import type { Property } from '@/types/properties';

export async function GET(request: NextRequest) {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;

    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Filters
    const operationType = searchParams.get('operation_type');
    const propertyType = searchParams.get('property_type');
    const minPrice = searchParams.get('min_price');
    const maxPrice = searchParams.get('max_price');
    const bedrooms = searchParams.get('bedrooms');
    const bathrooms = searchParams.get('bathrooms');
    const minHealthScore = searchParams.get('min_health_score');

    // Base query
    let query = supabase
        .from('properties')
        .select('*', { count: 'exact' });

    // Apply filters
    if (operationType && operationType !== 'all') {
        query = query.eq('operation_type', operationType);
    }

    if (propertyType) {
        // Should support multiple types comma-separated if needed
        const types = propertyType.split(',');
        if (types.length > 0) {
            query = query.in('property_type', types);
        }
    }

    if (minPrice) {
        // Check if price is for sale or rent based on operation type
        // If mixed, it's tricky, usually filter on both columns
        query = query.or(`sale_price.gte.${minPrice},rent_price.gte.${minPrice}`);
    }

    if (maxPrice) {
        query = query.or(`sale_price.lte.${maxPrice},rent_price.lte.${maxPrice}`);
    }

    if (bedrooms) {
        query = query.gte('bedrooms', parseInt(bedrooms));
    }

    if (bathrooms) {
        query = query.gte('bathrooms', parseInt(bathrooms));
    }

    if (minHealthScore) {
        query = query.gte('health_score', parseInt(minHealthScore));
    }

    // Sorting (default to newest)
    const sort = searchParams.get('sort') || 'created_at';
    const order = searchParams.get('order') || 'desc';
    query = query.order(sort, { ascending: order === 'asc' });

    // Pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
        data,
        meta: {
            page,
            limit,
            total: count,
            pages: count ? Math.ceil(count / limit) : 0
        }
    });
}

export async function POST(request: NextRequest) {
    const supabase = await createClient();

    try {
        const body = await request.json();

        // Get current user (agent)
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user's profile to get agency_id
        const { data: profile } = await supabase
            .from('user_profiles')
            .select('agency_id, id')
            .eq('id', user.id)
            .single();

        if (!profile) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        // Add metadata
        const propertyData = {
            ...body,
            agency_id: profile.agency_id,
            producer_id: profile.id, // Agent creating it is the producer by default
            // Health score will be calculated by trigger or can be calculated here
        };

        // Special handling for photos if they are base64 (not recommended) 
        // Ideally photos are already uploaded to bucket and we receive URLs

        const { data, error } = await supabase
            .from('properties')
            .insert(propertyData)
            .select()
            .single();

        if (error) {
            console.error('Error creating property:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Geocodificar al guardar (recomendado): si la propiedad se creó sin lat/lng,
        // llamar al geocoding para rellenarlos. Puerta abierta:
        // const hasCoords = body.lat != null && body.lng != null;
        // if (data?.id && !hasCoords && (body.address || body.city)) {
        //   const base = process.env.NEXT_PUBLIC_APP_URL || '';
        //   const res = await fetch(`${base}/api/properties/${data.id}/geocode`, { method: 'POST', headers: { cookie: request.headers.get('cookie') ?? '' } });
        //   if (res.ok) { const { lat, lng } = await res.json(); if (lat != null) await supabase.from('properties').update({ lat, lng }).eq('id', data.id); }
        // }

        return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
        console.error('Error parsing request:', error);
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }
}
