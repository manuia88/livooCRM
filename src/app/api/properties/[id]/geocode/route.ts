import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { geocodeFromParts } from '@/lib/geocode'

export const dynamic = 'force-dynamic'

/**
 * POST /api/properties/[id]/geocode
 *
 * Lee la propiedad, construye la dirección con sus campos, geocodifica
 * con Nominatim y actualiza lat/lng (o coordinates) en la propiedad.
 * Puerta abierta para "geocodificar al guardar" o desde un botón "Obtener ubicación".
 *
 * Respuesta: { lat, lng } y la propiedad queda actualizada.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient()
  const { id } = await params

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: property, error: fetchError } = await supabase
    .from('properties')
    .select('id, address, neighborhood, city, state, postal_code, street, exterior_number, interior_number')
    .eq('id', id)
    .single()

  if (fetchError || !property) {
    return NextResponse.json({ error: 'Property not found' }, { status: 404 })
  }

  const address = typeof property.address === 'string'
    ? property.address
    : [property.street, property.exterior_number, property.interior_number]
        .filter(Boolean)
        .join(' ')
  const fullAddress = address
    ? `${address}, ${[property.neighborhood, property.city, property.state, property.postal_code, 'México'].filter(Boolean).join(', ')}`
    : [property.neighborhood, property.city, property.state, property.postal_code, 'México'].filter(Boolean).join(', ')

  if (!fullAddress.trim()) {
    return NextResponse.json({ error: 'Property has no address to geocode' }, { status: 400 })
  }

  try {
    const result = await geocodeFromParts({
      address: fullAddress,
      street: property.street,
      exterior_number: property.exterior_number,
      interior_number: property.interior_number,
      neighborhood: property.neighborhood,
      city: property.city,
      state: property.state,
      postal_code: property.postal_code,
      country: 'México',
    })

    if (!result) {
      return NextResponse.json({ error: 'No geocode results', lat: null, lng: null }, { status: 200 })
    }

    const { error: updateError } = await supabase
      .from('properties')
      .update({
        lat: result.lat,
        lng: result.lng,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (updateError) {
      console.error('[geocode] update property', updateError)
      return NextResponse.json({ error: 'Failed to update property coordinates' }, { status: 500 })
    }

    return NextResponse.json({ lat: result.lat, lng: result.lng })
  } catch (e) {
    console.error('[geocode]', e)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
