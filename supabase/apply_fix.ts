/**
 * Script para aplicar todas las correcciones necesarias al backend
 * Ejecuta el SQL de reparación completo en Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de Supabase
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yrfzhkziipeiganxpwlv.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_SERVICE_KEY) {
    console.error('❌ Error: No se encontró la clave de Supabase');
    console.error('Configura SUPABASE_SERVICE_ROLE_KEY en .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function executeSQLFile(filePath: string) {
    console.log(`📄 Leyendo archivo: ${filePath}`);

    const sql = fs.readFileSync(filePath, 'utf8');

    console.log('🚀 Ejecutando SQL en Supabase...\n');

    try {
        // Ejecutar el SQL completo
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });

        if (error) {
            console.error('❌ Error al ejecutar SQL:', error);
            return false;
        }

        console.log('✅ SQL ejecutado exitosamente');
        return true;
    } catch (err) {
        console.error('❌ Error:', err);
        return false;
    }
}

async function main() {
    console.log('🔧 Iniciando reparación del Backoffice...\n');

    const sqlFile = path.join(__dirname, 'fix_backoffice_complete.sql');

    if (!fs.existsSync(sqlFile)) {
        console.error(`❌ No se encontró el archivo: ${sqlFile}`);
        process.exit(1);
    }

    const success = await executeSQLFile(sqlFile);

    if (success) {
        console.log('\n✅ ¡Reparación completada exitosamente!');
        console.log('\nAhora puedes:');
        console.log('1. Refrescar tu navegador en http://localhost:3000/backoffice');
        console.log('2. Ver los datos en Dashboard, Contactos y Tareas');
        console.log('3. Explorar todas las funcionalidades del CRM');
    } else {
        console.log('\n⚠️  La reparación automática no funcionó.');
        console.log('\nPor favor, ejecuta manualmente el SQL:');
        console.log('1. Ve a tu proyecto Supabase');
        console.log('2. Abre SQL Editor');
        console.log('3. Copia y pega el contenido de: supabase/fix_backoffice_complete.sql');
        console.log('4. Ejecuta el query');
    }
}

main();
