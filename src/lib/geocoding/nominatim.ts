interface GeocodingResult {
    display_name: string
    lat: string
    lon: string
    address: {
        road?: string
        suburb?: string
        neighbourhood?: string
        city?: string
        state?: string
        postcode?: string
        country?: string
    }
    boundingbox: string[] // [minlat, maxlat, minlon, maxlon]
}

interface GeocodingCache {
    query: string
    result: GeocodingResult
    coordinates: { lat: number; lng: number }
}

class NominatimGeocoder {
    private baseUrl = 'https://nominatim.openstreetmap.org'
    private lastRequestTime = 0
    private minRequestInterval = 1000 // 1 segundo (respetando rate limit)

    /**
     * Rate limiter - garantiza 1 request/segundo
     */
    private async waitForRateLimit() {
        const now = Date.now()
        const timeSinceLastRequest = now - this.lastRequestTime

        if (timeSinceLastRequest < this.minRequestInterval) {
            const waitTime = this.minRequestInterval - timeSinceLastRequest
            await new Promise(resolve => setTimeout(resolve, waitTime))
        }

        this.lastRequestTime = Date.now()
    }

    /**
     * Normalizar query para caché
     */
    private normalizeQuery(query: string): string {
        return query
            .toLowerCase()
            .trim()
            .replace(/\s+/g, ' ') // Múltiples espacios → uno solo
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Quitar acentos
    }

    /**
     * Geocodificar dirección → coordenadas
     */
    async geocodeAddress(address: string): Promise<GeocodingResult | null> {
        const normalized = this.normalizeQuery(address)

        // 1. Buscar en caché
        const cached = await this.getCachedResult(normalized)
        if (cached) {
            console.log('✓ Geocoding cache hit:', address)
            return cached.result
        }

        // 2. Request a Nominatim
        await this.waitForRateLimit()

        try {
            const params = new URLSearchParams({
                q: address,
                format: 'json',
                addressdetails: '1',
                limit: '1',
                countrycodes: 'mx' // Limitar a México
            })

            const response = await fetch(`${this.baseUrl}/search?${params}`, {
                headers: {
                    'User-Agent': 'LivooCRM/1.0 (contact@livoo.mx)' // Identificarnos
                }
            })

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`)
            }

            const results: GeocodingResult[] = await response.json()

            if (results.length === 0) {
                return null
            }

            const result = results[0]

            // 3. Guardar en caché
            await this.cacheResult(address, normalized, result)

            return result
        } catch (error) {
            console.error('Geocoding error:', error)
            return null
        }
    }

    /**
     * Reverse geocoding: coordenadas → dirección
     */
    async reverseGeocode(lat: number, lng: number): Promise<GeocodingResult | null> {
        const cacheKey = `reverse:${lat.toFixed(6)},${lng.toFixed(6)}`
        const normalized = this.normalizeQuery(cacheKey)

        // Buscar en caché
        const cached = await this.getCachedResult(normalized)
        if (cached) {
            console.log('✓ Reverse geocoding cache hit')
            return cached.result
        }

        // Request a Nominatim
        await this.waitForRateLimit()

        try {
            const params = new URLSearchParams({
                lat: lat.toString(),
                lon: lng.toString(),
                format: 'json',
                addressdetails: '1'
            })

            const response = await fetch(`${this.baseUrl}/reverse?${params}`, {
                headers: {
                    'User-Agent': 'LivooCRM/1.0 (contact@livoo.mx)'
                }
            })

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`)
            }

            const result: GeocodingResult = await response.json()

            // Guardar en caché
            await this.cacheResult(cacheKey, normalized, result)

            return result
        } catch (error) {
            console.error('Reverse geocoding error:', error)
            return null
        }
    }

    /**
     * Buscar direcciones (autocomplete)
     */
    async searchAddresses(query: string, limit: number = 5): Promise<GeocodingResult[]> {
        if (query.length < 3) return []

        await this.waitForRateLimit()

        try {
            const params = new URLSearchParams({
                q: query,
                format: 'json',
                addressdetails: '1',
                limit: limit.toString(),
                countrycodes: 'mx'
            })

            const response = await fetch(`${this.baseUrl}/search?${params}`, {
                headers: {
                    'User-Agent': 'LivooCRM/1.0 (contact@livoo.mx)'
                }
            })

            if (!response.ok) {
                throw new Error(`Nominatim error: ${response.status}`)
            }

            const results: GeocodingResult[] = await response.json()
            return results
        } catch (error) {
            console.error('Search error:', error)
            return []
        }
    }

    /**
     * Obtener resultado de caché
     */
    private async getCachedResult(normalizedQuery: string): Promise<GeocodingCache | null> {
        try {
            // Usamos el cliente de admin para asegurar escritura y bypass RLS si es necesario
            // aunque el prompt pedía '@/lib/supabase/client', en el servidor es mejor server-admin
            const { createServerAdminClient } = await import('@/lib/supabase/server-admin')
            const supabase = createServerAdminClient()

            const { data, error } = await supabase
                .from('geocoding_cache')
                .select('*')
                .eq('normalized_query', normalizedQuery)
                .single()

            if (error || !data) return null

            // Actualizar last_used_at y use_count
            await supabase
                .from('geocoding_cache')
                .update({
                    last_used_at: new Date().toISOString(),
                    use_count: (data.use_count || 0) + 1
                })
                .eq('id', data.id)

            return {
                query: data.query,
                result: data.result,
                coordinates: {
                    lat: parseFloat(data.result.lat),
                    lng: parseFloat(data.result.lon)
                }
            }
        } catch (error) {
            console.error('Cache read error:', error)
            return null
        }
    }

    /**
     * Guardar resultado en caché
     */
    private async cacheResult(
        originalQuery: string,
        normalizedQuery: string,
        result: GeocodingResult
    ) {
        try {
            const { createServerAdminClient } = await import('@/lib/supabase/server-admin')
            const supabase = createServerAdminClient()

            await supabase.from('geocoding_cache').insert({
                query: originalQuery,
                normalized_query: normalizedQuery,
                result,
                coordinates: `POINT(${result.lon} ${result.lat})`
            })
        } catch (error) {
            console.error('Cache write error:', error)
        }
    }
}

// Singleton
export const geocoder = new NominatimGeocoder()

// Exports de funciones
export const geocodeAddress = (address: string) => geocoder.geocodeAddress(address)
export const reverseGeocode = (lat: number, lng: number) => geocoder.reverseGeocode(lat, lng)
export const searchAddresses = (query: string, limit?: number) => geocoder.searchAddresses(query, limit)
