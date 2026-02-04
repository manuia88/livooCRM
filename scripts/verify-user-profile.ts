#!/usr/bin/env tsx

/**
 * Script para verificar perfil de usuario y políticas RLS
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY || !SUPABASE_ANON_KEY) {
  console.error('❌ Faltan variables de entorno')
  process.exit(1)
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

async function main() {
  const email = process.argv[2]

  if (!email) {
    console.error('❌ Proporciona un email')
    console.log('Uso: npx tsx scripts/verify-user-profile.ts <email>')
    process.exit(1)
  }

  console.log(`🔍 Verificando usuario: ${email}\n`)

  // 1. Buscar usuario en auth.users (con admin)
  const { data: users } = await supabaseAdmin.auth.admin.listUsers()
  const user = users?.users.find((u) => u.email === email)

  if (!user) {
    console.error(`❌ Usuario no encontrado: ${email}`)
    process.exit(1)
  }

  console.log(`✅ Usuario en auth.users:`)
  console.log(`   ID: ${user.id}`)
  console.log(`   Email: ${user.email}`)
  console.log(`   Confirmado: ${user.email_confirmed_at ? 'Sí' : 'No'}`)
  console.log(`   Último login: ${user.last_sign_in_at || 'Nunca'}\n`)

  // 2. Buscar perfil con SERVICE_ROLE (bypass RLS)
  const { data: profileAdmin, error: errorAdmin } = await supabaseAdmin
    .from('user_profiles')
    .select('*, agency:agencies(*)')
    .eq('id', user.id)
    .maybeSingle()

  console.log(`🔐 Consulta con SERVICE_ROLE (bypass RLS):`)
  if (errorAdmin) {
    console.log(`   ❌ Error: ${errorAdmin.message}`)
  } else if (!profileAdmin) {
    console.log(`   ❌ Perfil NO encontrado`)
  } else {
    console.log(`   ✅ Perfil encontrado:`)
    console.log(`      - Nombre: ${profileAdmin.full_name}`)
    console.log(`      - Rol: ${profileAdmin.role}`)
    console.log(`      - Agency ID: ${profileAdmin.agency_id}`)
    console.log(`      - Agency: ${profileAdmin.agency?.name || 'N/A'}`)
    console.log(`      - Activo: ${profileAdmin.is_active}`)
  }

  // 3. Intentar autenticarse como ese usuario
  console.log(`\n🔑 Intentando autenticarse...`)
  
  // Primero obtener una sesión válida
  const { data: authData, error: signInError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email: user.email!,
  })

  if (signInError) {
    console.log(`   ❌ Error generando link: ${signInError.message}`)
  } else {
    console.log(`   ✅ Link de autenticación generado`)
  }

  // 4. Buscar perfil con ANON_KEY (simular cliente sin auth)
  const { data: profileAnon, error: errorAnon } = await supabaseAnon
    .from('user_profiles')
    .select('*, agency:agencies(*)')
    .eq('id', user.id)
    .maybeSingle()

  console.log(`\n👤 Consulta con ANON_KEY (sin autenticación):`)
  if (errorAnon) {
    console.log(`   ❌ Error: ${errorAnon.message}`)
    console.log(`   ⚠️  ESTO ES NORMAL - RLS debería bloquear sin auth`)
  } else if (!profileAnon) {
    console.log(`   ⚠️  Perfil NO encontrado (esperado sin auth)`)
  } else {
    console.log(`   ⚠️  Perfil encontrado (¡RLS no está bloqueando!)`)
  }

  // 5. Verificar políticas RLS
  console.log(`\n🛡️  Verificando políticas RLS de user_profiles...`)
  
  const { data: policies, error: policiesError } = await supabaseAdmin
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'user_profiles')

  if (policiesError) {
    console.log(`   ❌ Error: ${policiesError.message}`)
  } else if (!policies || policies.length === 0) {
    console.log(`   ❌ NO hay políticas RLS (tabla desprotegida)`)
  } else {
    console.log(`   ✅ Políticas encontradas: ${policies.length}`)
    policies.forEach((p: any) => {
      console.log(`      - ${p.policyname} (${p.cmd})`)
    })
  }

  // 6. Verificar si RLS está habilitado
  const { data: tableInfo } = await supabaseAdmin.rpc('get_table_info', {
    table_name: 'user_profiles'
  }).maybeSingle()

  console.log(`\n🔒 Estado de RLS:`)
  if (tableInfo) {
    console.log(`   RLS habilitado: ${tableInfo.rls_enabled ? '✅ Sí' : '❌ No'}`)
  }

  console.log(`\n✅ Verificación completa`)
}

main().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
