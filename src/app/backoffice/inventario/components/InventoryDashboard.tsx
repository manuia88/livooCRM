'use client'

import React from 'react'
import { Building2, ShieldCheck, FileCheck, TrendingUp, Activity, Check } from 'lucide-react'
import { InventoryProperty, DashboardFiltersState, QualityFilter, ValuationFilter } from '../types'

interface InventoryDashboardProps {
    onValuationClick: () => void
    properties: InventoryProperty[]
    dashboardFilters: DashboardFiltersState
    onClearAll: () => void
    onExclusivityClick: (value: 'exclusive' | 'option') => void
    onQualityToggle: (value: QualityFilter) => void
    onValuationToggle: (value: ValuationFilter) => void
}

export default function InventoryDashboard({
    onValuationClick,
    properties,
    dashboardFilters,
    onClearAll,
    onExclusivityClick,
    onQualityToggle,
    onValuationToggle
}: InventoryDashboardProps) {
    const totalCount = properties.length
    // Mismo criterio que PropertyCard: Exclusiva = !mls_shared, Opción = mls_shared
    const exclusiveCount = properties.filter(p => p.mls_shared === false).length
    const optionCount = properties.filter(p => p.mls_shared === true).length

    const qualityStats = {
        alta: properties.filter(p => p.health_score >= 80).length,
        media: properties.filter(p => p.health_score >= 50 && p.health_score < 80).length,
        baja: properties.filter(p => p.health_score < 50).length
    }

    const marketValuation = {
        optimo: properties.filter(p => p.valuation === 'optimo').length,
        noCompetitivo: properties.filter(p => p.valuation === 'medio' || p.valuation === 'no_competitivo').length,
        fueraMercado: properties.filter(p => p.valuation === 'fuera').length
    }

    const btnBase = 'flex flex-col items-center rounded-xl transition-all hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 relative'
    const selectedStyle = (ring: string, bg: string) => `${ring} ${bg} ring-2 ring-offset-2 shadow-sm`

    return (
        <div className="bg-white px-4 py-3 rounded-[20px] border border-[#E5E3DB] shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                {/* Section 1: Core Metrics */}
                <div className="flex-1">
                    <div className="h-[20px] mb-2" />
                    <div className="flex items-center justify-center gap-2.5">
                        <button
                            type="button"
                            onClick={onClearAll}
                            className={`${btnBase} w-[110px] cursor-pointer focus:ring-sky-400 py-1.5 px-1 rounded-xl`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shadow-md mb-1.5">
                                <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-[24px] font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{totalCount}</span>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Total de<br />Propiedades</span>
                        </button>

                        <div className="h-10 w-px bg-[#E5E3DB]" />

                        <button
                            type="button"
                            onClick={() => onExclusivityClick('exclusive')}
                            className={`${btnBase} w-[110px] cursor-pointer focus:ring-amber-400 py-1.5 px-1 rounded-xl ${dashboardFilters.exclusivity === 'exclusive' ? selectedStyle('ring-amber-500', 'bg-amber-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-md mb-1.5">
                                <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-[24px] font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{exclusiveCount}</span>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Exclusivas</span>
                            {dashboardFilters.exclusivity === 'exclusive' && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-amber-700"><Check className="w-3 h-3" />Seleccionado</span>}
                        </button>

                        <div className="h-10 w-px bg-[#E5E3DB]" />

                        <button
                            type="button"
                            onClick={() => onExclusivityClick('option')}
                            className={`${btnBase} w-[110px] cursor-pointer focus:ring-violet-400 py-1.5 px-1 rounded-xl ${dashboardFilters.exclusivity === 'option' ? selectedStyle('ring-violet-500', 'bg-violet-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-md mb-1.5">
                                <FileCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                            </div>
                            <span className="text-[24px] font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{optionCount}</span>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Opción</span>
                            {dashboardFilters.exclusivity === 'option' && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-violet-700"><Check className="w-3 h-3" />Seleccionado</span>}
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block h-10 w-px bg-[#E5E3DB]" />
                <div className="block lg:hidden h-px w-full bg-[#E5E3DB]/50" />

                {/* Section 2: Quality */}
                <div className="flex-1">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                        <TrendingUp className="w-4 h-4 text-[#6B7B6B]" />
                        <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80">Calidad</span>
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => onQualityToggle('quality_alta')}
                            className={`${btnBase} w-[70px] cursor-pointer focus:ring-emerald-400 py-1.5 px-1 rounded-xl ${dashboardFilters.qualities.includes('quality_alta') ? selectedStyle('ring-emerald-500', 'bg-emerald-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md mb-1.5">
                                <span className="text-[24px] font-black text-white tabular-nums">{qualityStats.alta}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Alta</span>
                            {dashboardFilters.qualities.includes('quality_alta') && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-emerald-700"><Check className="w-3 h-3" />Sel.</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => onQualityToggle('quality_media')}
                            className={`${btnBase} w-[70px] cursor-pointer focus:ring-amber-400 py-1.5 px-1 rounded-xl ${dashboardFilters.qualities.includes('quality_media') ? selectedStyle('ring-amber-500', 'bg-amber-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-md mb-1.5">
                                <span className="text-[24px] font-black text-white tabular-nums">{qualityStats.media}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Media</span>
                            {dashboardFilters.qualities.includes('quality_media') && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-amber-700"><Check className="w-3 h-3" />Sel.</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => onQualityToggle('quality_baja')}
                            className={`${btnBase} w-[70px] cursor-pointer focus:ring-red-400 py-1.5 px-1 rounded-xl ${dashboardFilters.qualities.includes('quality_baja') ? selectedStyle('ring-red-500', 'bg-red-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-md mb-1.5">
                                <span className="text-[24px] font-black text-white tabular-nums">{qualityStats.baja}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Baja</span>
                            {dashboardFilters.qualities.includes('quality_baja') && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-red-700"><Check className="w-3 h-3" />Sel.</span>}
                        </button>
                    </div>
                </div>

                <div className="hidden lg:block h-10 w-px bg-[#E5E3DB]" />
                <div className="block lg:hidden h-px w-full bg-[#E5E3DB]/50" />

                {/* Section 3: Valuation */}
                <div className="flex-1">
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                        <Activity className="w-4 h-4 text-[#6B7B6B]" />
                        <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80">Valuación</span>
                    </div>
                    <div className="flex items-center justify-center gap-2.5">
                        <button
                            type="button"
                            onClick={() => onValuationToggle('valuation_optimo')}
                            className={`${btnBase} w-[70px] cursor-pointer focus:ring-emerald-400 py-1.5 px-1 rounded-xl ${dashboardFilters.valuations.includes('valuation_optimo') ? selectedStyle('ring-emerald-500', 'bg-emerald-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md mb-1.5">
                                <span className="text-[24px] font-black text-white tabular-nums">{marketValuation.optimo}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Óptimo</span>
                            {dashboardFilters.valuations.includes('valuation_optimo') && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-emerald-700"><Check className="w-3 h-3" />Sel.</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => onValuationToggle('valuation_medio')}
                            className={`${btnBase} w-[70px] cursor-pointer focus:ring-amber-400 py-1.5 px-1 rounded-xl ${dashboardFilters.valuations.includes('valuation_medio') ? selectedStyle('ring-amber-500', 'bg-amber-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-md mb-1.5">
                                <span className="text-[24px] font-black text-white tabular-nums">{marketValuation.noCompetitivo}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Medio</span>
                            {dashboardFilters.valuations.includes('valuation_medio') && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-amber-700"><Check className="w-3 h-3" />Sel.</span>}
                        </button>
                        <button
                            type="button"
                            onClick={() => onValuationToggle('valuation_fuera')}
                            className={`${btnBase} w-[70px] cursor-pointer focus:ring-red-400 py-1.5 px-1 rounded-xl ${dashboardFilters.valuations.includes('valuation_fuera') ? selectedStyle('ring-red-500', 'bg-red-100') : ''}`}
                        >
                            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-md mb-1.5">
                                <span className="text-[24px] font-black text-white tabular-nums">{marketValuation.fueraMercado}</span>
                            </div>
                            <span className="text-[11px] font-extrabold text-[#6B7B6B] uppercase tracking-wider opacity-80 text-center leading-tight">Fuera</span>
                            {dashboardFilters.valuations.includes('valuation_fuera') && <span className="mt-1 flex items-center gap-0.5 text-[9px] font-bold text-red-700"><Check className="w-3 h-3" />Sel.</span>}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    )
}
