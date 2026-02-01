#!/usr/bin/env tsx

/**
 * Script para crear el perfil de usuario faltante
 * Ejecutar con: npx tsx scripts/fix-user-profile.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Faltan las variables de entorno:')
  console.error('   - NEXT_PUBLIC_SUPABASE_URL')
  console.error('   - SUPABASE_SERVICE_ROLE_KEY')
  console.error('\nAsegúrate de tener un archivo .env.local con estas variables.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function fixUserProfile() {
  console.log('🔧 Arreglando perfil de usuario...\n')

  const userId = '17ae5051-6ef9-499c-9116-f566ba0a7ad0'

  // 1. Obtener el email del usuario desde auth.users
  console.log('📧 Obteniendo email del usuario...')
  const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId)

  if (authError || !authUser) {
    console.error('❌ Error al obtener usuario de auth:', authError)
    return
  }

  console.log(`✅ Usuario encontrado: ${authUser.user.email}`)

  // 2. Verificar que existe la agencia
  console.log('\n🏢 Verificando agencia...')
  const agencyId = '00000000-0000-0000-0000-000000000001'
  
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('id', agencyId)
    .single()

  if (agencyError || !agency) {
    console.log('⚠️  Agencia no existe, creando...')
    const { error: createAgencyError } = await supabase
      .from('agencies')
      .insert({
        id: agencyId,
        name: 'Demo Real Estate Agency',
        slug: 'demo-agency',
        email: 'contact@demoagency.com',
        phone: '+52 55 1234 5678',
        is_active: true
      })

    if (createAgencyError) {
      console.error('❌ Error al crear agencia:', createAgencyError)
      return
    }
    console.log('✅ Agencia creada')
  } else {
    console.log(`✅ Agencia existe: ${agency.name}`)
  }

  // 3. Crear o actualizar el perfil del usuario
  console.log('\n👤 Creando/actualizando perfil de usuario...')
  
  const fullName = authUser.user.user_metadata?.full_name || 'Usuario Admin'
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] || 'Usuario'
  const lastName = nameParts.slice(1).join(' ') || 'Admin'
  
  const { error: profileError } = await supabase
    .from('user_profiles')
    .upsert({
      id: userId,
      agency_id: agencyId,
      first_name: firstName,
      last_name: lastName,
      role: 'admin',
      is_active: true,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'id'
    })

  if (profileError) {
    console.error('❌ Error al crear/actualizar perfil:', profileError)
    return
  }

  // 4. Verificar el perfil
  console.log('\n🔍 Verificando perfil creado...')
  const { data: profile, error: verifyError } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (verifyError || !profile) {
    console.error('❌ Error al verificar perfil:', verifyError)
    return
  }

  console.log('\n✅ ¡Perfil creado exitosamente!')
  console.log('📋 Datos del perfil:')
  console.log(`   - ID: ${profile.id}`)
  console.log(`   - Nombre: ${profile.first_name} ${profile.last_name || ''}`)
  console.log(`   - Full Name: ${profile.full_name}`)
  console.log(`   - Rol: ${profile.role}`)
  console.log(`   - Agencia ID: ${profile.agency_id}`)
  console.log(`   - Activo: ${profile.is_active}`)
  
  console.log('\n✨ Ahora deberías poder acceder al backoffice en http://localhost:3000/backoffice')
}

fixUserProfile().catch(console.error)
