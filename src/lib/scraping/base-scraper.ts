/**
 * Base scraper with rate limiting, retry logic, and common parsing utilities.
 * All portal-specific scrapers extend this class.
 */

export interface ScrapedProperty {
  externalId: string
  externalUrl: string
  title: string
  description?: string
  propertyType?: string
  operationType: 'venta' | 'renta' | 'traspaso'
  price?: number
  currency?: string
  bedrooms?: number
  bathrooms?: number
  parkingSpaces?: number
  constructionM2?: number
  landM2?: number
  address?: {
    street?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
  }
  latitude?: number
  longitude?: number
  images?: string[]
  features?: Record<string, unknown>
  rawData?: Record<string, unknown>
}

export interface ScrapingFilters {
  city?: string
  state?: string
  operation?: 'venta' | 'renta'
  propertyType?: string
  minPrice?: number
  maxPrice?: number
  page?: number
}

export interface ScrapingProgress {
  pagesScraped: number
  listingsFound: number
  listingsNew: number
  listingsUpdated: number
  listingsDuplicates: number
  errors: string[]
}

export abstract class BaseScraper {
  protected source: string
  protected baseUrl: string
  protected rateLimitMs: number
  protected lastRequestTime = 0

  constructor(source: string, baseUrl: string, rateLimitMs = 1500) {
    this.source = source
    this.baseUrl = baseUrl
    this.rateLimitMs = rateLimitMs
  }

  /**
   * Enforce rate limiting between requests.
   */
  protected async waitForRateLimit(): Promise<void> {
    const now = Date.now()
    const elapsed = now - this.lastRequestTime

    if (elapsed < this.rateLimitMs) {
      await new Promise(resolve => setTimeout(resolve, this.rateLimitMs - elapsed))
    }

    this.lastRequestTime = Date.now()
  }

  /**
   * Fetch HTML with retry and rate limiting.
   */
  protected async fetchHtml(url: string, retries = 3): Promise<string> {
    await this.waitForRateLimit()

    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; LivooCRM/1.0; +https://livoocrm.com)',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'es-MX,es;q=0.9,en;q=0.5'
          },
          signal: AbortSignal.timeout(15000)
        })

        if (response.status === 429) {
          // Rate limited by server - back off significantly
          const backoff = (attempt + 1) * 5000
          console.warn(`Rate limited by ${this.source}, waiting ${backoff}ms`)
          await new Promise(resolve => setTimeout(resolve, backoff))
          continue
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        return await response.text()
      } catch (error) {
        const isLastAttempt = attempt === retries - 1
        if (isLastAttempt) throw error

        const backoff = 2000 * (attempt + 1)
        console.warn(`Attempt ${attempt + 1}/${retries} failed for ${url}, retrying in ${backoff}ms`)
        await new Promise(resolve => setTimeout(resolve, backoff))
      }
    }

    throw new Error(`All ${retries} attempts failed for ${url}`)
  }

  // ── Common parsing utilities ────────────────────────────────────────

  protected parsePrice(text: string): number | undefined {
    const cleaned = text.replace(/[^0-9.]/g, '')
    const num = parseFloat(cleaned)
    return isNaN(num) ? undefined : Math.round(num)
  }

  protected parseArea(text: string): number | undefined {
    const match = text.match(/([\d,.]+)\s*m[²2]/i)
    if (!match) return undefined
    const num = parseFloat(match[1].replace(',', ''))
    return isNaN(num) ? undefined : num
  }

  protected parseInteger(text: string): number | undefined {
    const match = text.match(/(\d+)/)
    return match ? parseInt(match[1], 10) : undefined
  }

  protected inferPropertyType(title: string): string {
    const lower = title.toLowerCase()
    if (lower.includes('casa')) return 'casa'
    if (lower.includes('departamento') || lower.includes('depto')) return 'departamento'
    if (lower.includes('terreno') || lower.includes('lote')) return 'terreno'
    if (lower.includes('local') && lower.includes('comercial')) return 'local_comercial'
    if (lower.includes('local')) return 'local_comercial'
    if (lower.includes('oficina')) return 'oficina'
    if (lower.includes('bodega') || lower.includes('nave')) return 'bodega'
    if (lower.includes('rancho') || lower.includes('hacienda')) return 'rancho'
    return 'otro'
  }

  protected parseLocation(text: string): ScrapedProperty['address'] {
    const parts = text.split(',').map(s => s.trim()).filter(Boolean)
    return {
      neighborhood: parts[0],
      city: parts[1],
      state: parts[2]
    }
  }

  // ── Abstract methods for each portal ────────────────────────────────

  abstract getSearchUrl(filters: ScrapingFilters): string
  abstract scrapeListingPage(filters: ScrapingFilters): Promise<ScrapedProperty[]>
  abstract scrapeDetailPage(url: string): Promise<Partial<ScrapedProperty>>

  /**
   * Get the source identifier for this scraper.
   */
  getSource(): string {
    return this.source
  }
}
