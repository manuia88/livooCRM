// This would ideally use a recommendation engine or collaborative filtering
// For now, we will use a "Content-Based" match matching lead preferences to property attributes.

import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
}

export async function getRecommendationsForLead(leadId: string) {
    // 1. Fetch lead preferences
    // This assumes we have a way to get lead prefs from DB (which we extracted via Profiler)
    // For this mockup, let's assume we have them.

    // mock
    const preferences = {
        budgetMax: 5000000,
        zone: 'Condesa',
        bedrooms: 2
    };

    // 2. Query properties matching these hard filters
    const { data, error } = await getSupabase()
        .from('properties')
        .select('*')
        .lte('price', preferences.budgetMax)
        .eq('zone', preferences.zone)
        .gte('bedrooms', preferences.bedrooms)
        .limit(5);

    if (error) {
        console.error("Error fetching recommendations", error);
        return [];
    }

    return data;
}
