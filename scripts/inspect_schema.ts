import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function inspectSchema() {
    console.log('🔍 Inspecting schema...');

    const tables = ['user_profiles', 'properties', 'contacts', 'tasks', 'user_objectives', 'agents', 'property_features'];

    for (const table of tables) {
        console.log(`\n--- Table: ${table} ---`);
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
            console.error(`Error selecting from ${table}:`, error.message);
        } else if (data && data.length > 0) {
            console.log('Columns found:', Object.keys(data[0]).join(', '));
        } else {
            console.log('Table is empty or no record found to inspect columns.');
            // Let's try to find column names via a dummy RPC or something else? 
            // Better: try to insert a record with an invalid column and see if the error lists valid ones?
            // No, PostgREST doesn't do that.
        }
    }
}

inspectSchema();
