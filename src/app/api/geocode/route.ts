import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress, buildAddressFromParts } from '@/lib/geocode'

export const dynamic = 'force-dynamic'

/**
 * GET /api/geocode?address=...
 * o
 * POST /api/geocode body: { address: string } o { address, neighborhood, city, state, postal_code }
 *
 * Devuelve { lat, lng, display_name? } para usar al guardar la propiedad.
 * Nominatim (gratis); respeta 1 req/s en uso intenso.
 */
export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')?.trim()
  if (!address) {
    return NextResponse.json({ error: 'Query param "address" is required' }, { status: 400 })
  }

  try {
    const result = await geocodeAddress(address)
    if (!result) {
      return NextResponse.json({ error: 'No results', lat: null, lng: null }, { status: 200 })
    }
    return NextResponse.json(result)
  } catch (e) {
    console.error('[geocode]', e)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    if (body.address && typeof body.address === 'string') {
      const result = await geocodeAddress(body.address)
      if (!result) {
        return NextResponse.json({ error: 'No results', lat: null, lng: null }, { status: 200 })
      }
      return NextResponse.json(result)
    }

    if (body.neighborhood || body.city || body.street || body.address) {
      const fullAddress = buildAddressFromParts({
        address: body.address,
        street: body.street,
        exterior_number: body.exterior_number,
        interior_number: body.interior_number,
        neighborhood: body.neighborhood,
        city: body.city,
        state: body.state,
        postal_code: body.postal_code,
        country: body.country ?? 'México',
      })
      const result = await geocodeAddress(fullAddress)
      if (!result) {
        return NextResponse.json({ error: 'No results', lat: null, lng: null }, { status: 200 })
      }
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Body must include "address" or address parts' }, { status: 400 })
  } catch (e) {
    console.error('[geocode]', e)
    return NextResponse.json({ error: 'Geocoding failed' }, { status: 500 })
  }
}
