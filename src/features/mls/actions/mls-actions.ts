"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function incrementMlsView(propertyId: string) {
    const supabase = await createClient();

    // We increment blindly for now, production would need IP checks/throttling
    const { error } = await supabase.rpc('increment_mls_views', { property_id: propertyId });

    // Fallback if RPC doesn't exist (simpler implementation for MVP)
    if (error) {
        // Get current
        const { data } = await supabase.from('properties').select('mls_views').eq('id', propertyId).single();
        if (data) {
            await supabase.from('properties')
                .update({ mls_views: (data.mls_views || 0) + 1 })
                .eq('id', propertyId);
        }
    }
}

export async function submitCollaborationRequest(formData: FormData) {
    const propertyId = formData.get("propertyId") as string;
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const agency = formData.get("agency") as string;
    const message = formData.get("message") as string;

    // In a real app, this would send an email or store in a 'requests' table
    console.log(`[COLLABORATION REQUEST] Property: ${propertyId}, Agent: ${name} (${agency}), Phone: ${phone}, Msg: ${message}`);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 800));

    return { success: true };
}
