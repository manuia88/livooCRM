/**
 * Scraping system entry point.
 * Provides factory function to get the right scraper and orchestrates
 * multi-page scraping jobs.
 */

import { BaseScraper, ScrapedProperty, ScrapingFilters, ScrapingProgress } from './base-scraper'
import { Inmuebles24Scraper } from './inmuebles24-scraper'
import { VivanunciosScraper } from './vivanuncios-scraper'

export type PortalSource = 'inmuebles24' | 'vivanuncios' | 'lamudi' | 'properati'

const SUPPORTED_SCRAPERS: Record<string, () => BaseScraper> = {
  inmuebles24: () => new Inmuebles24Scraper(),
  vivanuncios: () => new VivanunciosScraper()
}

export function getScraper(source: PortalSource): BaseScraper {
  const factory = SUPPORTED_SCRAPERS[source]
  if (!factory) {
    throw new Error(`Portal "${source}" is not supported. Available: ${Object.keys(SUPPORTED_SCRAPERS).join(', ')}`)
  }
  return factory()
}

export function getSupportedPortals(): { id: PortalSource; name: string; enabled: boolean }[] {
  return [
    { id: 'inmuebles24', name: 'Inmuebles24', enabled: true },
    { id: 'vivanuncios', name: 'Vivanuncios', enabled: true },
    { id: 'lamudi', name: 'Lamudi', enabled: false },
    { id: 'properati', name: 'Properati', enabled: false }
  ]
}

export interface ScrapeJobParams {
  source: PortalSource
  pages: number
  filters?: Omit<ScrapingFilters, 'page'>
}

/**
 * Run a scraping job across multiple pages.
 * Returns results page by page via an async generator for streaming progress.
 */
export async function* scrapePages(
  params: ScrapeJobParams
): AsyncGenerator<{ page: number; listings: ScrapedProperty[]; progress: ScrapingProgress }> {
  const scraper = getScraper(params.source)
  const progress: ScrapingProgress = {
    pagesScraped: 0,
    listingsFound: 0,
    listingsNew: 0,
    listingsUpdated: 0,
    listingsDuplicates: 0,
    errors: []
  }

  for (let page = 1; page <= params.pages; page++) {
    try {
      const listings = await scraper.scrapeListingPage({
        ...params.filters,
        page
      })

      progress.pagesScraped = page
      progress.listingsFound += listings.length

      yield { page, listings, progress: { ...progress } }

      // Pause between pages
      if (page < params.pages) {
        await new Promise(resolve => setTimeout(resolve, 2000))
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      progress.errors.push(`Page ${page}: ${message}`)
      console.error(`[${params.source}] Error on page ${page}:`, error)

      yield { page, listings: [], progress: { ...progress } }
    }
  }
}

// Re-exports
export type { ScrapedProperty, ScrapingFilters, ScrapingProgress } from './base-scraper'
