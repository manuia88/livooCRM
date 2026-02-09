import * as cheerio from 'cheerio'
import { BaseScraper, ScrapedProperty, ScrapingFilters } from './base-scraper'

/**
 * Scraper for Vivanuncios (vivanuncios.com.mx).
 *
 * NOTE: Vivanuncios has been migrating/merging with other platforms.
 * Selectors may need updating as the site evolves.
 */
export class VivanunciosScraper extends BaseScraper {
  constructor() {
    super('vivanuncios', 'https://www.vivanuncios.com.mx')
  }

  getSearchUrl(filters: ScrapingFilters): string {
    const city = filters.city || 'distrito-federal'
    const operation = filters.operation === 'renta' ? 'renta' : 'venta'
    const page = filters.page || 1

    return `${this.baseUrl}/s-${operation}-inmuebles/${city}/page-${page}/v1c1097l${page}p${page}`
  }

  async scrapeListingPage(filters: ScrapingFilters): Promise<ScrapedProperty[]> {
    const url = this.getSearchUrl(filters)
    console.log(`[Vivanuncios] Scraping page: ${url}`)

    const html = await this.fetchHtml(url)
    const $ = cheerio.load(html)
    const properties: ScrapedProperty[] = []

    // Try multiple selectors
    const cardSelectors = [
      '.ad-listitem',
      '.ad-card',
      '[data-ad-id]',
      '.search-result-item'
    ]

    let matchedSelector = ''
    for (const selector of cardSelectors) {
      if ($(selector).length > 0) {
        matchedSelector = selector
        break
      }
    }

    if (matchedSelector) {
      $(matchedSelector).each((_, element) => {
        try {
          const $card = $(element)
          const property = this.parseListingCard($, $card)
          if (property) {
            properties.push(property)
          }
        } catch (error) {
          console.error('[Vivanuncios] Error parsing listing card:', error)
        }
      })
    }

    console.log(`[Vivanuncios] Found ${properties.length} listings on page`)
    return properties
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseListingCard($: cheerio.CheerioAPI, $card: cheerio.Cheerio<any>): ScrapedProperty | null {
    // External ID
    const externalId = $card.attr('data-ad-id')
      || $card.attr('id')?.replace(/^ad-/, '')
      || ''

    // Link
    const $link = $card.find('a[href*="/inmueble"]').first()
    const href = $link.attr('href') || $card.find('a').first().attr('href') || ''
    const externalUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`

    if (!externalId && !href) return null

    // Title
    const title = $card.find('.ad-title, .item-title, h2, h3').first().text().trim()
    if (!title) return null

    // Price
    const priceText = $card.find('.ad-price, .item-price, .price').first().text().trim()
    const price = this.parsePrice(priceText)

    // Operation type
    const isRenta = priceText.toLowerCase().includes('/mes')
      || externalUrl.includes('renta')
    const operationType = isRenta ? 'renta' : 'venta'

    // Specs
    const specsText = $card.find('.ad-attributes, .item-features, .specs').text()
    const { bedrooms, bathrooms, m2 } = this.parseSpecs(specsText)

    // Location
    const locationText = $card.find('.ad-location, .item-location, .location').first().text().trim()
    const address = this.parseLocation(locationText)

    // Image
    const mainImage = $card.find('img').attr('data-src')
      || $card.find('img').attr('src')
    const images = mainImage && !mainImage.includes('placeholder') ? [mainImage] : []

    return {
      externalId: externalId || this.extractIdFromUrl(href),
      externalUrl,
      title,
      propertyType: this.inferPropertyType(title),
      operationType,
      price,
      currency: 'MXN',
      bedrooms,
      bathrooms,
      constructionM2: m2,
      address,
      images
    }
  }

  async scrapeDetailPage(url: string): Promise<Partial<ScrapedProperty>> {
    console.log(`[Vivanuncios] Scraping detail: ${url}`)

    const html = await this.fetchHtml(url)
    const $ = cheerio.load(html)

    const description = $('.ad-description, .item-description, #description').first().text().trim()

    const images: string[] = []
    $('.gallery img, .image-gallery img, .carousel img').each((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src')
      if (src && !src.includes('placeholder')) {
        images.push(src)
      }
    })

    const features: Record<string, unknown> = {}
    $('.feature-list li, .ad-attributes li, .item-params li').each((_, li) => {
      const text = $(li).text().trim()
      const colonIndex = text.indexOf(':')
      if (colonIndex > 0) {
        const key = text.slice(0, colonIndex).trim().toLowerCase()
        const value = text.slice(colonIndex + 1).trim()
        features[key] = value
      }
    })

    // Try to extract coords from JSON-LD
    let latitude: number | undefined
    let longitude: number | undefined
    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const json = JSON.parse($(script).html() || '')
        if (json.geo) {
          latitude = parseFloat(json.geo.latitude)
          longitude = parseFloat(json.geo.longitude)
        }
      } catch { /* ignore */ }
    })

    return {
      description,
      images: images.length > 0 ? images : undefined,
      features,
      latitude,
      longitude
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private parseSpecs(text: string): { bedrooms?: number; bathrooms?: number; m2?: number } {
    const bedsMatch = text.match(/(\d+)\s*(?:rec[áa]maras?|dormitorios?|hab)/i)
    const bathsMatch = text.match(/(\d+(?:\.\d)?)\s*(?:ba[ñn]os?)/i)
    const m2Match = text.match(/([\d,.]+)\s*m[²2]/i)

    return {
      bedrooms: bedsMatch ? parseInt(bedsMatch[1], 10) : undefined,
      bathrooms: bathsMatch ? parseFloat(bathsMatch[1]) : undefined,
      m2: m2Match ? parseFloat(m2Match[1].replace(',', '')) : undefined
    }
  }

  private extractIdFromUrl(url: string): string {
    const match = url.match(/(\d{5,})/)
    return match ? match[1] : `vn-${Date.now()}`
  }
}
