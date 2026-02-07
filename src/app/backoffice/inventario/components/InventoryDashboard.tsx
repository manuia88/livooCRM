'use client'

import React from 'react'
import { Building2, ShieldCheck, FileCheck, TrendingUp, Activity } from 'lucide-react'
import { InventoryProperty } from '../types'

interface InventoryDashboardProps {
    onValuationClick: () => void
    properties: InventoryProperty[]
}

export default function InventoryDashboard({ onValuationClick, properties }: InventoryDashboardProps) {
    const totalCount = properties.length
    const exclusiveCount = properties.filter(p => p.exclusive).length
    const optionCount = properties.filter(p => !p.exclusive).length

    // Quality stats
    const qualityStats = {
        alta: properties.filter(p => p.health_score >= 80).length,
        media: properties.filter(p => p.health_score >= 50 && p.health_score < 80).length,
        baja: properties.filter(p => p.health_score < 50).length
    }

    // Market Valuation - pricing competitiveness
    const marketValuation = {
        optimo: properties.filter(p => p.health_score >= 80).length,
        noCompetitivo: properties.filter(p => p.health_score >= 40 && p.health_score < 80).length,
        fueraMercado: properties.filter(p => p.health_score < 40).length
    }

    return (
        <div className="bg-white p-6 sm:p-8 rounded-[28px] border border-[#E5E3DB] shadow-[0_2px_12px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 lg:gap-6">

                {/* Section 1: Core Metrics */}
                <div className="flex items-center justify-center gap-4 sm:gap-6 flex-1">

                    {/* Total */}
                    <div className="flex flex-col items-center w-[80px] sm:w-[90px]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shadow-md mb-2">
                            <Building2 className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{totalCount}</span>
                        <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Total</span>
                    </div>

                    {/* Divider */}
                    <div className="h-12 lg:h-16 w-px bg-[#E5E3DB]"></div>

                    {/* Exclusivas */}
                    <div className="flex flex-col items-center w-[80px] sm:w-[90px]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-md mb-2">
                            <ShieldCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{exclusiveCount}</span>
                        <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Exclusivas</span>
                    </div>

                    {/* Divider */}
                    <div className="h-12 lg:h-16 w-px bg-[#E5E3DB]"></div>

                    {/* Opción */}
                    <div className="flex flex-col items-center w-[80px] sm:w-[90px]">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-md mb-2">
                            <FileCheck className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl sm:text-2xl font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{optionCount}</span>
                        <span className="text-[10px) font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Opción</span>
                    </div>

                </div>

                {/* Main Separator */}
                <div className="hidden lg:block h-20 w-px bg-[#E5E3DB]"></div>
                <div className="block lg:hidden h-px w-full bg-[#E5E3DB]/50"></div>

                {/* Section 2: Quality */}
                <div className="flex-1">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <TrendingUp className="w-4 h-4 text-[#6B7B6B]" />
                        <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.08em] opacity-80">Calidad</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 sm:gap-4">
                        {/* Alta */}
                        <div className="flex flex-col items-center w-[60px] sm:w-[70px]">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md mb-2">
                                <span className="text-[15px] font-black text-white tabular-nums">{qualityStats.alta}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Alta</span>
                        </div>

                        {/* Media */}
                        <div className="flex flex-col items-center w-[60px] sm:w-[70px]">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-md mb-2">
                                <span className="text-[15px] font-black text-white tabular-nums">{qualityStats.media}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Media</span>
                        </div>

                        {/* Baja */}
                        <div className="flex flex-col items-center w-[60px] sm:w-[70px]">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-md mb-2">
                                <span className="text-[15px] font-black text-white tabular-nums">{qualityStats.baja}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Baja</span>
                        </div>
                    </div>
                </div>

                {/* Main Separator */}
                <div className="hidden lg:block h-20 w-px bg-[#E5E3DB]"></div>
                <div className="block lg:hidden h-px w-full bg-[#E5E3DB]/50"></div>

                {/* Section 3: Valuation */}
                <div className="flex-1">
                    <div className="flex items-center justify-center gap-2 mb-3">
                        <Activity className="w-4 h-4 text-[#6B7B6B]" />
                        <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.08em] opacity-80">Valuación</span>
                    </div>
                    <div className="flex items-center justify-center gap-3 sm:gap-4">
                        {/* Óptimo */}
                        <div className="flex flex-col items-center w-[60px] sm:w-[70px]">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shadow-md mb-2">
                                <span className="text-[15px] font-black text-white tabular-nums">{marketValuation.optimo}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Óptimo</span>
                        </div>

                        {/* Medio */}
                        <div className="flex flex-col items-center w-[60px] sm:w-[70px]">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shadow-md mb-2">
                                <span className="text-[15px] font-black text-white tabular-nums">{marketValuation.noCompetitivo}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Medio</span>
                        </div>

                        {/* Fuera */}
                        <div className="flex flex-col items-center w-[60px] sm:w-[70px]">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#EF4444] to-[#DC2626] flex items-center justify-center shadow-md mb-2">
                                <span className="text-[15px] font-black text-white tabular-nums">{marketValuation.fueraMercado}</span>
                            </div>
                            <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Fuera</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}
