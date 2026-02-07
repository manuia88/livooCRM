#!/usr/bin/env tsx
/**
 * Inserta 3 propiedades de ejemplo: Renta, Venta o Renta, Oficina.
 * Usa SERVICE_ROLE_KEY (bypass RLS). Toma el primer usuario con agencia como productor.
 */

import { createClient } from '@supabase/supabase-js'
import * as path from 'path'
import * as dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY)

const SEED_PROPERTIES = [
  {
    title: 'Departamento en Renta',
    description: 'Departamento amplio en zona céntrica. Incluye estacionamiento y amenidades.',
    property_type: 'departamento',
    operation_type: 'renta',
    status: 'active',
    address: { street: 'Av. Amsterdam 456, Condesa' },
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
    address: { street: 'Calle Colima 123, Roma Norte' },
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
    address: { street: 'Av. Presidente Masaryk 789, Polanco' },
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

async function main() {
  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, agency_id')
    .not('agency_id', 'is', null)
    .limit(1)
    .single()

  if (profileError || !profile) {
    console.error('❌ No se encontró ningún usuario con agencia en user_profiles.', profileError?.message)
    process.exit(1)
  }

  console.log(`✅ Usando productor: ${profile.id}, agencia: ${profile.agency_id}`)

  for (const row of SEED_PROPERTIES) {
    const { data, error } = await supabase
      .from('properties')
      .insert({
        ...row,
        agency_id: profile.agency_id,
        producer_id: profile.id,
        shared_in_mls: row.mls_shared,
      })
      .select('id, title')
      .single()

    if (error) {
      console.error(`❌ Error creando "${row.title}":`, error.message)
      process.exit(1)
    }
    console.log(`✅ Creada: ${data!.title} (${data!.id})`)
  }

  console.log('\n✅ Listo. 3 propiedades agregadas y contabilizadas.')
}

main()
