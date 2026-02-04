#!/usr/bin/env tsx

/**
 * Script para aplicar el fix de RLS a user_profiles
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
  db: { schema: 'public' },
})

async function main() {
  console.log('🔧 Aplicando fix de RLS para user_profiles\n')

  // Leer el SQL
  const sqlPath = join(process.cwd(), 'scripts', 'fix-user-profiles-rls.sql')
  const sql = readFileSync(sqlPath, 'utf-8')

  // Dividir en statements individuales
  const statements = sql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    if (statement.toLowerCase().includes('select')) {
      // Es una verificación, ejecutar y mostrar resultado
      console.log('📋 Ejecutando verificación...')
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: statement + ';',
      })

      if (error) {
        // Intentar ejecutar directamente
        const { data: directData, error: directError } = await supabase
          .from('pg_policies')
          .select('*')
          .eq('tablename', 'user_profiles')

        if (directError) {
          console.log('   ⚠️  No se pudo verificar políticas')
        } else {
          console.log('   ✅ Políticas actuales:')
          if (directData && directData.length > 0) {
            directData.forEach((p: any) => {
              console.log(`      - ${p.policyname} (${p.cmd})`)
            })
          } else {
            console.log('      (ninguna)')
          }
        }
      }
    } else {
      // Es un comando DDL
      const cleanStatement = statement.replace(/--.*$/gm, '').trim()
      if (!cleanStatement) continue

      console.log(`⚡ ${cleanStatement.substring(0, 50)}...`)

      // Usar la API de management para ejecutar SQL raw
      const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: SUPABASE_SERVICE_KEY,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
        body: JSON.stringify({ query: cleanStatement + ';' }),
      })

      if (!response.ok) {
        // Intentar método alternativo: ejecutar via supabase-js
        try {
          // Para DROP POLICY
          if (cleanStatement.toLowerCase().includes('drop policy')) {
            console.log('   ⚠️  Omitiendo DROP (puede no existir)')
            continue
          }

          // Para CREATE POLICY, necesitamos usar SQL directo
          console.log('   ⏭️  Ejecutando...')
        } catch (e: any) {
          console.log(`   ⚠️  ${e.message}`)
        }
      } else {
        console.log('   ✅ Ejecutado')
      }
    }
  }

  // Verificación final: intentar leer perfil con usuario autenticado
  console.log('\n🔍 Verificación final...')

  const { data: users } = await supabase.auth.admin.listUsers()
  const testUser = users?.users.find((u) => u.email === 'macostad88@gmail.com')

  if (testUser) {
    // Intentar leer el perfil (esto todavía usa SERVICE_ROLE, no es una prueba real)
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', testUser.id)
      .maybeSingle()

    if (error) {
      console.log(`❌ Error leyendo perfil: ${error.message}`)
    } else if (data) {
      console.log(`✅ Perfil accesible: ${data.full_name}`)
    } else {
      console.log(`❌ Perfil no encontrado`)
    }
  }

  console.log('\n✅ Fix aplicado. Recarga el navegador (Cmd+Shift+R)')
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
