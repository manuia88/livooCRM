/**
 * Lógica compartida de valuación entre Módulo de Propiedades e Inventario.
 * Una sola fuente de verdad: precio/m² y clasificación (óptimo | medio | fuera).
 */

/** Propiedad mínima para calcular precio/m² y valuación comparativa */
export interface PropertyForValuation {
  id: string
  price: number
  rent_price?: number | null
  operation_type: string
  property_type: string
  city: string | null
  total_area?: number | null
  construction_m2?: number | null
  land_m2?: number | null
}

const AREA_TOLERANCE = 0.4
const MIN_COMPARABLES = 1

function getPriceAndArea(p: PropertyForValuation): { price: number; area: number } {
  const area = p.total_area ?? p.construction_m2 ?? p.land_m2 ?? 0
  const isRenta = p.operation_type === 'renta'
  const price = isRenta ? (p.rent_price ?? p.price ?? 0) : (p.price ?? 0)
  return { price, area }
}

/** Precio por m² (venta: price/área, renta: rent_price/área). null si no hay área. */
export function getPricePerM2(p: PropertyForValuation): number | null {
  const { price, area } = getPriceAndArea(p)
  if (!area || area <= 0) return null
  return price / area
}

function getComparables(
  current: PropertyForValuation,
  all: PropertyForValuation[]
): PropertyForValuation[] {
  const { area } = getPriceAndArea(current)
  const minArea = area * (1 - AREA_TOLERANCE)
  const maxArea = area * (1 + AREA_TOLERANCE)

  return all.filter((p) => {
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

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const index = (p / 100) * (sorted.length - 1)
  const lower = Math.floor(index)
  const upper = Math.ceil(index)
  if (lower === upper) return sorted[lower]
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower)
}

/** P25–P75 óptimo, P10–P25 y P75–P90 no competitivo (medio), resto fuera. */
function getClassification(currentPpm2: number, sortedPpm2: number[]): 'optimo' | 'no_competitivo' | 'fuera_mercado' {
  if (sortedPpm2.length === 0) return 'no_competitivo'
  const p25 = percentile(sortedPpm2, 25)
  const p75 = percentile(sortedPpm2, 75)
  const p10 = percentile(sortedPpm2, 10)
  const p90 = percentile(sortedPpm2, 90)
  if (currentPpm2 >= p25 && currentPpm2 <= p75) return 'optimo'
  if (currentPpm2 >= p10 && currentPpm2 <= p90) return 'no_competitivo'
  return 'fuera_mercado'
}

/** Clasificación de valuación para mostrar en UI: óptimo (verde), medio (ámbar), fuera (rojo). */
export type ValuationLevel = 'optimo' | 'medio' | 'fuera'

/**
 * Calcula la clasificación de valuación de una propiedad respecto a las demás (comparables).
 * Usa la misma lógica que el módulo de inventario (valuationReport).
 */
export function getValuationClassification(
  property: PropertyForValuation,
  allProperties: PropertyForValuation[]
): ValuationLevel {
  const currentPpm2 = getPricePerM2(property)
  if (currentPpm2 == null || currentPpm2 <= 0) return 'medio'

  const comparables = getComparables(property, allProperties)
  const ppm2List = comparables
    .map((p) => getPricePerM2(p))
    .filter((v): v is number => v != null && v > 0)
  const sortedPpm2 = [...ppm2List, currentPpm2].sort((a, b) => a - b)
  const kind = getClassification(currentPpm2, sortedPpm2)
  if (kind === 'optimo') return 'optimo'
  if (kind === 'fuera_mercado') return 'fuera'
  return 'medio'
}

/** Colores por nivel de valuación (clases Tailwind o estilos inline). */
export const VALUATION_COLORS: Record<ValuationLevel, { text: string; bg: string; label: string }> = {
  optimo: { text: 'text-[#10B981]', bg: 'bg-emerald-50', label: 'Óptimo' },
  medio: { text: 'text-[#F59E0B]', bg: 'bg-amber-50', label: 'Medio' },
  fuera: { text: 'text-[#EF4444]', bg: 'bg-red-50', label: 'Fuera de mercado' },
}
