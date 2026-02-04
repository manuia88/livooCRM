#!/usr/bin/env tsx

/**
 * Script para crear perfil del usuario actual autenticado
 * Si no existe perfil en user_profiles, lo crea automáticamente
 */

import { createClient } from '@supabase/supabase-js'
import * as readline from 'readline'

// Verificar variables de entorno
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Faltan variables de entorno:')
  if (!SUPABASE_URL) console.error('  - NEXT_PUBLIC_SUPABASE_URL')
  if (!SUPABASE_SERVICE_KEY) console.error('  - SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

// Cliente Supabase con SERVICE_ROLE_KEY (bypass RLS)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper para leer input del usuario
function askQuestion(query: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

async function main() {
  console.log('🔍 Fix User Profile - Crear perfil faltante\n')

  // 1. Obtener email del argumento o listar usuarios
  const email = process.argv[2]

  if (!email) {
    console.log('📋 Primero, listemos todos los usuarios disponibles:\n')
    
    const { data: users, error: listError } = await supabase.auth.admin.listUsers()
    
    if (listError) {
      console.error('❌ Error listando usuarios:', listError)
      process.exit(1)
    }

    if (users.users.length === 0) {
      console.error('❌ No hay usuarios registrados en Supabase Auth')
      process.exit(1)
    }

    console.log('👥 Usuarios encontrados:')
    users.users.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.email} (ID: ${u.id})`)
    })

    console.log('\n💡 Uso del script:')
    console.log('  npx tsx scripts/fix-current-user-profile.ts <email>\n')
    console.log('Ejemplo:')
    console.log(`  npx tsx scripts/fix-current-user-profile.ts ${users.users[0]?.email}\n`)
    process.exit(0)
  }

  console.log(`\n🔍 Buscando usuario con email: ${email}`)

  // 2. Buscar usuario en auth.users
  const { data: users, error: listError } = await supabase.auth.admin.listUsers()

  if (listError) {
    console.error('❌ Error listando usuarios:', listError)
    process.exit(1)
  }

  const user = users.users.find((u) => u.email === email)

  if (!user) {
    console.error(`❌ No se encontró usuario con email: ${email}`)
    console.log('\n💡 Usuarios disponibles:')
    users.users.forEach((u) => console.log(`  - ${u.email}`))
    process.exit(1)
  }

  console.log(`✅ Usuario encontrado: ${user.id}`)

  // 3. Verificar si ya existe perfil
  const { data: existingProfile, error: profileError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError && profileError.code !== 'PGRST116') {
    console.error('❌ Error verificando perfil:', profileError)
    process.exit(1)
  }

  if (existingProfile) {
    console.log('✅ El usuario ya tiene perfil en user_profiles')
    console.log('\n📋 Datos del perfil:')
    console.log(`  - ID: ${existingProfile.id}`)
    console.log(`  - Nombre: ${existingProfile.full_name}`)
    console.log(`  - Email: ${user.email}`)
    console.log(`  - Rol: ${existingProfile.role}`)
    console.log(`  - Agency ID: ${existingProfile.agency_id}`)
    console.log(`  - Activo: ${existingProfile.is_active}`)
    console.log('\n✅ No se necesita hacer nada, el perfil existe')
    return
  }

  console.log('⚠️  El usuario NO tiene perfil en user_profiles')

  // 4. Verificar agencia demo
  const DEMO_AGENCY_ID = '00000000-0000-0000-0000-000000000001'

  const { data: demoAgency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', DEMO_AGENCY_ID)
    .maybeSingle()

  if (agencyError) {
    console.error('❌ Error verificando agencia demo:', agencyError)
    process.exit(1)
  }

  if (!demoAgency) {
    console.log('🏢 Creando agencia demo...')

    const { error: createAgencyError } = await supabase.from('agencies').insert({
      id: DEMO_AGENCY_ID,
      name: 'Demo Real Estate Agency',
      slug: 'demo-agency',
      email: 'contact@demoagency.com',
      phone: '+52 55 1234 5678',
      plan_type: 'pro',
      is_active: true,
    })

    if (createAgencyError) {
      console.error('❌ Error creando agencia demo:', createAgencyError)
      process.exit(1)
    }

    console.log('✅ Agencia demo creada')
  } else {
    console.log(`✅ Agencia demo ya existe: ${demoAgency.name}`)
  }

  // 5. Crear perfil del usuario
  console.log('\n👤 Creando perfil de usuario...')

  const { data: newProfile, error: insertError } = await supabase
    .from('user_profiles')
    .insert({
      id: user.id,
      agency_id: DEMO_AGENCY_ID,
      first_name: 'Usuario',
      last_name: 'Admin',
      role: 'admin',
      is_active: true,
      phone: null,
      avatar_url: null,
    })
    .select()
    .single()

  if (insertError) {
    console.error('❌ Error creando perfil:', insertError)
    process.exit(1)
  }

  console.log('✅ Perfil creado exitosamente!')

  // 6. Verificar perfil creado
  const { data: verifyProfile, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*, agency:agencies(*)')
    .eq('id', user.id)
    .single()

  if (verifyError) {
    console.error('❌ Error verificando perfil creado:', verifyError)
    process.exit(1)
  }

  console.log('\n🎉 PERFIL CREADO CORRECTAMENTE:')
  console.log(`  - ID: ${verifyProfile.id}`)
  console.log(`  - Nombre: ${verifyProfile.full_name}`)
  console.log(`  - Email: ${user.email}`)
  console.log(`  - Rol: ${verifyProfile.role}`)
  console.log(`  - Agencia: ${verifyProfile.agency.name}`)
  console.log(`  - Activo: ${verifyProfile.is_active}`)

  console.log('\n✅ Ahora puedes acceder al backoffice en http://localhost:3000/backoffice')
}

main().catch((error) => {
  console.error('❌ Error inesperado:', error)
  process.exit(1)
})
