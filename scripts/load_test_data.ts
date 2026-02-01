import { createClient } from '@supabase/supabase-js';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load env vars from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

const AGENCY_ID = '00000000-0000-0000-0000-000000000001';
const ADMIN_ID = '2a2453d0-08ad-4e4d-8cfb-142eebf80952';
const ASESOR1_ID = '483ea6a0-09b9-4763-8ad0-dab546418ff8';
const ASESOR2_ID = '53520333-3303-4ae9-a3b4-c8207ae8c744';

async function loadData() {
    console.log('🚀 Starting test data load (V3 - Master Schema)...');

    // 1. Ensure Agency Exists
    const { error: agencyError } = await supabase.from('agencies').upsert({
        id: AGENCY_ID,
        name: 'Livoo Real Estate',
        slug: 'livoo',
        is_active: true
    });
    if (agencyError) console.error('Error with agency:', agencyError.message);

    // 2. User Profiles
    const profiles = [
        { id: ADMIN_ID, agency_id: AGENCY_ID, first_name: 'María', last_name: 'Administradora', role: 'admin', is_active: true },
        { id: ASESOR1_ID, agency_id: AGENCY_ID, first_name: 'Carlos', last_name: 'Asesor', role: 'agent', is_active: true },
        { id: ASESOR2_ID, agency_id: AGENCY_ID, first_name: 'Laura', last_name: 'Asesora', role: 'agent', is_active: true }
    ];
    for (const profile of profiles) {
        const { error } = await supabase.from('user_profiles').upsert(profile);
        if (error) console.error(`Error with profile ${profile.first_name}:`, error.message);
    }

    // 3. Properties (Master Schema uses address JSONB, assigned_to)
    const properties = [
        {
            agency_id: AGENCY_ID,
            assigned_to: ASESOR1_ID,
            created_by: ASESOR1_ID,
            title: 'Casa en Polanco',
            description: 'Hermosa casa moderna en el corazón de Polanco',
            property_type: 'house',
            operation_type: 'sale',
            address: { street: 'Masaryk', number: '123' },
            status: 'active',
            sale_price: 15500000
        },
        {
            agency_id: AGENCY_ID,
            assigned_to: ASESOR1_ID,
            created_by: ASESOR1_ID,
            title: 'Departamento Roma Norte',
            description: 'Departamento estilo loft',
            property_type: 'apartment',
            operation_type: 'rent',
            address: { street: 'Alvaro Obregon', number: '45' },
            status: 'active',
            rent_price: 25000
        }
    ];
    for (const prop of properties) {
        const { error } = await supabase.from('properties').insert(prop);
        if (error) console.error(`Error with property ${prop.title}:`, error.message);
    }

    // 4. Contacts (Master Schema: contact_type instead of type)
    const contacts = [
        {
            agency_id: AGENCY_ID, assigned_to: ASESOR1_ID, created_by: ASESOR1_ID,
            first_name: 'Juan', last_name: 'Pérez', email: 'juan.perez@email.com',
            contact_type: 'buyer', status: 'qualified', lead_score: 85
        },
        {
            agency_id: AGENCY_ID, assigned_to: ASESOR1_ID, created_by: ASESOR1_ID,
            first_name: 'Ana', last_name: 'López', email: 'ana.lopez@email.com',
            contact_type: 'renter', status: 'contacted', lead_score: 60
        }
    ];
    for (const contact of contacts) {
        const { error } = await supabase.from('contacts').insert(contact);
        if (error) console.error(`Error with contact ${contact.first_name}:`, error.message);
    }

    // 5. Tasks (Master Schema: media, pendiente)
    const tasks = [
        {
            agency_id: AGENCY_ID, assigned_to: ASESOR1_ID, created_by: ADMIN_ID,
            title: 'Llamar a Juan Pérez', description: 'Seguimiento',
            task_type: 'contact', priority: 'alta', status: 'pendiente',
            due_date: new Date(Date.now() + 86400000).toISOString()
        }
    ];
    for (const task of tasks) {
        const { error } = await supabase.from('tasks').insert(task);
        if (error) console.error(`Error with task ${task.title}:`, error.message);
    }

    // 6. User Objectives (0015 Schema)
    const objectives = [
        {
            agency_id: AGENCY_ID, user_id: ASESOR1_ID, period: 'monthly',
            target_amount: 4000000, current_amount: 1500000,
            start_date: '2025-01-01', end_date: '2025-12-31'
        }
    ];
    for (const obj of objectives) {
        const { error } = await supabase.from('user_objectives').insert(obj);
        if (error) console.error(`Error with objective for ${obj.user_id}:`, error.message);
    }

    console.log('✅ Corrected test data load completed!');
}

loadData();
