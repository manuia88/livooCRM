import * as cheerio from 'cheerio'
import { BaseScraper, ScrapedProperty, ScrapingFilters } from './base-scraper'

/**
 * Scraper for Inmuebles24 (inmuebles24.com).
 *
 * NOTE: CSS selectors here are approximations based on the site's publicly
 * visible structure and may need updating if the portal changes its markup.
 */
export class Inmuebles24Scraper extends BaseScraper {
  constructor() {
    super('inmuebles24', 'https://www.inmuebles24.com')
  }

  getSearchUrl(filters: ScrapingFilters): string {
    const city = filters.city || 'ciudad-de-mexico'
    const operation = filters.operation === 'renta' ? 'departamentos-en-renta' : 'inmuebles-en-venta'
    const page = filters.page || 1

    // Inmuebles24 uses pagina-N.html style pagination
    return `${this.baseUrl}/${operation}/${city}/pagina-${page}.html`
  }

  async scrapeListingPage(filters: ScrapingFilters): Promise<ScrapedProperty[]> {
    const url = this.getSearchUrl(filters)
    console.log(`[Inmuebles24] Scraping page: ${url}`)

    const html = await this.fetchHtml(url)
    const $ = cheerio.load(html)
    const properties: ScrapedProperty[] = []

    // Try multiple possible selectors for listing cards
    const cardSelectors = [
      '[data-qa="posting PROPERTY"]',
      '.postings-container .posting-card',
      '.listing-card',
      'div[data-posting-type]'
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
          console.error('[Inmuebles24] Error parsing listing card:', error)
        }
      })
    }

    console.log(`[Inmuebles24] Found ${properties.length} listings on page`)
    return properties
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private parseListingCard($: cheerio.CheerioAPI, $card: cheerio.Cheerio<any>): ScrapedProperty | null {
    // Extract the link and ID
    const $link = $card.find('a[href*="/propiedades/"]').first()
    const href = $link.attr('href') || $card.find('a').first().attr('href') || ''
    const externalUrl = href.startsWith('http') ? href : `${this.baseUrl}${href}`

    // External ID from URL or data attribute
    const externalId = $card.attr('data-id')
      || $card.attr('data-posting-id')
      || this.extractIdFromUrl(href)

    if (!externalId) return null

    // Title
    const title = $card.find('[data-qa="POSTING_CARD_TITLE"], .posting-title, h2, h3').first().text().trim()
    if (!title) return null

    // Price
    const priceText = $card.find('[data-qa="POSTING_CARD_PRICE"], .price, .posting-price').first().text().trim()
    const price = this.parsePrice(priceText)

    // Determine operation type
    const isRenta = priceText.toLowerCase().includes('/mes')
      || externalUrl.includes('renta')
      || $card.text().toLowerCase().includes('alquiler')
    const operationType = isRenta ? 'renta' : 'venta'

    // Specs (bedrooms, bathrooms, area)
    const specsText = $card.find('[data-qa="POSTING_CARD_FEATURES"], .posting-features, .specs').text()
    const bedrooms = this.extractBedrooms(specsText)
    const bathrooms = this.extractBathrooms(specsText)
    const constructionM2 = this.extractArea(specsText)

    // Location
    const locationText = $card.find('[data-qa="POSTING_CARD_LOCATION"], .posting-location, .location').first().text().trim()
    const address = this.parseLocation(locationText)

    // Main image
    const mainImage = $card.find('img').attr('data-src')
      || $card.find('img').attr('src')
      || $card.find('[style*="background-image"]').attr('style')?.match(/url\(["']?([^"')]+)["']?\)/)?.[1]
    const images = mainImage ? [mainImage] : []

    return {
      externalId,
      externalUrl,
      title,
      propertyType: this.inferPropertyType(title),
      operationType,
      price,
      currency: 'MXN',
      bedrooms,
      bathrooms,
      constructionM2,
      address,
      images
    }
  }

  async scrapeDetailPage(url: string): Promise<Partial<ScrapedProperty>> {
    console.log(`[Inmuebles24] Scraping detail: ${url}`)

    const html = await this.fetchHtml(url)
    const $ = cheerio.load(html)

    // Description
    const description = $('[data-qa="POSTING_DESCRIPTION"], .description-content, #description').first().text().trim()

    // All images
    const images: string[] = []
    $('[data-qa="GALLERY"] img, .gallery-image img, .carousel img').each((_, img) => {
      const src = $(img).attr('data-src') || $(img).attr('src')
      if (src && !src.includes('placeholder')) {
        images.push(src)
      }
    })

    // Features table
    const features: Record<string, unknown> = {}
    $('[data-qa="FEATURES"] li, .feature-list li, .property-features li').each((_, li) => {
      const text = $(li).text().trim()
      const colonIndex = text.indexOf(':')
      if (colonIndex > 0) {
        const key = text.slice(0, colonIndex).trim().toLowerCase()
        const value = text.slice(colonIndex + 1).trim()
        features[key] = value
      }
    })

    // Land area (if available separately)
    const landM2Text = $(':contains("terreno")').filter('li, span, div').text()
    const landM2 = this.parseArea(landM2Text)

    // Parking spaces
    const parkingText = $(':contains("estacionamiento")').filter('li, span, div').text()
    const parkingSpaces = this.parseInteger(parkingText)

    // Coordinates from embedded map / JSON-LD
    let latitude: number | undefined
    let longitude: number | undefined

    // Try JSON-LD first
    $('script[type="application/ld+json"]').each((_, script) => {
      try {
        const json = JSON.parse($(script).html() || '')
        if (json.geo) {
          latitude = parseFloat(json.geo.latitude)
          longitude = parseFloat(json.geo.longitude)
        }
      } catch { /* ignore parse errors */ }
    })

    return {
      description,
      images: images.length > 0 ? images : undefined,
      features,
      landM2,
      parkingSpaces,
      latitude,
      longitude
    }
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private extractIdFromUrl(url: string): string {
    const match = url.match(/(\d{5,})/)
    return match ? match[1] : ''
  }

  private extractBedrooms(text: string): number | undefined {
    const match = text.match(/(\d+)\s*(?:rec[áa]maras?|dormitorios?|hab\.?)/i)
    return match ? parseInt(match[1], 10) : undefined
  }

  private extractBathrooms(text: string): number | undefined {
    const match = text.match(/(\d+(?:\.\d)?)\s*(?:ba[ñn]os?)/i)
    return match ? parseFloat(match[1]) : undefined
  }

  private extractArea(text: string): number | undefined {
    const match = text.match(/([\d,.]+)\s*m[²2]/i)
    if (!match) return undefined
    const num = parseFloat(match[1].replace(',', ''))
    return isNaN(num) ? undefined : num
  }
}
