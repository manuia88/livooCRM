import { InventoryProperty, QualityCriterion, QualityScoreResult } from '../types'

const MIN_PHOTOS = 12
const MIN_DESCRIPTION_LENGTH = 400
const DOCS_REQUIRED = 6

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  oficina: 'Oficina',
  local: 'Local',
  terreno: 'Terreno',
  bodega: 'Bodega',
  nave_industrial: 'Nave industrial',
  otro: 'Otro'
}

/** Verifica si el título incluye tipo de propiedad (casa, depto, etc.) */
function titleHasPropertyType(title: string, propertyType: string): boolean {
  const typeLabel = PROPERTY_TYPE_LABELS[propertyType] ?? propertyType
  return title.toLowerCase().includes(typeLabel.toLowerCase()) || title.toLowerCase().includes(propertyType.toLowerCase())
}

/** Verifica si el título menciona recámaras */
function titleHasBedrooms(title: string): boolean {
  return /\d+\s*rec(á|a)mara|rec(á|a)maras|habitacion|habitaciones|bedroom/i.test(title) || /\d+\s*hab\.?/i.test(title)
}

/** Verifica si el título menciona un beneficio (balcón, terraza, roof garden, amenidades) */
function titleHasBenefit(title: string): boolean {
  return /balc(o|ó)n|terraza|roof\s*garden|roof garden|amenidad|alberca|gimnasio|estacionamiento|vista|jard(i|í)n/i.test(title)
}

/** Verifica si el título incluye colonia o zona */
function titleHasNeighborhood(title: string, neighborhood: string | null): boolean {
  if (!neighborhood) return false
  return title.toLowerCase().includes(neighborhood.toLowerCase())
}

/** Cuenta campos básicos llenos para “información ingresada” */
function countFilledFields(p: InventoryProperty): number {
  const fields = [
    p.title,
    p.description,
    p.address,
    p.neighborhood,
    p.city,
    p.state,
    p.price != null,
    p.bedrooms != null,
    p.bathrooms != null,
    p.total_area != null,
    p.property_type,
    p.operation_type,
    p.main_image_url || (p.images && p.images.length > 0)
  ]
  const total = 14 // aprox. campos principales
  const filled = fields.filter(Boolean).length
  return Math.min(filled, total)
}

/** Documentos: si viene docs_count lo usamos; si no, inferimos por legal_status */
function getDocsCount(p: InventoryProperty): number {
  if (p.docs_count != null) return Math.min(p.docs_count, DOCS_REQUIRED)
  const status = (p.legal_status || '').toLowerCase()
  if (status === 'aprobados' || status === 'contrato_firmado') return DOCS_REQUIRED
  if (status === 'contrato_enviado' || status === 'en_revision') return 4
  if (status === 'docs_pendientes') return 2
  return 0
}

/**
 * Calcula el score de calidad y las recomendaciones.
 * Los pesos por criterio son modificables para ajustar la calificación.
 */
export function computeQualityScore(property: InventoryProperty): QualityScoreResult {
  const p = property
  const photoCount = (p.images && Array.isArray(p.images) ? p.images.length : 0) + (p.main_image_url ? 1 : 0)
  const descLength = (p.description || '').length
  const filledCount = countFilledFields(p)
  const filledMax = 14
  const docsCount = getDocsCount(p)

  const titleOk =
    titleHasPropertyType(p.title || '', p.property_type || '') &&
    titleHasBedrooms(p.title || '') &&
    titleHasBenefit(p.title || '') &&
    titleHasNeighborhood(p.title || '', p.neighborhood || null)

  const criteria: QualityCriterion[] = [
    {
      id: 'photos_count',
      label: 'Cantidad de fotos (mín. 12)',
      weight: 20,
      max: 20,
      earned: photoCount >= MIN_PHOTOS ? 20 : Math.round((photoCount / MIN_PHOTOS) * 20),
      ok: photoCount >= MIN_PHOTOS,
      recommendation:
        photoCount >= MIN_PHOTOS
          ? 'Tienes al menos 12 fotos.'
          : `Agrega al menos ${MIN_PHOTOS - photoCount} fotos más (mínimo ${MIN_PHOTOS} en total). Las fotos serán evaluadas por IA para verificar calidad.`
    },
    {
      id: 'photos_quality',
      label: 'Calidad de fotos (evaluación IA)',
      weight: 10,
      max: 10,
      earned: 0, // Placeholder: cuando exista IA se puede asignar 0–10
      ok: false,
      recommendation: 'Las fotos serán evaluadas por IA para verificar que son de calidad y representan bien la propiedad. (Próximamente)'
    },
    {
      id: 'info_completeness',
      label: 'Información completa (campos llenados)',
      weight: 15,
      max: 15,
      earned: Math.round((filledCount / filledMax) * 15),
      ok: filledCount >= filledMax,
      recommendation:
        filledCount >= filledMax
          ? 'Todos los campos principales están completos.'
          : 'Completa todos los campos de la ficha: dirección, características, precios, etc.'
    },
    {
      id: 'title',
      label: 'Título del anuncio (tipo, recámaras, beneficio, colonia)',
      weight: 15,
      max: 15,
      earned: titleOk ? 15 : 0,
      ok: titleOk,
      recommendation: titleOk
        ? 'El título incluye tipo de propiedad, recámaras, un beneficio y la colonia.'
        : 'El título debe incluir: tipo de propiedad, número de recámaras, un beneficio (balcón, terraza, roof garden, amenidades) y la colonia.'
    },
    {
      id: 'description',
      label: 'Descripción detallada (mín. 400 caracteres)',
      weight: 10,
      max: 10,
      earned: descLength >= MIN_DESCRIPTION_LENGTH ? 10 : Math.round((descLength / MIN_DESCRIPTION_LENGTH) * 10),
      ok: descLength >= MIN_DESCRIPTION_LENGTH,
      recommendation:
        descLength >= MIN_DESCRIPTION_LENGTH
          ? 'La descripción tiene al menos 400 caracteres.'
          : `Amplía la descripción a al menos ${MIN_DESCRIPTION_LENGTH} caracteres (actualmente ${descLength}).`
    },
    {
      id: 'video',
      label: 'Video agregado',
      weight: 10,
      max: 10,
      earned: p.has_video ? 10 : 0,
      ok: !!p.has_video,
      recommendation: p.has_video ? 'Video agregado.' : 'Agrega un video de la propiedad para mejorar la calidad de la publicación.'
    },
    {
      id: 'floor_plans',
      label: 'Planos',
      weight: 10,
      max: 10,
      earned: p.has_floor_plans ? 10 : 0,
      ok: !!p.has_floor_plans,
      recommendation: p.has_floor_plans ? 'Planos agregados.' : 'Incluye planos de la propiedad para aumentar la calidad.'
    },
    {
      id: 'tour_360',
      label: 'Recorrido 360°',
      weight: 10,
      max: 10,
      earned: p.has_360_tour ? 10 : 0,
      ok: !!p.has_360_tour,
      recommendation: p.has_360_tour ? 'Recorrido 360° agregado.' : 'Agrega un recorrido 360° para mejorar la experiencia.'
    },
    {
      id: 'documentation',
      label: `Documentación (${DOCS_REQUIRED} elementos requeridos)`,
      weight: 10,
      max: 10,
      earned: docsCount >= DOCS_REQUIRED ? 10 : Math.round((docsCount / DOCS_REQUIRED) * 10),
      ok: docsCount >= DOCS_REQUIRED,
      recommendation:
        docsCount >= DOCS_REQUIRED
          ? 'Documentación completa (6 elementos).'
          : `Entrega los ${DOCS_REQUIRED} elementos de documentación requeridos (actualmente ${docsCount}).`
    }
  ]

  const totalMax = criteria.reduce((s, c) => s + c.max, 0)
  const totalEarned = criteria.reduce((s, c) => s + c.earned, 0)
  const percentage = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0

  return { totalEarned, totalMax, percentage, criteria }
}
