# Web Scraping System

Sistema de importación de propiedades desde portales inmobiliarios externos.

## Portales Soportados

| Portal | Estado | Notas |
|--------|--------|-------|
| Inmuebles24 | Activo | inmuebles24.com |
| Vivanuncios | Activo | vivanuncios.com.mx |
| Lamudi | Pendiente | Próximamente |
| Properati | Pendiente | Próximamente |

## Arquitectura

```
UI (importar page)
  └─> useScraping hook
      └─> POST /api/scraping
          └─> lib/scraping/index.ts
              ├─> inmuebles24-scraper.ts
              └─> vivanuncios-scraper.ts
                  └─> base-scraper.ts (rate limit, retry, parsing)
```

### Flujo de Datos

1. **Scraping**: Se extraen propiedades del portal y se guardan en `scraped_listings`
2. **Staging**: El usuario revisa las propiedades encontradas en la UI
3. **Importación**: Al importar, se crea una `property` y se marca como importada

## Base de Datos

### Tabla: `scraped_listings`

Almacena propiedades extraídas antes de importarlas al inventario.

- `source`: Portal de origen (inmuebles24, vivanuncios, etc.)
- `external_id`: ID único en el portal original
- `imported`: Boolean que indica si ya fue importada
- `imported_property_id`: FK a la propiedad creada al importar

### Tabla: `scraping_jobs`

Historial de trabajos de scraping con estadísticas.

- `status`: queued, running, completed, failed, cancelled
- `listings_found/new/updated/duplicates`: Contadores

## API

### POST /api/scraping

Inicia un trabajo de scraping.

```json
{
  "source": "inmuebles24",
  "pages": 2,
  "city": "ciudad-de-mexico",
  "operation": "venta"
}
```

Respuesta:

```json
{
  "success": true,
  "job_id": "uuid",
  "listings_found": 40,
  "listings_new": 35,
  "listings_updated": 3,
  "listings_duplicates": 2
}
```

### GET /api/scraping

Lista los últimos 20 trabajos de scraping.

## Rate Limiting

- **1.5 segundos** entre cada solicitud HTTP al portal
- **2 segundos** de pausa entre páginas
- **Máximo 5 páginas** por trabajo (~100 propiedades)
- Retry automático con backoff exponencial (3 intentos)
- Respeta respuestas HTTP 429 con backoff de 5s

## Agregar un Nuevo Portal

1. Crear `src/lib/scraping/<portal>-scraper.ts` extendiendo `BaseScraper`
2. Implementar los métodos abstractos:
   - `getSearchUrl(filters)`
   - `scrapeListingPage(filters)`
   - `scrapeDetailPage(url)`
3. Registrar en `src/lib/scraping/index.ts` → `SUPPORTED_SCRAPERS`
4. Agregar al tipo `PortalSource` y validación en la API
5. Agregar a la migración el valor en el CHECK constraint

## Consideraciones Legales

- Solo para uso interno de comparación de mercado
- No revender datos extraídos
- Se respeta robots.txt y rate limits de cada portal
- User-Agent identificable: `LivooCRM/1.0`
- No se extraen datos personales de agentes

## Hooks Disponibles

```tsx
import {
  useScrapedListings,
  useScrapingJobs,
  useStartScraping,
  useImportListing,
  useImportMultipleListings,
  useDeleteScrapedListing
} from '@/hooks/useScraping'
```

## Acceso en la UI

`/backoffice/propiedades/importar`
