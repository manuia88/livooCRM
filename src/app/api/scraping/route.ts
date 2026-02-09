import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { scrapePages, PortalSource, ScrapedProperty } from '@/lib/scraping'

export const dynamic = 'force-dynamic'

const MAX_PAGES = 5

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Verify authenticated user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Get user's agency
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('agency_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'Sin agencia asignada' }, { status: 403 })
    }

    const body = await request.json()
    const source = body.source as PortalSource
    const pages = Math.min(body.pages || 1, MAX_PAGES)
    const city = body.city || 'ciudad-de-mexico'
    const operation = body.operation || 'venta'

    // Validate source
    const validSources: PortalSource[] = ['inmuebles24', 'vivanuncios']
    if (!validSources.includes(source)) {
      return NextResponse.json(
        { error: `Portal "${source}" no soportado. Disponibles: ${validSources.join(', ')}` },
        { status: 400 }
      )
    }

    // Create scraping job
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        agency_id: profile.agency_id,
        source,
        search_params: { city, operation, pages },
        status: 'running',
        pages_requested: pages,
        started_at: new Date().toISOString(),
        created_by: user.id
      })
      .select()
      .single()

    if (jobError) {
      console.error('Failed to create scraping job:', jobError)
      return NextResponse.json({ error: 'Error al crear trabajo de scraping' }, { status: 500 })
    }

    // Run scraping
    let totalNew = 0
    let totalUpdated = 0
    let totalDuplicates = 0
    let totalFound = 0
    let pagesScraped = 0

    try {
      for await (const { listings, progress } of scrapePages({
        source,
        pages,
        filters: { city, operation: operation as 'venta' | 'renta' }
      })) {
        pagesScraped = progress.pagesScraped
        totalFound = progress.listingsFound

        // Process each listing
        for (const listing of listings) {
          const result = await upsertListing(supabase, listing, source, profile.agency_id)
          if (result === 'new') totalNew++
          else if (result === 'updated') totalUpdated++
          else if (result === 'duplicate') totalDuplicates++
        }

        // Update job progress
        await supabase
          .from('scraping_jobs')
          .update({
            pages_scraped: pagesScraped,
            listings_found: totalFound,
            listings_new: totalNew,
            listings_updated: totalUpdated,
            listings_duplicates: totalDuplicates
          })
          .eq('id', job.id)
      }

      // Mark job as completed
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'completed',
          pages_scraped: pagesScraped,
          listings_found: totalFound,
          listings_new: totalNew,
          listings_updated: totalUpdated,
          listings_duplicates: totalDuplicates,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      await supabase
        .from('scraping_jobs')
        .update({
          status: 'failed',
          error_message: message,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)

      return NextResponse.json({
        success: false,
        job_id: job.id,
        error: message,
        partial_results: { listings_found: totalFound, listings_new: totalNew }
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      job_id: job.id,
      listings_found: totalFound,
      listings_new: totalNew,
      listings_updated: totalUpdated,
      listings_duplicates: totalDuplicates
    })

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error desconocido'
    console.error('Scraping API error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// GET: List scraping jobs
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('user_profiles')
      .select('agency_id')
      .eq('user_id', user.id)
      .single()

    if (!profile?.agency_id) {
      return NextResponse.json({ error: 'Sin agencia' }, { status: 403 })
    }

    const { data: jobs, error } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('agency_id', profile.agency_id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return NextResponse.json({ jobs })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────

async function upsertListing(
  supabase: Awaited<ReturnType<typeof createClient>>,
  listing: ScrapedProperty,
  source: string,
  agencyId: string
): Promise<'new' | 'updated' | 'duplicate'> {
  // Check if exists
  const { data: existing } = await supabase
    .from('scraped_listings')
    .select('id, title, price')
    .eq('source', source)
    .eq('external_id', listing.externalId)
    .single()

  if (existing) {
    // Only update if price changed
    if (existing.price !== listing.price || existing.title !== listing.title) {
      await supabase
        .from('scraped_listings')
        .update({
          title: listing.title,
          price: listing.price,
          images: listing.images,
          scraped_at: new Date().toISOString()
        })
        .eq('id', existing.id)
      return 'updated'
    }
    return 'duplicate'
  }

  // Insert new
  await supabase
    .from('scraped_listings')
    .insert({
      agency_id: agencyId,
      source,
      external_id: listing.externalId,
      external_url: listing.externalUrl,
      title: listing.title,
      description: listing.description,
      property_type: listing.propertyType,
      operation_type: listing.operationType,
      price: listing.price,
      currency: listing.currency || 'MXN',
      bedrooms: listing.bedrooms,
      bathrooms: listing.bathrooms,
      construction_m2: listing.constructionM2,
      land_m2: listing.landM2,
      address: listing.address || {},
      latitude: listing.latitude,
      longitude: listing.longitude,
      images: listing.images || [],
      features: listing.features || {},
      raw_data: listing.rawData || {}
    })

  return 'new'
}
