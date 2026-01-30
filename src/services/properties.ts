
import { createClient } from '@supabase/supabase-js';
import { Property, PropertyFormData } from '@/types/properties';

// Note: Using client-side supabase client for now. 
// Ideally we should use the one from contexts or create a new one.
// Assuming process.env.NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are available.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export const PropertiesService = {
    async getProperties(filters?: any) {
        let query = supabase
            .from('properties')
            .select('*')
            .order('created_at', { ascending: false });

        if (filters?.limit) {
            query = query.limit(filters.limit);
        }

        if (filters?.agency_id) {
            query = query.eq('agency_id', filters.agency_id);
        }

        // Add more filters as needed

        const { data, error } = await query;
        if (error) throw error;
        return data as Property[];
    },

    async getPropertyById(id: string) {
        const { data, error } = await supabase
            .from('properties')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data as Property;
    },

    async createProperty(property: Partial<Property>) {
        const { data, error } = await supabase
            .from('properties')
            .insert(property)
            .select()
            .single();

        if (error) throw error;
        return data as Property;
    },

    async updateProperty(id: string, updates: Partial<Property>) {
        const { data, error } = await supabase
            .from('properties')
            .update(updates)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Property;
    },

    async deleteProperty(id: string) {
        const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async uploadPropertyImages(files: File[], propertyId: string) {
        const uploadedUrls: string[] = [];

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${propertyId}/${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('property-images')
                .upload(filePath, file);

            if (uploadError) {
                console.error('Error uploading image:', uploadError);
                continue;
            }

            const { data } = supabase.storage
                .from('property-images')
                .getPublicUrl(filePath);

            if (data) {
                uploadedUrls.push(data.publicUrl);
            }
        }

        return uploadedUrls;
    }
};
