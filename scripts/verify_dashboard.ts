import { createClient } from '../src/utils/supabase/server';

async function verify() {
    const supabase = await createClient();

    console.log('--- Verificando Tablas ---');
    const { data: tables, error: tablesError } = await supabase.rpc('get_tables_info', {
        target_tables: ['user_objectives', 'user_levels', 'priority_actions', 'quick_actions', 'conversation_summaries']
    });

    // Si RPC no existe, usamos una query directa
    const { data: tablesRaw, error: rawError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .in('table_name', ['user_objectives', 'user_levels', 'priority_actions', 'quick_actions', 'conversation_summaries']);

    if (rawError) {
        console.log('Error verificando tablas:', rawError.message);
    } else {
        console.log('Tablas encontradas:', tablesRaw.map(t => t.table_name).join(', '));
    }

    console.log('\n--- Verificando Funciones ---');
    const { data: routines, error: routinesError } = await supabase
        .from('information_schema.routines')
        .select('routine_name')
        .eq('routine_schema', 'public')
        .in('routine_name', ['calculate_user_level', 'generate_priority_actions', 'get_dashboard_summary']);

    if (routinesError) {
        console.log('Error verificando funciones:', routinesError.message);
    } else {
        console.log('Funciones encontradas:', routines.map(r => r.routine_name).join(', '));
    }

    console.log('\n--- Verificando Niveles de Broker ---');
    const { data: levels, error: levelsError } = await supabase
        .from('user_levels')
        .select('name, min_operations, min_revenue')
        .order('min_revenue', { ascending: true });

    if (levelsError) {
        console.log('Error verificando niveles:', levelsError.message);
    } else {
        levels.forEach(l => {
            console.log(`- ${l.name}: Ops >= ${l.min_operations}, Rev >= ${l.min_revenue}`);
        });
    }
}

verify().catch(console.error);
