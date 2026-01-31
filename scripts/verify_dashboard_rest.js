const URL = 'https://yrfzhkziipeiganxpwlv.supabase.co/rest/v1/';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZnpoa3ppaXBlaWdhbnhwd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NzQzMjYsImV4cCI6MjA4NTE1MDMyNn0.D_nRvTrvH7EoOyc3QcPcxtKFf2gLEP2FvKkuL2jqbE0';

async function query(sql) {
    // Note: Supabase REST API doesn't allow raw SQL normally, but we can check existence via GET on tables
    // For functions we might need RPC or check routines if accessible via REST (unlikely)
    // But we can check if Tables return 200 OK.
}

async function verify() {
    const tables = ['user_objectives', 'user_levels', 'priority_actions', 'quick_actions', 'conversation_summaries'];
    console.log('--- Verificando Tablas via REST ---');
    for (const table of tables) {
        try {
            const resp = await fetch(`${URL}${table}?select=*&limit=1`, {
                headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
            });
            if (resp.ok) console.log(`✅ Table ${table}: OK`);
            else console.log(`❌ Table ${table}: Error ${resp.status}`);
        } catch (e) {
            console.log(`❌ Table ${table}: Failed`, e.message);
        }
    }

    console.log('\n--- Verificando Niveles de Broker ---');
    try {
        const resp = await fetch(`${URL}user_levels?select=name,min_operations,min_revenue&order=min_revenue.asc`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
        });
        if (resp.ok) {
            const levels = await resp.json();
            levels.forEach(l => console.log(`- ${l.name}: Ops >= ${l.min_operations}, Rev >= ${l.min_revenue}`));
        } else {
            console.log(`❌ Failed to fetch levels: ${resp.status}`);
        }
    } catch (e) {
        console.log(`❌ Error fetching levels:`, e.message);
    }
}

verify();
