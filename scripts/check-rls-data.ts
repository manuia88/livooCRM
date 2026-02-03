#!/usr/bin/env tsx
/**
 * Script para verificar datos y RLS
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function checkRLSData() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  console.log('🔍 Verificando datos de propiedades...\n')

  // Obtener propiedades con service role (ignora RLS)
  const { data: properties, error } = await supabase
    .from('properties')
    .select('id, title, agency_id')
    .limit(20)

  if (error) {
    console.error('❌ Error:', error.message)
    return
  }

  console.log(`Total propiedades: ${properties.length}\n`)

  const agencyCounts: Record<string, number> = {}
  
  properties.forEach(prop => {
    agencyCounts[prop.agency_id] = (agencyCounts[prop.agency_id] || 0) + 1
  })

  console.log('Propiedades por agencia:')
  Object.entries(agencyCounts).forEach(([agencyId, count]) => {
    console.log(`  ${agencyId}: ${count} propiedades`)
  })

  console.log('\n✅ Verificación completada')
}

checkRLSData()
