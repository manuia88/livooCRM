import { createClient } from '@/utils/supabase/server';
import { MOCK_PROPERTIES } from '@/data/mock-properties';
import { NextResponse, NextRequest } from 'next/server';
import { onlyDevelopment, errorResponse } from '@/lib/auth/middleware';

export const dynamic = 'force-dynamic'

/**
 * Endpoint de Seeding - SOLO DESARROLLO
 * 
 * SEGURIDAD: Este endpoint está restringido a NODE_ENV=development
 * En producción retorna 404 para evitar que alguien lo descubra
 */
export const GET = onlyDevelopment(async (request: NextRequest) => {
    const supabase = await createClient();

    try {
        // 1. Insert Agents (Deduplicated)
        const agentsMap = new Map();
        MOCK_PROPERTIES.forEach(p => {
            if (!agentsMap.has(p.agent.name)) {
                agentsMap.set(p.agent.name, p.agent);
            }
        });

        for (const [, agentData] of agentsMap.entries()) {
            const { error } = await supabase.from('agents').upsert({
                name: agentData.name,
                avatar_url: agentData.avatar,
                whatsapp: agentData.whatsapp,
                is_verified: agentData.verified
            }, { onConflict: 'name' }); // Assuming name is unique for seed simplicity, theoretically should be ID

            if (error) console.error("Error inserting agent:", error);
        }

        // Fetch agents back to get IDs
        const { data: agents } = await supabase.from('agents').select('*');
        if (!agents) return NextResponse.json({ error: "Failed to verify agents" }, { status: 500 });

        // 2. Insert Properties
        for (const p of MOCK_PROPERTIES) {
            // Find agent ID
            const agentId = agents.find((a: { name: string; id: string }) => a.name === p.agent.name)?.id;

            const { data: propData, error: propError } = await supabase.from('properties').insert({
                title: p.title,
                description: p.description,
                price: p.price,
                currency: p.currency,
                type: p.type,
                listing_type: p.listingType,
                address: p.location.address,
                city: p.location.city,
                state: p.location.state,
                zip: p.location.zip,
                colonia: p.location.colonia,
                lat: p.location.lat,
                lng: p.location.lng,
                is_featured: p.featured,
                agent_id: agentId,
                images: p.images
            }).select().single();

            if (propError) {
                console.error("Error inserting property:", propError);
                continue;
            }

            // 3. Insert Features
            if (propData) {
                const { error: featError } = await supabase.from('property_features').insert({
                    property_id: propData.id,
                    bedrooms: p.features.bedrooms,
                    bathrooms: p.features.bathrooms,
                    parking: p.features.parking,
                    area_m2: p.features.area,
                    has_pool: p.features.hasPool,
                    has_gym: p.features.hasGym,
                    has_security: p.features.hasSecurity,
                    pet_friendly: p.features.petFriendly,
                    furnished: p.features.furnished
                });
                if (featError) console.error("Error inserting features:", featError);
            }
        }

        return NextResponse.json({ success: true, message: "Database seeded successfully" });

    } catch (error) {
        return errorResponse('Failed to seed database', 500, error);
    }
});
