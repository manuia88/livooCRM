#!/usr/bin/env node

/**
 * Script simple para aplicar correcciones
 * Abre Supabase Dashboard y muestra instrucciones
 */

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔧 Aplicando reparaciones al Backoffice...\n');

const sqlFilePath = path.join(__dirname, 'fix_backoffice_complete.sql');
const supabaseURL = 'https://supabase.com/dashboard/project/yrfzhkziipeiganxpwlv/sql/new';

console.log('📋 Instrucciones:');
console.log('1. Se abrirá el SQL Editor de Supabase en tu navegador');
console.log('2. Copia el contenido de: supabase/fix_backoffice_complete.sql');
console.log('3. Pégalo en el editor y haz clic en "Run"');
console.log('4. Espera a que se complete la ejecución\n');

console.log('📄 Archivo SQL:', sqlFilePath);
console.log('🌐 Abriendo Supabase Dashboard...\n');

// Abrir Supabase en el navegador
exec(`open "${supabaseURL}"`, (error) => {
    if (error) {
        console.log('⚠️  No se pudo abrir el navegador automáticamente');
        console.log('Abre manualmente:', supabaseURL);
    } else {
        console.log('✅ Dashboard abierto en el navegador');
    }

    console.log('\n💡 Tip: Puedes ver el contenido del SQL con:');
    console.log('   cat supabase/fix_backoffice_complete.sql\n');
});
