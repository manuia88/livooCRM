import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function probe() {
    console.log('🧪 Probing properties table (V2)...');

    const tests = [
        { title: 'Test with Agent ID', agent_id: '2a2453d0-08ad-4e4d-8cfb-142eebf80952' }
    ];

    for (const test of tests) {
        console.log(`\nTesting with keys: ${Object.keys(test).join(', ')}`);
        const { data, error } = await supabase.from('properties').insert(test).select();
        if (error) {
            console.error('❌ Error:', error.message);
        } else {
            console.log('✅ Success! Data:', data);
            if (data && data[0]) {
                await supabase.from('properties').delete().eq('id', data[0].id);
            }
        }
    }
}

probe();
