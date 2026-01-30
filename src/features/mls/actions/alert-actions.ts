"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function createSearchAlert(formData: FormData) {
    const supabase = await createClient();

    // Get current user
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Must be logged in to create alerts" };
    }

    const name = formData.get("name") as string;
    const frequency = formData.get("frequency") as string;
    const filters = formData.get("filters") as string; // JSON string

    if (!name || !frequency) {
        return { success: false, error: "Missing required fields" };
    }

    const { error } = await supabase
        .from('search_alerts')
        .insert({
            user_id: user.id,
            name,
            frequency,
            filters: JSON.parse(filters || '{}'),
            is_active: true
        });

    if (error) {
        console.error("Error creating alert:", error);
        return { success: false, error: "Failed to create alert" };
    }

    revalidatePath('/mls');
    return { success: true };
}
