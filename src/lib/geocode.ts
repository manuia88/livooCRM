/**
 * Geocodificación con Nominatim (OpenStreetMap) — 100% GRATIS, sin API key, sin coste.
 * - Nominatim: gratuito (política: 1 petición/segundo en uso intenso).
 * - Tiles del mapa: OpenStreetMap, también gratuitos.
 *
 * Caché en memoria para no repetir la misma dirección y reducir peticiones.
 */

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search'
const USER_AGENT = 'LivooCRM/1.0 (contacto@livoo.mx)'

const CACHE_MAX = 500
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 días
const geocodeCache = new Map<string, { result: GeocodeResult; expires: number }>()

export interface GeocodeResult {
  lat: number
  lng: number
  display_name?: string
}

/**
 * Construye una dirección en una sola línea a partir de partes.
 * Útil cuando el formulario tiene campos separados (calle, colonia, ciudad, etc.).
 */
export function buildAddressFromParts(parts: {
  address?: string | null
  street?: string | null
  exterior_number?: string | null
  interior_number?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
  country?: string | null
}): string {
  const street = parts.address || parts.street || ''
  const num = [parts.exterior_number, parts.interior_number].filter(Boolean).join(' ')
  const streetLine = [street, num].filter(Boolean).join(' ')
  const colonia = parts.neighborhood || ''
  const city = parts.city || ''
  const state = parts.state || ''
  const cp = parts.postal_code || ''
  const country = parts.country || 'México'
  const bits = [streetLine, colonia, city, state, cp, country].filter(Boolean)
  return bits.join(', ')
}

function cacheGet(key: string): GeocodeResult | null {
  const entry = geocodeCache.get(key)
  if (!entry) return null
  if (Date.now() > entry.expires) {
    geocodeCache.delete(key)
    return null
  }
  return entry.result
}

function cacheSet(key: string, result: GeocodeResult) {
  if (geocodeCache.size >= CACHE_MAX) {
    const firstKey = geocodeCache.keys().next().value
    if (firstKey) geocodeCache.delete(firstKey)
  }
  geocodeCache.set(key, { result, expires: Date.now() + CACHE_TTL_MS })
}

/**
 * Geocodifica una dirección con Nominatim.
 * Devuelve { lat, lng } o null si no hay resultados.
 * Usa caché en memoria para no pagar ni abusar del servicio gratuito.
 */
export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  const trimmed = address?.trim()
  if (!trimmed) return null

  const cacheKey = trimmed.toLowerCase().replace(/\s+/g, ' ')
  const cached = cacheGet(cacheKey)
  if (cached) return cached

  const params = new URLSearchParams({
    q: trimmed,
    format: 'json',
    limit: '1',
    countrycodes: 'mx', // priorizar México
  })

  const res = await fetch(`${NOMINATIM_URL}?${params.toString()}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'User-Agent': USER_AGENT,
    },
    // cache para no repetir en el mismo request si se usa varias veces
    next: { revalidate: 0 },
  })

  if (!res.ok) return null

  const data = await res.json()
  if (!Array.isArray(data) || data.length === 0) return null

  const first = data[0]
  const lat = parseFloat(first.lat)
  const lng = parseFloat(first.lon)
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null

  const result: GeocodeResult = {
    lat,
    lng,
    display_name: first.display_name,
  }
  cacheSet(cacheKey, result)
  return result
}

/**
 * Geocodifica a partir de partes de dirección (para uso al guardar propiedad).
 * Construye la dirección con buildAddressFromParts y llama a geocodeAddress.
 */
export async function geocodeFromParts(parts: Parameters<typeof buildAddressFromParts>[0]): Promise<GeocodeResult | null> {
  const address = buildAddressFromParts(parts)
  return geocodeAddress(address)
}
