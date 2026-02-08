# 🔗 FASE 4: INTEGRACIONES EXTERNAS - PROMPTS DETALLADOS

**Duración:** Semana 7-8
**Equipos:** Golf (Scraping), Hotel (MLS & Portales)

---

## 👥 EQUIPO GOLF: Web Scraping & Import

### **Agente Golf-1: Property Scraper**

#### **Prompt para Cursor + Claude Opus 4.5:**

```markdown
Actúa como Senior Backend Engineer especializado en web scraping ético.

CONTEXTO:
- Proyecto: Livoo CRM Inmobiliario
- Objetivo: Automatizar importación de propiedades desde portales externos
- Stack: Next.js 16 + Puppeteer + Bull Queue
- Repositorio: https://github.com/manuia88/livooCRM

OBJETIVO CRÍTICO:
Crear sistema modular de scraping para portales inmobiliarios mexicanos, con respeto estricto a términos de servicio y rate limiting.

PORTALES OBJETIVO:
1. Inmuebles24.com
2. Mercado Libre Real Estate
3. Vivaanuncios.com
4. Lamudi.com.mx

ARQUITECTURA:
```
User → API Route → Bull Queue → Scraper → Parser → Validator → DB
                        ↓
                   Redis (jobs)
```

TAREAS:

1. INSTALAR DEPENDENCIAS:
```bash
npm install puppeteer bull ioredis cheerio zod rate-limiter-flexible
npm install -D @types/bull
```

2. CREAR SCRAPER BASE:
   Archivo: `src/lib/scraping/base-scraper.ts`
```typescript
import puppeteer, { Browser, Page } from 'puppeteer'
import { RateLimiterMemory } from 'rate-limiter-flexible'

export abstract class BaseScraper {
  protected browser: Browser | null = null
  protected rateLimiter: RateLimiterMemory

  constructor(
    protected portalName: string,
    requestsPerMinute: number = 10
  ) {
    this.rateLimiter = new RateLimiterMemory({
      points: requestsPerMinute,
      duration: 60
    })
  }

  async initialize() {
    this.browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }

  async scrape(filters: ScrapingFilters): Promise<Property[]> {
    if (!this.browser) await this.initialize()

    try {
      await this.rateLimiter.consume(this.portalName)

      const page = await this.browser!.newPage()
      await page.setUserAgent(this.getRandomUserAgent())

      const url = this.buildSearchUrl(filters)
      await page.goto(url, { waitUntil: 'networkidle2' })

      const properties = await this.extractProperties(page)

      await page.close()
      return properties

    } catch (error) {
      if (error.name === 'RateLimiterError') {
        throw new Error('Rate limit exceeded. Please wait.')
      }
      throw error
    }
  }

  abstract buildSearchUrl(filters: ScrapingFilters): string
  abstract extractProperties(page: Page): Promise<Property[]>

  private getRandomUserAgent(): string {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36...',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36...',
      // ... más user agents
    ]
    return userAgents[Math.floor(Math.random() * userAgents.length)]
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close()
    }
  }
}
```

3. CREAR SCRAPER ESPECÍFICO - INMUEBLES24:
   Archivo: `src/lib/scraping/scrapers/inmuebles24-scraper.ts`
```typescript
import { BaseScraper } from '../base-scraper'
import { Page } from 'puppeteer'
import * as cheerio from 'cheerio'

export class Inmuebles24Scraper extends BaseScraper {
  constructor() {
    super('inmuebles24', 6) // 6 requests/min
  }

  buildSearchUrl(filters: ScrapingFilters): string {
    const baseUrl = 'https://www.inmuebles24.com/propiedades'
    const params = new URLSearchParams({
      tipo: filters.type || 'venta',
      ubicacion: filters.location || '',
      precio_desde: filters.minPrice?.toString() || '',
      precio_hasta: filters.maxPrice?.toString() || ''
    })
    return `${baseUrl}?${params}`
  }

  async extractProperties(page: Page): Promise<Property[]> {
    const html = await page.content()
    const $ = cheerio.load(html)
    const properties: Property[] = []

    $('.posting-card').each((i, element) => {
      const $el = $(element)

      properties.push({
        externalId: $el.data('id')?.toString() || '',
        title: $el.find('.posting-title').text().trim(),
        price: this.parsePrice($el.find('.price').text()),
        location: $el.find('.location').text().trim(),
        bedrooms: this.parseNumber($el.find('.bedrooms').text()),
        bathrooms: this.parseNumber($el.find('.bathrooms').text()),
        area: this.parseArea($el.find('.area').text()),
        description: $el.find('.description').text().trim(),
        images: this.extractImages($el),
        url: $el.find('a').attr('href') || '',
        source: 'inmuebles24'
      })
    })

    return properties
  }

  private parsePrice(priceText: string): number {
    const cleaned = priceText.replace(/[^0-9]/g, '')
    return parseInt(cleaned) || 0
  }

  private parseNumber(text: string): number {
    return parseInt(text.match(/\d+/)?.[0] || '0') || 0
  }

  private parseArea(text: string): number {
    const match = text.match(/(\d+)\s*m²/)
    return match ? parseInt(match[1]) : 0
  }

  private extractImages($el: cheerio.Cheerio): string[] {
    const images: string[] = []
    $el.find('img').each((i, img) => {
      const src = $(img).attr('src')
      if (src && !src.includes('placeholder')) {
        images.push(src)
      }
    })
    return images
  }
}
```

4. CREAR QUEUE SYSTEM:
   Archivo: `src/lib/scraping/queue.ts`
```typescript
import Queue from 'bull'
import { getScraperForPortal } from './scraper-factory'

export const scrapingQueue = new Queue('property-scraping', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379')
  }
})

scrapingQueue.process(async (job) => {
  const { portal, filters, agencyId } = job.data

  console.log(`Starting scraping job for ${portal}...`)

  const scraper = getScraperForPortal(portal)

  try {
    const properties = await scraper.scrape(filters)

    // Normalizar y guardar en BD
    const normalized = properties.map(p => normalizeProperty(p, agencyId))

    // Detectar duplicados
    const unique = await deduplicateProperties(normalized)

    // Guardar en BD
    const saved = await saveProperties(unique)

    await scraper.cleanup()

    return {
      success: true,
      propertiesFound: properties.length,
      propertiesSaved: saved.length,
      duplicatesSkipped: properties.length - saved.length
    }

  } catch (error) {
    await scraper.cleanup()
    throw error
  }
})

scrapingQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed:`, result)
})

scrapingQueue.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed:`, err)
})
```

5. CREAR API ROUTE:
   Archivo: `src/app/api/scraping/start/route.ts`
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { scrapingQueue } from '@/lib/scraping/queue'
import { createClient } from '@/utils/supabase/server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('agency_id, role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin' && profile?.role !== 'manager') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { portal, filters } = await request.json()

  const job = await scrapingQueue.add({
    portal,
    filters,
    agencyId: profile.agency_id,
    userId: user.id
  })

  return NextResponse.json({
    jobId: job.id,
    message: 'Scraping job started'
  })
}
```

6. CREAR DASHBOARD UI:
   Archivo: `src/app/(private)/backoffice/scraping/page.tsx`
```typescript
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select } from '@/components/ui/select'

export default function ScrapingPage() {
  const [portal, setPortal] = useState('inmuebles24')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleStartScraping = async () => {
    setIsLoading(true)

    const response = await fetch('/api/scraping/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portal,
        filters: {
          type: 'venta',
          location: 'cdmx'
        }
      })
    })

    const data = await response.json()
    setResult(data)
    setIsLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Web Scraping</h1>

      <div className="space-y-4">
        <Select value={portal} onChange={setPortal}>
          <option value="inmuebles24">Inmuebles24</option>
          <option value="mercadolibre">Mercado Libre</option>
          <option value="vivaanuncios">Vivaanuncios</option>
        </Select>

        <Button
          onClick={handleStartScraping}
          disabled={isLoading}
        >
          {isLoading ? 'Scraping...' : 'Iniciar Scraping'}
        </Button>

        {result && (
          <div className="p-4 bg-green-50 rounded">
            <p>Job ID: {result.jobId}</p>
            <p>{result.message}</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

ENTREGABLES:
- src/lib/scraping/base-scraper.ts
- src/lib/scraping/scrapers/*.ts (uno por portal)
- src/lib/scraping/queue.ts
- src/app/api/scraping/ (routes)
- src/app/(private)/backoffice/scraping/ (UI)
- docs/WEB_SCRAPING.md

CONSIDERACIONES ÉTICAS:
⚠️ IMPORTANTE:
1. Respetar robots.txt de cada sitio
2. Rate limiting estricto (máx 1 req/5s)
3. No sobrecargar servidores
4. Usar solo para propósitos legítimos
5. Dar crédito a la fuente original
6. No re-publicar datos scrapeados sin permiso

VALIDACIÓN:
- Probar con dataset pequeño primero
- Verificar calidad de datos extraídos
- Medir tasa de éxito (>80%)
- Monitorear errores y bloqueos
```

---

### **Agente Golf-2: Excel/CSV Importer**

#### **Prompt para Cursor + Claude Opus 4.5:**

```markdown
Actúa como Full-Stack Engineer especializado en data import y ETL.

CONTEXTO:
- Proyecto: Livoo CRM
- Objetivo: Importación masiva de propiedades/contactos desde Excel/CSV
- Stack: Next.js 16 + XLSX + Zod + Drag & Drop

OBJETIVO:
Crear sistema robusto de importación con validación, preview y mapeo de columnas.

TAREAS:

1. INSTALAR DEPENDENCIAS:
```bash
npm install xlsx papaparse react-dropzone
```

2. CREAR PARSER:
   Archivo: `src/lib/import/file-parser.ts`
```typescript
import * as XLSX from 'xlsx'
import Papa from 'papaparse'

export async function parseFile(file: File): Promise<any[]> {
  const extension = file.name.split('.').pop()?.toLowerCase()

  if (extension === 'csv') {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        complete: (results) => resolve(results.data),
        error: (error) => reject(error)
      })
    })
  }

  if (extension === 'xlsx' || extension === 'xls') {
    const buffer = await file.arrayBuffer()
    const workbook = XLSX.read(buffer)
    const sheet = workbook.Sheets[workbook.SheetNames[0]]
    return XLSX.utils.sheet_to_json(sheet)
  }

  throw new Error('Formato no soportado')
}
```

3. CREAR MAPEO DE COLUMNAS:
   Archivo: `src/components/import/ColumnMapper.tsx`
```typescript
'use client'

import { useState } from 'react'

export default function ColumnMapper({ columns, onMappingComplete }) {
  const [mapping, setMapping] = useState<Record<string, string>>({})

  const targetFields = [
    'title', 'price', 'location', 'bedrooms', 'bathrooms', 'area'
  ]

  return (
    <div className="space-y-4">
      <h3>Mapear Columnas</h3>

      {columns.map((col) => (
        <div key={col} className="flex gap-4">
          <span>{col}</span>
          <select
            value={mapping[col] || ''}
            onChange={(e) => setMapping({ ...mapping, [col]: e.target.value })}
          >
            <option value="">-- Ignorar --</option>
            {targetFields.map((field) => (
              <option key={field} value={field}>{field}</option>
            ))}
          </select>
        </div>
      ))}

      <button onClick={() => onMappingComplete(mapping)}>
        Continuar
      </button>
    </div>
  )
}
```

4. CREAR VALIDADOR:
```typescript
import { z } from 'zod'

const PropertySchema = z.object({
  title: z.string().min(1),
  price: z.number().positive(),
  location: z.string(),
  bedrooms: z.number().int().min(0),
  bathrooms: z.number().int().min(0),
  area: z.number().positive()
})

export function validateRow(row: any) {
  try {
    return { success: true, data: PropertySchema.parse(row) }
  } catch (error) {
    return { success: false, errors: error.errors }
  }
}
```

ENTREGABLES:
- src/lib/import/file-parser.ts
- src/components/import/ (UI components)
- src/app/(private)/backoffice/importar/ (página)
- docs/IMPORT_GUIDE.md
```

---

## 👥 EQUIPO HOTEL: MLS & Portales

### **Agente Hotel-1: MLS Integration**

#### **Prompt para Cursor + Claude Opus 4.5:**

```markdown
Actúa como Integration Engineer especializado en Real Estate APIs.

CONTEXTO:
- MLS (Multiple Listing Service) integration
- Protocol: RETS (Real Estate Transaction Standard)
- Objetivo: Sincronización bidireccional

NOTA IMPORTANTE:
La integración MLS requiere credenciales específicas de cada MLS regional.
Este prompt crea la infraestructura, pero necesitarás credenciales de:
- AMPI (México)
- MLSs regionales

TAREAS:

1. INSTALAR DEPENDENCIAS:
```bash
npm install rets-client xml2js
```

2. CREAR MLS CLIENT:
```typescript
import { RETSClient } from 'rets-client'

export class MLSService {
  private client: RETSClient

  constructor() {
    this.client = new RETSClient({
      loginUrl: process.env.MLS_LOGIN_URL!,
      username: process.env.MLS_USERNAME!,
      password: process.env.MLS_PASSWORD!,
      version: 'RETS/1.7.2'
    })
  }

  async searchProperties(query: MLSQuery) {
    const results = await this.client.search({
      searchType: 'Property',
      class: 'Residential',
      query: `(ListPrice=${query.minPrice}+)`,
      limit: 100
    })

    return results.map(this.transformMLSProperty)
  }

  private transformMLSProperty(mlsData: any): Property {
    // Map MLS fields to Livoo schema
    return {
      externalId: mlsData.ListingKey,
      title: mlsData.PublicRemarks,
      price: parseInt(mlsData.ListPrice),
      // ... más campos
    }
  }
}
```

ENTREGABLES:
- src/lib/mls/rets-client.ts
- src/app/api/mls/ (webhooks)
- docs/MLS_INTEGRATION.md
```

---

## 📊 Métricas de Éxito - Fase 4

| Métrica | Objetivo |
|---------|----------|
| Propiedades scrapeadas/día | 100-500 |
| Tasa de éxito scraping | >80% |
| Importaciones Excel exitosas | >95% |
| Tiempo de importación (1000 registros) | <30s |
| Duplicados detectados | >90% |

---

**Fecha de creación:** 2026-02-08
**Estado:** Pendiente de implementación
