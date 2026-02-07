/**
 * Seed 3 propiedades de ejemplo: Renta, Venta o Renta, Oficina.
 * Identifica al usuario por sesión; inserta con service role para evitar fallos por RLS.
 */

import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createServerAdminClient } from '@/lib/supabase/server-admin'

const SEED_PROPERTIES = [
  {
    title: 'Departamento en Renta',
    description: 'Departamento amplio en zona céntrica. Incluye estacionamiento y amenidades.',
    property_type: 'departamento',
    operation_type: 'renta',
    status: 'active',
    address: 'Av. Amsterdam 456, Condesa',
    neighborhood: 'Condesa',
    city: 'Ciudad de México',
    state: 'CDMX',
    sale_price: null as number | null,
    rent_price: 28000,
    currency: 'MXN',
    bedrooms: 2,
    bathrooms: 2,
    parking_spaces: 1,
    construction_m2: 95,
    published_at: new Date().toISOString(),
    mls_shared: true,
  },
  {
    title: 'Casa en Venta o Renta',
    description: 'Casa con jardín, opción venta o renta. Ideal para familias.',
    property_type: 'casa',
    operation_type: 'ambos',
    status: 'active',
    address: 'Calle Colima 123, Roma Norte',
    neighborhood: 'Roma Norte',
    city: 'Ciudad de México',
    state: 'CDMX',
    sale_price: 5500000,
    rent_price: 35000,
    currency: 'MXN',
    bedrooms: 3,
    bathrooms: 2,
    parking_spaces: 2,
    construction_m2: 150,
    published_at: new Date().toISOString(),
    mls_shared: true,
  },
  {
    title: 'Oficina en Venta',
    description: 'Oficina en edificio corporativo. Lista para mudarse.',
    property_type: 'oficina',
    operation_type: 'venta',
    status: 'active',
    address: 'Av. Presidente Masaryk 789, Polanco',
    neighborhood: 'Polanco',
    city: 'Ciudad de México',
    state: 'CDMX',
    sale_price: 8900000,
    rent_price: null as number | null,
    currency: 'MXN',
    bedrooms: null as number | null,
    bathrooms: 2,
    parking_spaces: 2,
    construction_m2: 120,
    published_at: new Date().toISOString(),
    mls_shared: true,
  },
]

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'No autenticado' }, { status: 401 })
  }
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('agency_id')
    .eq('id', user.id)
    .single()
  if (!profile?.agency_id) {
    return NextResponse.json({ error: 'Usuario sin agencia' }, { status: 403 })
  }
  const inserted: { id: string; title: string }[] = []
  const admin = createServerAdminClient()

  for (const row of SEED_PROPERTIES) {
    const { sale_price, rent_price, published_at, mls_shared, address: addr, ...rest } = row
    const payload = {
      ...rest,
      agency_id: profile.agency_id,
      producer_id: user.id,
      sale_price: row.sale_price,
      rent_price: row.rent_price,
      published_at: row.published_at,
      mls_shared: row.mls_shared,
      shared_in_mls: row.mls_shared,
      address: typeof addr === 'string' ? { street: addr } : addr,
    }
    const { data, error } = await admin
      .from('properties')
      .insert(payload)
      .select('id, title')
      .single()

    if (error) {
      console.error('Seed property error:', error)
      const msg = error.message || ''
      const hint = /property_type|operation_type|check constraint/i.test(msg)
        ? ' Ejecuta la migración 20260209130000_properties_allow_spanish_enums.sql en Supabase (SQL Editor) para permitir venta/renta/ambos y casa/departamento/oficina.'
        : ''
      return NextResponse.json(
        { error: 'Error al crear propiedad' + hint, details: msg },
        { status: 500 }
      )
    }
    if (data) inserted.push({ id: data.id, title: data.title })
  }

  return NextResponse.json({
    success: true,
    message: 'Se agregaron 3 propiedades de ejemplo',
    properties: inserted,
  })
}
