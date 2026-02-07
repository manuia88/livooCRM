import { Property } from '@/hooks/useProperties'

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
    // metadata overrides/extensions if needed
    exclusive?: boolean
    contract_status?: string
}
