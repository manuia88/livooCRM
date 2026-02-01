import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: Supabase credentials not found in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQL(sql: string) {
    // Try using exec_sql if it exists
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

    if (error) {
        // If exec_sql doesn't exist, we might need to split the queries
        // or the user should run it manually.
        console.error('❌ Error executing SQL via RPC:', error);
        return false;
    }

    return true;
}

async function main() {
    const filePath = path.resolve(process.cwd(), 'testing_dashboard.sql');

    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        process.exit(1);
    }

    const sql = fs.readFileSync(filePath, 'utf8');

    console.log('🚀 Executing testing_dashboard.sql on Supabase...');

    const success = await executeSQL(sql);

    if (success) {
        console.log('✅ Testing data loaded successfully!');
    } else {
        console.log('⚠️ Failed to load testing data via RPC.');
        console.log('Please copy the content of testing_dashboard.sql and run it manually in Supabase SQL Editor.');
    }
}

main();
