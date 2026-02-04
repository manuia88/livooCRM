#!/usr/bin/env tsx

/**
 * Script para crear usuario admin completo
 * Crea tanto el usuario en auth.users como el perfil en user_profiles
 */

import { createClient } from '@supabase/supabase-js'

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

const DEMO_AGENCY_ID = '00000000-0000-0000-0000-000000000001'

async function main() {
  const email = process.argv[2]
  const password = process.argv[3] || 'Admin123456!'

  if (!email) {
    console.error('❌ Debes proporcionar un email')
    console.log('\n💡 Uso:')
    console.log('  npx tsx scripts/create-admin-user.ts <email> [password]')
    console.log('\nEjemplo:')
    console.log('  npx tsx scripts/create-admin-user.ts admin@example.com miPassword123')
    process.exit(1)
  }

  console.log('👤 Creando usuario admin...\n')
  console.log(`  📧 Email: ${email}`)
  console.log(`  🔐 Password: ${password}\n`)

  // 1. Verificar si el usuario ya existe
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const userExists = existingUsers?.users.find((u) => u.email === email)

  let userId: string

  if (userExists) {
    console.log('⚠️  El usuario ya existe en auth.users')
    userId = userExists.id
    console.log(`  - ID: ${userId}`)
  } else {
    // 2. Crear usuario en auth.users
    console.log('🔐 Creando usuario en Supabase Auth...')

    const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmar email
    })

    if (createUserError) {
      console.error('❌ Error creando usuario:', createUserError)
      process.exit(1)
    }

    userId = newUser.user.id
    console.log(`✅ Usuario creado en auth.users (ID: ${userId})`)
  }

  // 3. Verificar/Crear agencia demo
  const { data: demoAgency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', DEMO_AGENCY_ID)
    .maybeSingle()

  if (agencyError) {
    console.error('❌ Error verificando agencia:', agencyError)
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
      console.error('❌ Error creando agencia:', createAgencyError)
      process.exit(1)
    }

    console.log('✅ Agencia demo creada')
  } else {
    console.log(`✅ Agencia demo ya existe: ${demoAgency.name}`)
  }

  // 4. Verificar si ya existe perfil
  const { data: existingProfile } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (existingProfile) {
    console.log('⚠️  El usuario ya tiene perfil en user_profiles')
    console.log(`  - Nombre: ${existingProfile.full_name}`)
    console.log(`  - Rol: ${existingProfile.role}`)
    console.log(`  - Agency ID: ${existingProfile.agency_id}`)
    
    // Actualizar a admin si no lo es
    if (existingProfile.role !== 'admin') {
      console.log('\n🔧 Actualizando rol a admin...')
      
      const { error: updateError } = await supabase
        .from('user_profiles')
        .update({ 
          role: 'admin',
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)

      if (updateError) {
        console.error('❌ Error actualizando rol:', updateError)
      } else {
        console.log('✅ Rol actualizado a admin')
      }
    }
  } else {
    // 5. Crear perfil del usuario
    console.log('👤 Creando perfil en user_profiles...')

    const { error: insertError } = await supabase.from('user_profiles').insert({
      id: userId,
      agency_id: DEMO_AGENCY_ID,
      first_name: email.split('@')[0],
      last_name: 'Admin',
      role: 'admin',
      is_active: true,
      phone: null,
      avatar_url: null,
    })

    if (insertError) {
      console.error('❌ Error creando perfil:', insertError)
      process.exit(1)
    }

    console.log('✅ Perfil creado exitosamente')
  }

  // 6. Verificar perfil final
  const { data: finalProfile, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*, agency:agencies(*)')
    .eq('id', userId)
    .single()

  if (verifyError) {
    console.error('❌ Error verificando perfil:', verifyError)
    process.exit(1)
  }

  console.log('\n🎉 USUARIO ADMIN CREADO CORRECTAMENTE:\n')
  console.log(`  📧 Email:    ${email}`)
  console.log(`  🔐 Password: ${password}`)
  console.log(`  👤 Nombre:   ${finalProfile.full_name}`)
  console.log(`  🎭 Rol:      ${finalProfile.role}`)
  console.log(`  🏢 Agencia:  ${finalProfile.agency.name}`)
  console.log(`  ✅ Activo:   ${finalProfile.is_active}`)
  console.log(`\n🚀 Ahora puedes hacer login en: http://localhost:3000/auth`)
}

main().catch((error) => {
  console.error('❌ Error inesperado:', error)
  process.exit(1)
})
