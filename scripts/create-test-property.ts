#!/usr/bin/env tsx
/**
 * Crear propiedad de prueba para Agency B
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

async function createTestProperty() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

  // Login como Agency B
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'test-agency-b@example.com',
    password: 'Test123456!'
  })

  if (authError || !authData.user) {
    console.error('❌ Error login:', authError?.message)
    return
  }

  console.log(`✅ Login exitoso: ${authData.user.email}`)

  // Obtener user profile para agency_id
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('agency_id')
    .eq('id', authData.user.id)
    .single()

  if (!profile) {
    console.error('❌ Profile no encontrado')
    return
  }

  console.log(`📦 Agency ID: ${profile.agency_id}`)

  // Crear propiedad de prueba
  const { data: property, error: propError } = await supabase
    .from('properties')
    .insert({
      title: 'Propiedad de Test Agency B',
      description: 'Test property for RLS verification',
      price: 1000000,
      property_type: 'casa',
      transaction_type: 'venta',
      status: 'disponible',
      agency_id: profile.agency_id
    })
    .select()
    .single()

  if (propError) {
    console.error('❌ Error creando propiedad:', propError.message)
    return
  }

  console.log('✅ Propiedad creada:', property.id)

  await supabase.auth.signOut()
}

createTestProperty()
