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
}
