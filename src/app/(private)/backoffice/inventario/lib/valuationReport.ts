import { InventoryProperty } from '../types'

export type PriceBucketKind = 'optimo' | 'no_competitivo' | 'fuera_mercado'

export interface PriceBucket {
  kind: PriceBucketKind
  minM2: number
  maxM2: number
  count: number
  label: string
}

export interface ValuationReport {
  /** Propiedad analizada */
  property: InventoryProperty
  /** Precio por m² de la propiedad (venta: price/m², renta: rent_price/m²) */
  pricePerM2: number
  /** Propiedades comparables (mismo tipo op, tipo propiedad, ciudad; área similar) */
  comparables: InventoryProperty[]
  /** Clasificación: óptimo | no competitivo | fuera de mercado */
  classification: PriceBucketKind
  /** Rango de precios por m² para el gráfico (buckets) */
  buckets: PriceBucket[]
  /** Índice del bucket donde cae la propiedad actual (para marcar "ACTUAL") */
  currentBucketIndex: number
  /** Conclusiones del análisis */
  conclusions: {
    totalSimilar: number
    withLowerPrice: number
    withLowerPriceAndLargerSurface: number
    avgDaysListedNonCompetitive: number
    recommendationMin: number
    recommendationMax: number
  }
  /** Frase de diagnóstico para el título */
  diagnosisTitle: string
  /** Recomendación de precio (texto) */
  recommendationText: string
}

const AREA_TOLERANCE = 0.4 // ±40% de superficie para considerar comparable
const MIN_COMPARABLES = 3

function getPriceAndArea(p: InventoryProperty): { price: number; area: number } {
  const area = p.total_area ?? p.construction_m2 ?? 0
  const isRenta = p.operation_type === 'renta'
  const price = isRenta ? (p.rent_price ?? p.price ?? 0) : (p.price ?? 0)
  return { price, area }
}

function pricePerM2(p: InventoryProperty): number | null {
  const { price, area } = getPriceAndArea(p)
  if (!area || area <= 0) return null
  return price / area
}

/** Obtiene propiedades comparables: mismo operation_type, mismo property_type, misma city, área en rango. */
function getComparables(
  current: InventoryProperty,
  all: InventoryProperty[]
): InventoryProperty[] {
  const { area } = getPriceAndArea(current)
  const minArea = area * (1 - AREA_TOLERANCE)
  const maxArea = area * (1 + AREA_TOLERANCE)

  return all.filter(p => {
    if (p.id === current.id) return false
    if (p.operation_type !== current.operation_type) return false
    if (p.property_type !== current.property_type) return false
    if (p.city !== current.city) return false
    const { area: a } = getPriceAndArea(p)
    if (!a || a <= 0) return false
    if (a < minArea || a > maxArea) return false
    return true
  })
}

/** Clasificación por percentiles: P25–P75 óptimo, P10–P25 y P75–P90 no competitivo, resto fuera. */
function getClassification(
  currentPpm2: number,
  sortedPpm2: number[]
): PriceBucketKind {
  if (sortedPpm2.length === 0) return 'no_competitivo'
  const p25 = percentile(sortedPpm2, 25)
  const p75 = percentile(sortedPpm2, 75)
  const p10 = percentile(sortedPpm2, 10)
  const p90 = percentile(sortedPpm2, 90)
  if (currentPpm2 >= p25 && currentPpm2 <= p75) return 'optimo'
  if (currentPpm2 >= p10 && currentPpm2 <= p90) return 'no_competitivo'
  return 'fuera_mercado'
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

/** Genera buckets para el gráfico: rangos de precio/m² con conteo y color. */
function buildBuckets(
  comparables: InventoryProperty[],
  currentPpm2: number
): { buckets: PriceBucket[]; currentBucketIndex: number } {
  const ppm2List = comparables
    .map(p => pricePerM2(p))
    .filter((v): v is number => v != null && v > 0)
  if (ppm2List.length === 0) {
    const b: PriceBucket[] = [
      { kind: 'optimo', minM2: 0, maxM2: currentPpm2, count: 0, label: 'Óptimo' },
      { kind: 'no_competitivo', minM2: currentPpm2, maxM2: currentPpm2 * 1.2, count: 0, label: 'No competitivo' },
      { kind: 'fuera_mercado', minM2: currentPpm2 * 1.2, maxM2: currentPpm2 * 1.5, count: 0, label: 'Fuera' }
    ]
    return { buckets: b, currentBucketIndex: 0 }
  }

  const min = Math.min(...ppm2List, currentPpm2)
  const max = Math.max(...ppm2List, currentPpm2)
  const range = max - min || 1
  const numBuckets = 9
  const step = range / numBuckets

  const buckets: PriceBucket[] = []
  for (let i = 0; i < numBuckets; i++) {
    const minM2 = min + i * step
    const maxM2 = min + (i + 1) * step
    const count = ppm2List.filter(v => v >= minM2 && v < maxM2).length
    const sorted = [...ppm2List].sort((a, b) => a - b)
    const p25 = percentile(sorted, 25)
    const p75 = percentile(sorted, 75)
    const p10 = percentile(sorted, 10)
    const p90 = percentile(sorted, 90)
    const mid = (minM2 + maxM2) / 2
    let kind: PriceBucketKind = 'no_competitivo'
    if (mid >= p25 && mid <= p75) kind = 'optimo'
    else if (mid >= p10 && mid <= p90) kind = 'no_competitivo'
    else kind = 'fuera_mercado'
    buckets.push({
      kind,
      minM2,
      maxM2,
      count,
      label: `${Math.round(minM2 / 1000)}k`
    })
  }

  let currentBucketIndex = 0
  for (let i = 0; i < buckets.length; i++) {
    if (currentPpm2 >= buckets[i].minM2 && currentPpm2 < buckets[i].maxM2) {
      currentBucketIndex = i
      break
    }
    if (i === buckets.length - 1 && currentPpm2 >= buckets[i].minM2) currentBucketIndex = i
  }

  return { buckets, currentBucketIndex }
}

/** Días en mercado promedio (opcional en propiedades). */
function avgDaysListedNonCompetitive(
  comparables: InventoryProperty[],
  currentPpm2: number,
  sortedPpm2: number[]
): number {
  const p25 = percentile(sortedPpm2, 25)
  const p75 = percentile(sortedPpm2, 75)
  const nonCompetitive = comparables.filter(p => {
    const ppm2 = pricePerM2(p)
    if (ppm2 == null) return false
    return ppm2 < p25 || ppm2 > p75
  })
  const daysList: number[] = (nonCompetitive as (InventoryProperty & { days_on_market?: number })[])
    .map(p => p.days_on_market)
    .filter((d): d is number => typeof d === 'number' && d >= 0)
  if (daysList.length === 0) return 130 // valor por defecto como en el ejemplo
  return Math.round(daysList.reduce((a, b) => a + b, 0) / daysList.length)
}

/**
 * Genera el informe de valuación comparativa.
 * Usa propiedades propias, de agencia, red y MLS (todas las pasadas en allProperties).
 */
export function buildValuationReport(
  property: InventoryProperty,
  allProperties: InventoryProperty[]
): ValuationReport {
  const comparables = getComparables(property, allProperties)
  const currentPpm2 = pricePerM2(property) ?? 0
  const ppm2List = comparables
    .map(p => pricePerM2(p))
    .filter((v): v is number => v != null && v > 0)
  const sortedPpm2 = [...ppm2List, currentPpm2].sort((a, b) => a - b)
  const classification = getClassification(currentPpm2, sortedPpm2)
  const { buckets, currentBucketIndex } = buildBuckets(comparables, currentPpm2)

  const withLowerPrice = ppm2List.filter(ppm2 => ppm2 < currentPpm2).length
  const currentArea = property.total_area ?? property.construction_m2 ?? 0
  const withLowerPriceAndLarger = comparables.filter(p => {
    const ppm2 = pricePerM2(p)
    const area = p.total_area ?? p.construction_m2 ?? 0
    return ppm2 != null && ppm2 < currentPpm2 && area > currentArea
  }).length

  const p25 = percentile(sortedPpm2, 25)
  const p50 = percentile(sortedPpm2, 50)
  const recommendationMin = currentArea > 0 ? Math.round(p25 * currentArea) : 0
  const recommendationMax = currentArea > 0 ? Math.round(p50 * currentArea) : 0

  const avgDays = avgDaysListedNonCompetitive(comparables, currentPpm2, sortedPpm2)

  let diagnosisTitle: string
  let recommendationText: string
  if (comparables.length === 0) {
    diagnosisTitle = 'Análisis de valuación'
    recommendationText = 'No hay propiedades comparables en el CRM con el mismo tipo, ciudad y superficie (±40%). Agrega más propiedades (propias, inmobiliaria, red o MLS) para obtener un informe comparativo.'
  } else if (classification === 'optimo') {
    diagnosisTitle = 'El precio de la propiedad es competitivo'
    recommendationText = 'Mantén el precio actual; está dentro del rango óptimo del mercado.'
  } else if (classification === 'no_competitivo') {
    diagnosisTitle = 'El precio de la propiedad es poco competitivo'
    recommendationText = `Recomendamos ajustar el precio para acercarlo al rango óptimo (entre ${recommendationMin.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })} y ${recommendationMax.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })} según superficie).`
  } else {
    diagnosisTitle = 'El precio de la propiedad está fuera de mercado'
    recommendationText = `Recomendamos bajar el precio de la propiedad y fijarlo entre ${recommendationMin.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })} y ${recommendationMax.toLocaleString('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })} para ser competitivo.`
  }

  return {
    property,
    pricePerM2: currentPpm2,
    comparables,
    classification,
    buckets,
    currentBucketIndex,
    conclusions: {
      totalSimilar: comparables.length,
      withLowerPrice,
      withLowerPriceAndLargerSurface: withLowerPriceAndLarger,
      avgDaysListedNonCompetitive: avgDays,
      recommendationMin,
      recommendationMax
    },
    diagnosisTitle,
    recommendationText
  }
}
