import { NextRequest, NextResponse } from 'next/server'
import { geocodeAddress, reverseGeocode, searchAddresses } from '@/lib/geocoding/nominatim'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    try {
        switch (action) {
            case 'geocode': {
                const address = searchParams.get('address')
                if (!address) {
                    return NextResponse.json(
                        { error: 'Address is required' },
                        { status: 400 }
                    )
                }

                const result = await geocodeAddress(address)
                return NextResponse.json({ result })
            }

            case 'reverse': {
                const lat = searchParams.get('lat')
                const lng = searchParams.get('lng')

                if (!lat || !lng) {
                    return NextResponse.json(
                        { error: 'Lat and lng are required' },
                        { status: 400 }
                    )
                }

                const result = await reverseGeocode(parseFloat(lat), parseFloat(lng))
                return NextResponse.json({ result })
            }

            case 'search': {
                const query = searchParams.get('query')
                const limit = parseInt(searchParams.get('limit') || '5')

                if (!query) {
                    return NextResponse.json(
                        { error: 'Query is required' },
                        { status: 400 }
                    )
                }

                const results = await searchAddresses(query, limit)
                return NextResponse.json({ results })
            }

            default:
                return NextResponse.json(
                    { error: 'Invalid action. Use: geocode, reverse, or search' },
                    { status: 400 }
                )
        }
    } catch (error) {
        console.error('Geocoding API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
