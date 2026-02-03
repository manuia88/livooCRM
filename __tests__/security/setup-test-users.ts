#!/usr/bin/env tsx

/**
 * Script para Crear Usuarios de Test
 * 
 * Crea usuarios de prueba en 2 agencias diferentes
 * para poder ejecutar los tests de seguridad multi-tenant.
 * 
 * USO:
 * npx tsx __tests__/security/setup-test-users.ts
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

async function setupTestUsers() {
  console.log('🔧 Configurando usuarios de test para seguridad...\n')

  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Faltan variables de entorno:')
    console.error('- NEXT_PUBLIC_SUPABASE_URL')
    console.error('- SUPABASE_SERVICE_ROLE_KEY\n')
    process.exit(1)
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Definir agencias y usuarios de test
  const testData = {
    agencies: [
      {
        id: '00000000-0000-0000-0000-000000000001',
        name: 'Test Agency A',
        slug: 'test-agency-a',
        email: 'contact@test-agency-a.com',
        plan_type: 'pro',
        is_active: true
      },
      {
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Test Agency B',
        slug: 'test-agency-b',
        email: 'contact@test-agency-b.com',
        plan_type: 'pro',
        is_active: true
      }
    ],
    users: [
      {
        email: 'test-agency-a@example.com',
        password: 'Test123456!',
        firstName: 'Test User',
        lastName: 'Agency A',
        role: 'admin',
        agencyId: '00000000-0000-0000-0000-000000000001'
      },
      {
        email: 'test-agency-b@example.com',
        password: 'Test123456!',
        firstName: 'Test User',
        lastName: 'Agency B',
        role: 'admin',
        agencyId: '00000000-0000-0000-0000-000000000002'
      }
    ]
  }

  const createdAgencies: { [key: string]: string } = {}
  const createdUsers: { [key: string]: { userId: string, agencyId: string } } = {}

  try {
    // 1. Crear agencias
    console.log('📦 Creando agencias de test...')
    
    for (const agency of testData.agencies) {
      const { data, error } = await supabase
        .from('agencies')
        .upsert(agency, { onConflict: 'id' })
        .select('id, name')
        .single()

      if (error) {
        console.error(`❌ Error creando agencia ${agency.name}:`, error.message)
      } else {
        console.log(`✅ Agencia creada/actualizada: ${agency.name}`)
        createdAgencies[agency.name] = data?.id || agency.id
      }
    }

    console.log('')

    // 2. Crear usuarios
    console.log('👤 Creando usuarios de test...')

    for (const user of testData.users) {
      // Verificar si el usuario ya existe
      const { data: existingAuth } = await supabase.auth.admin.listUsers()
      const userExists = existingAuth.users.some(u => u.email === user.email)

      let userId: string

      if (userExists) {
        console.log(`⏭️  Usuario ya existe: ${user.email}`)
        const existingUser = existingAuth.users.find(u => u.email === user.email)
        userId = existingUser!.id
      } else {
        // Crear en auth.users
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true,
          user_metadata: {
            full_name: `${user.firstName} ${user.lastName}`
          }
        })

        if (authError || !authData.user) {
          console.error(`❌ Error creando auth user ${user.email}:`, authError?.message)
          continue
        }

        userId = authData.user.id
        console.log(`✅ Auth user creado: ${user.email}`)
      }

      // Crear perfil en user_profiles
      const { error: profileError } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          agency_id: user.agencyId,
          first_name: user.firstName,
          last_name: user.lastName,
          role: user.role,
          is_active: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (profileError) {
        console.error(`❌ Error creando profile ${user.email}:`, profileError.message)
      } else {
        console.log(`✅ Profile creado/actualizado: ${user.email}`)
        createdUsers[user.email] = {
          userId,
          agencyId: user.agencyId
        }
      }
    }

    // Guardar IDs en archivo para los tests
    const fs = await import('fs/promises')
    const path = await import('path')
    const testIdsPath = path.join(process.cwd(), '__tests__/security/test-ids.json')
    
    const testIds = {
      agencyA: {
        id: createdAgencies['Test Agency A'] || testData.agencies[0].id,
        userId: createdUsers['test-agency-a@example.com']?.userId,
        email: 'test-agency-a@example.com',
        password: 'Test123456!'
      },
      agencyB: {
        id: createdAgencies['Test Agency B'] || testData.agencies[1].id,
        userId: createdUsers['test-agency-b@example.com']?.userId,
        email: 'test-agency-b@example.com',
        password: 'Test123456!'
      }
    }

    await fs.writeFile(testIdsPath, JSON.stringify(testIds, null, 2))
    console.log(`✅ IDs guardados en ${testIdsPath}`)

    console.log('\n')
    console.log('═'.repeat(60))
    console.log('✅ USUARIOS DE TEST CONFIGURADOS')
    console.log('═'.repeat(60))
    console.log('\nCredenciales de test:')
    console.log('\nAgencia A:')
    console.log(`  ID: ${testIds.agencyA.id}`)
    console.log('  Email: test-agency-a@example.com')
    console.log('  Password: Test123456!')
    console.log('\nAgencia B:')
    console.log(`  ID: ${testIds.agencyB.id}`)
    console.log('  Email: test-agency-b@example.com')
    console.log('  Password: Test123456!')
    console.log('\nAhora puedes ejecutar:')
    console.log('  npm test -- __tests__/security/multi-tenant.test.ts\n')

  } catch (error) {
    console.error('\n❌ Error durante setup:', error)
    process.exit(1)
  }
}

setupTestUsers()
