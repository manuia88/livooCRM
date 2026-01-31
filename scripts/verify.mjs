const URL = 'https://yrfzhkziipeiganxpwlv.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyZnpoa3ppaXBlaWdhbnhwd2x2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk1NzQzMjYsImV4cCI6MjA4NTE1MDMyNn0.D_nRvTrvH7EoOyc3QcPcxtKFf2gLEP2FvKkuL2jqbE0';

async function verify() {
    console.log('--- Verificando Tablas ---');
    const tables = ['user_objectives', 'broker_levels'];
    for (const table of tables) {
        const resp = await fetch(`${URL}/rest/v1/${table}?select=count`, {
            headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Range-Unit': 'items', 'Prefer': 'count=exact' }
        });
        if (resp.ok) console.log(`✅ ${table}: Existe`);
        else console.log(`❌ ${table}: Error ${resp.status}`);
    }

    console.log('\n--- Verificando Datos ---');
    const respLevels = await fetch(`${URL}/rest/v1/broker_levels?select=name,order_index,min_revenue&order=order_index.asc`, {
        headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    });
    if (respLevels.ok) {
        const levels = await respLevels.json();
        levels.forEach(l => console.log(`- [${l.order_index}] ${l.name}: Revenue >= ${l.min_revenue}`));
    }

    console.log('\n--- Probando Función RPC ---');
    // Get a user ID first
    const respUser = await fetch(`${URL}/rest/v1/user_profiles?select=id&limit=1`, {
        headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}` }
    });
    console.log(`User profiles response: ${respUser.status}`);
    if (respUser.ok) {
        const users = await respUser.json();
        console.log(`Found ${users.length} users`);
        if (users.length > 0) {
            const userId = users[0].id;
            console.log(`Probando get_dashboard_summary para: ${userId}`);
            const respRpc = await fetch(`${URL}/rest/v1/rpc/get_dashboard_summary`, {
                method: 'POST',
                headers: { 'apikey': KEY, 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ p_user_id: userId })
            });
            if (respRpc.ok) {
                const summary = await respRpc.json();
                console.log('✅ Resumen OK');
                console.log(JSON.stringify(summary, null, 2).substring(0, 100) + '...');
            } else {
                console.log(`❌ RPC Error ${respRpc.status}`);
                const errText = await respRpc.text();
                console.log(errText);
            }
        }
    }
}

verify();
