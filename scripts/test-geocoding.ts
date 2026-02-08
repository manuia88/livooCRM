import { geocodeAddress, searchAddresses } from '../src/lib/geocoding/nominatim'

async function testGeocoding() {
    console.log('🚀 Starting Geocoding Service Verification...')

    // Test 1: Autocomplete
    console.log('\n--- Test 1: Autocomplete (Search) ---')
    const results = await searchAddresses('Polanco, CDMX', 3)
    console.log(`Found ${results.length} results for "Polanco, CDMX"`)
    results.forEach((r, i) => console.log(`${i + 1}: ${r.display_name}`))

    // Test 2: Geocode (should be cached if search matches)
    console.log('\n--- Test 2: Geocode Address ---')
    const start = Date.now()
    const result = await geocodeAddress('Av. Reforma 222, Mexico')
    const end = Date.now()
    console.log(`Geocoded in ${end - start}ms`)
    if (result) {
        console.log(`Result: ${result.display_name}`)
        console.log(`Coords: ${result.lat}, ${result.lon}`)
    }

    // Test 3: Cache Hit (should be much faster)
    console.log('\n--- Test 3: Cache Hit ---')
    const startCache = Date.now()
    const resultCache = await geocodeAddress('Av. Reforma 222, Mexico')
    const endCache = Date.now()
    console.log(`Geocoded (cached) in ${endCache - startCache}ms`)

    if (endCache - startCache < 100) {
        console.log('✅ Cache working correctly')
    } else {
        console.log('❌ Cache might not be working as expected')
    }

    // Test 4: Rate Limiting
    console.log('\n--- Test 4: Rate Limiting (Sequential Requests) ---')
    console.log('Making 3 requests, should take at least 2 seconds total...')
    const startRate = Date.now()
    await geocodeAddress('Calle 1, Mexico')
    await geocodeAddress('Calle 2, Mexico')
    await geocodeAddress('Calle 3, Mexico')
    const endRate = Date.now()
    console.log(`Total time for 3 new requests: ${endRate - startRate}ms`)

    if (endRate - startRate >= 2000) {
        console.log('✅ Rate limiting working correctly')
    } else {
        console.log('❌ Rate limiting might be too loose')
    }
}

// Note: This script needs to be run in an environment with DB access and Node.js
// Since I can't easily run it here with full Supabase context, I've designed it for manual/CI use.
// In this agent environment, I'll rely on code review and logic verification.
// testGeocoding()
