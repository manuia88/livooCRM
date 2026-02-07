import { Property } from '@/hooks/useProperties'

export type ExclusivityFilter = null | 'exclusive' | 'option'
export type QualityFilter = 'quality_alta' | 'quality_media' | 'quality_baja'
export type ValuationFilter = 'valuation_optimo' | 'valuation_medio' | 'valuation_fuera'

export interface DashboardFiltersState {
    exclusivity: ExclusivityFilter
    qualities: QualityFilter[]
    valuations: ValuationFilter[]
}

/** @deprecated Use DashboardFiltersState for multi-select */
export type DashboardFilter =
    | null
    | 'all'
    | 'exclusive'
    | 'option'
    | 'quality_alta'
    | 'quality_media'
    | 'quality_baja'
    | 'valuation_optimo'
    | 'valuation_medio'
    | 'valuation_fuera'

export interface PropertyStats {
    queries: number
    visits: number
    offers: number
}

export interface Advisor {
    name: string
    role: string
    avatar?: string
}

export interface InventoryProperty extends Property {
    // Extra fields for Inventory module (Mock or computed for now)
    stats: PropertyStats
    pendingTasks: number
    quality: string
    qualityScore: number
    advisors: Advisor[]
    valuation?: string // optimo | medio | fuera
    legal_status?: string
    // metadata overrides/extensions if needed
    exclusive?: boolean
    contract_status?: string
    // Calidad de publicación (opcionales; si no existen se calculan o se asume false)
    has_video?: boolean
    has_floor_plans?: boolean
    has_360_tour?: boolean
    /** Número de documentos legales entregados (máx 6). Si no viene, se infiere de legal_status. */
    docs_count?: number
    /** Días publicada (para informe de valuación: promedio de no competitivas). */
    days_on_market?: number
}

/** Criterio de calidad con puntaje y recomendación */
export interface QualityCriterion {
    id: string
    label: string
    weight: number
    earned: number
    max: number
    ok: boolean
    recommendation: string
}

export interface QualityScoreResult {
    totalEarned: number
    totalMax: number
    percentage: number
    criteria: QualityCriterion[]
}
