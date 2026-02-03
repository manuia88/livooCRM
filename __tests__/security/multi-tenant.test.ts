/**
 * Tests de Seguridad Multi-Tenant
 * 
 * Verifica que las políticas RLS funcionen correctamente
 * y que usuarios de diferentes agencias no puedan acceder
 * a datos de otras agencias.
 * 
 * IMPORTANTE: Estos tests requieren que:
 * 1. fix_rls_multi_tenant.sql esté aplicado en Supabase
 * 2. Existan al menos 2 agencias con usuarios
 */

import { createClient } from '@supabase/supabase-js'

// Configuración de test
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

describe('Multi-Tenant Security', () => {
  let supabaseAgencyA: ReturnType<typeof createClient>
  let supabaseAgencyB: ReturnType<typeof createClient>
  
  const testUsers = {
    agencyA: {
      email: 'test-agency-a@example.com',
      password: 'Test123456!',
      userId: '',
      agencyId: '00000000-0000-0000-0000-000000000001'
    },
    agencyB: {
      email: 'test-agency-b@example.com', 
      password: 'Test123456!',
      userId: '',
      agencyId: '00000000-0000-0000-0000-000000000002'
    }
  }

  beforeAll(() => {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error('SUPABASE_URL y SUPABASE_ANON_KEY deben estar configurados')
    }
  })

  describe('Properties Isolation', () => {
    test('User from Agency A cannot see properties from Agency B', async () => {
      // Crear cliente autenticado para Agency A
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyA.email,
        password: testUsers.agencyA.password,
      })

      if (authError || !authData.user) {
        console.warn('⚠️  Test user no existe. Crea usuarios de test primero.')
        return // Skip test si no hay usuarios
      }

      // Intentar obtener todas las propiedades
      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, agency_id')

      expect(error).toBeNull()
      expect(properties).toBeTruthy()

      // TODAS las propiedades deben ser de Agency A únicamente
      properties?.forEach(property => {
        expect(property.agency_id).toBe(testUsers.agencyA.agencyId)
        expect(property.agency_id).not.toBe(testUsers.agencyB.agencyId)
      })

      await supabase.auth.signOut()
    })

    test('User from Agency B cannot see properties from Agency A', async () => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyB.email,
        password: testUsers.agencyB.password,
      })

      if (authError || !authData.user) {
        console.warn('⚠️  Test user no existe. Crea usuarios de test primero.')
        return
      }

      const { data: properties, error } = await supabase
        .from('properties')
        .select('id, agency_id')

      expect(error).toBeNull()

      // TODAS las propiedades deben ser de Agency B únicamente
      properties?.forEach(property => {
        expect(property.agency_id).toBe(testUsers.agencyB.agencyId)
        expect(property.agency_id).not.toBe(testUsers.agencyA.agencyId)
      })

      await supabase.auth.signOut()
    })

    test('User cannot insert property for another agency', async () => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyA.email,
        password: testUsers.agencyA.password,
      })

      if (!authData.user) return

      // Intentar crear propiedad para Agency B (no debería poder)
      const { data, error } = await supabase
        .from('properties')
        .insert({
          agency_id: testUsers.agencyB.agencyId, // ❌ Otra agencia
          title: 'Test Property - Should Fail',
          property_type: 'casa',
          operation_type: 'sale',
          status: 'draft',
          country: 'MX',
          currency: 'MXN',
          created_by: authData.user.id
        })
        .select()

      // Debe fallar o no insertar para la otra agencia
      if (data) {
        // Si se insertó, debe ser con el agency_id correcto (el suyo)
        expect(data[0].agency_id).toBe(testUsers.agencyA.agencyId)
        expect(data[0].agency_id).not.toBe(testUsers.agencyB.agencyId)
        
        // Limpiar
        await supabase.from('properties').delete().eq('id', data[0].id)
      } else {
        // O debe haber fallado con error
        expect(error).toBeTruthy()
      }

      await supabase.auth.signOut()
    })
  })

  describe('Contacts Isolation', () => {
    test('User cannot see contacts from other agencies', async () => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyA.email,
        password: testUsers.agencyA.password,
      })

      if (!authData.user) return

      const { data: contacts, error } = await supabase
        .from('contacts')
        .select('id, agency_id')

      expect(error).toBeNull()

      // Todos los contactos deben ser de su agencia
      contacts?.forEach(contact => {
        expect(contact.agency_id).toBe(testUsers.agencyA.agencyId)
      })

      await supabase.auth.signOut()
    })
  })

  describe('Tasks Isolation', () => {
    test('User cannot see tasks assigned to users from other agencies', async () => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyA.email,
        password: testUsers.agencyA.password,
      })

      if (!authData.user) return

      // Obtener todas las tareas visibles
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id,
          assigned_to,
          user_profiles!tasks_assigned_to_fkey (
            agency_id
          )
        `)

      // Verificar que todas las tareas sean de usuarios de su agencia
      tasks?.forEach((task: any) => {
        expect(task.user_profiles.agency_id).toBe(testUsers.agencyA.agencyId)
      })

      await supabase.auth.signOut()
    })
  })

  describe('User Profiles Isolation', () => {
    test('User can only see profiles from their agency', async () => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyA.email,
        password: testUsers.agencyA.password,
      })

      if (!authData.user) return

      const { data: profiles, error } = await supabase
        .from('user_profiles')
        .select('id, agency_id')

      expect(error).toBeNull()

      // Todos los perfiles deben ser de su agencia
      profiles?.forEach(profile => {
        expect(profile.agency_id).toBe(testUsers.agencyA.agencyId)
      })

      await supabase.auth.signOut()
    })
  })

  describe('Broadcasts Isolation', () => {
    test('User cannot see broadcasts from other agencies', async () => {
      const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
      
      const { data: authData } = await supabase.auth.signInWithPassword({
        email: testUsers.agencyA.email,
        password: testUsers.agencyA.password,
      })

      if (!authData.user) return

      const { data: broadcasts, error } = await supabase
        .from('broadcasts')
        .select('id, agency_id')

      expect(error).toBeNull()

      // Todos los broadcasts deben ser de su agencia
      broadcasts?.forEach(broadcast => {
        expect(broadcast.agency_id).toBe(testUsers.agencyA.agencyId)
      })

      await supabase.auth.signOut()
    })
  })
})

describe('API Endpoint Security', () => {
  const API_BASE = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  test('/api/seed should be blocked in production', async () => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('⏭️  Skipping: Solo aplica en producción')
      return
    }

    const response = await fetch(`${API_BASE}/api/seed`)
    
    // En producción debe retornar 404
    expect(response.status).toBe(404)
  })

  test('/api/whatsapp/send requires authentication', async () => {
    const response = await fetch(`${API_BASE}/api/whatsapp/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: '+52123456789',
        message: 'Test'
      })
    })

    // Sin auth debe retornar 401
    expect(response.status).toBe(401)
  })

  test('/api/broadcast/create requires authentication', async () => {
    const response = await fetch(`${API_BASE}/api/broadcast/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test Broadcast',
        message_content: 'Test'
      })
    })

    // Sin auth debe retornar 401
    expect(response.status).toBe(401)
  })
})
