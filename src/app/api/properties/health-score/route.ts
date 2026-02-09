import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const body = await request.json();
    const { property_id } = body;

    if (!property_id) {
        return NextResponse.json({ error: 'property_id is required' }, { status: 400 });
    }

    // Call the database function to get breakdown
    const { data, error } = await supabase
        .rpc('get_property_health_score_breakdown', { p_property_id: property_id });

    if (error) {
        console.error('Error calculating health score:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ breakdown: data });
}
