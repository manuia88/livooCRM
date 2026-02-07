import React, { useState } from 'react'
import { ChevronRight, MoreHorizontal, Edit3, MessageCircle, MapPin, ChevronDown } from 'lucide-react'
import ConsultationsList from './ConsultationsList'

import { InventoryProperty } from '../types'

export default function PropertyCard(props: InventoryProperty) {
    const {
        title,
        address,
        neighborhood,
        city,
        state,
        price,
        operation_type,
        stats,
        quality,
        qualityScore,
        pendingTasks,
        advisors,
        commission_percentage,
        exclusive,
        status
    } = props

    const [showConsultations, setShowConsultations] = useState(false)
    const fullAddress = `${neighborhood ? neighborhood + ', ' : ''}${city}, ${state}`
    const m2Price = props.total_area ? Math.round(price / props.total_area) : 0
    return (
        <div className="bg-white rounded-[20px] border border-[#E5E7EB] shadow-sm overflow-hidden hover:shadow-md transition-all">
            {/* Upper Body */}
            <div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_260px_220px] gap-8 items-center">

                {/* Col 1: Identity */}
                <div className="flex items-center gap-6">
                    <input type="checkbox" className="w-5 h-5 rounded-md border-[#E5E7EB] text-[#111827] focus:ring-[#111827]" />
                    <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-black/5 group-hover:bg-black/0 transition-colors" />
                        {/* Placeholder for real image */}
                        <div className="w-full h-full flex items-center justify-center text-[#9CA3AF]">
                            <MapPin size={24} strokeWidth={1.5} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <span className="bg-[#111827] text-white text-[10px] font-black px-2 py-0.5 rounded-[4px] tracking-widest uppercase">{operation_type}</span>
                            <h3 className="text-[17px] font-bold text-[#111827]">{title}</h3>
                        </div>
                        <p className="text-sm text-[#6B7280] font-medium">{fullAddress}</p>
                        <div className="flex items-center gap-3 pt-1">
                            <p className="text-[18px] font-bold text-[#111827]">
                                {price.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })}
                            </p>
                            <span className="px-2.5 py-1 bg-[#FFFBEB] text-[#B45309] text-[11px] font-bold rounded-lg border border-[#FEF3C7]">
                                {m2Price.toLocaleString('es-MX')} MXN / m²
                            </span>
                        </div>
                    </div>
                </div>

                {/* Col 2: Conversion Funnel */}
                <div className="flex items-center">
                    <div className="flex items-center bg-[#F9FAFB] rounded-xl p-1.5 w-full">
                        <button
                            onClick={() => setShowConsultations(!showConsultations)}
                            className="flex-1 flex flex-col items-center py-1 border-r border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-l-lg transition-colors group/stat"
                        >
                            <span className="text-sm font-bold text-[#111827] leading-none group-hover/stat:text-[#0D9488]">{stats.queries}</span>
                            <div className="flex items-center gap-1 mt-1">
                                <span className="text-[10px] text-[#9CA3AF] font-bold uppercase">Consul.</span>
                                <ChevronDown size={8} className={`text-[#9CA3AF] transition-transform ${showConsultations ? 'rotate-180' : ''}`} />
                            </div>
                        </button>
                        <div className="flex-1 flex flex-col items-center py-1 border-r border-[#E5E7EB]">
                            <span className="text-sm font-bold text-[#111827] leading-none">{stats.visits}</span>
                            <span className="text-[10px] text-[#9CA3AF] font-bold uppercase mt-1">Visitas</span>
                        </div>
                        <div className="flex-1 flex flex-col items-center py-1">
                            <span className="text-sm font-bold text-[#111827] leading-none">{stats.offers}</span>
                            <span className="text-[10px] text-[#9CA3AF] font-bold uppercase mt-1">Ofertas</span>
                        </div>
                    </div>
                </div>

                {/* Col 3: Health & Tasks */}
                <div className="flex items-center justify-between lg:justify-end gap-6">
                    <div className="relative w-14 h-14 shrink-0">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle cx="28" cy="28" r="24" stroke="#F3F4F6" strokeWidth="4" fill="transparent" />
                            <circle
                                cx="28" cy="28" r="24"
                                stroke="#0D9488" strokeWidth="4" fill="transparent"
                                strokeDasharray={2 * Math.PI * 24}
                                strokeDashoffset={2 * Math.PI * 24 * (1 - qualityScore)}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[11px] font-bold text-[#0D9488] leading-tight max-w-[100px] mb-1">{quality}</p>
                        <button className="flex items-center gap-1 text-[11px] font-bold text-[#6B7280] hover:text-[#111827] transition-colors ml-auto uppercase tracking-wide">
                            <span>{pendingTasks} Tareas</span>
                            <ChevronRight size={12} strokeWidth={3} />
                        </button>
                    </div>
                </div>
            </div>

            {showConsultations && (
                <div className="px-6 pb-6 bg-[#F9FAFB] border-t border-[#E5E7EB] animate-in">
                    <ConsultationsList />
                </div>
            )}

            {/* Footer */}
            <div className="px-6 py-4 bg-[#FDFCFB] border-t border-[#E5E7EB] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-6">
                    {/* Advisors */}
                    <div className="flex items-center -space-x-2">
                        {advisors.map((adj, i) => (
                            <div
                                key={i}
                                className="w-8 h-8 rounded-full bg-[#111827] border-2 border-[#FDFCFB] flex items-center justify-center text-[10px] font-bold text-white uppercase"
                                title={`${adj.name} (${adj.role})`}
                            >
                                {adj.name.substring(0, 1)}
                            </div>
                        ))}
                        <div className="pl-4 flex flex-col">
                            <span className="text-[11px] font-bold text-[#111827] leading-none">{advisors[0].name}</span>
                            <span className="text-[9px] text-[#9CA3AF] font-bold uppercase mt-0.5">Asesores Asignados</span>
                        </div>
                    </div>

                    <div className="h-4 w-px bg-[#E5E7EB] hidden sm:block" />

                    {/* Meta-datos */}
                    <div className="flex items-center gap-5 text-[11px] font-bold text-[#6B7280] leading-none uppercase tracking-wide">
                        <span>{commission_percentage || 0}% Comisión</span>
                        <div className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                        <span>{exclusive ? 'Exclusiva' : 'No Exclusiva'}</span>
                        <div className="w-1 h-1 rounded-full bg-[#D1D5DB]" />
                        <span className="text-[#3B82F6]">{status}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 h-9 bg-white border border-[#E5E7EB] rounded-lg text-xs font-bold text-[#374151] hover:border-[#111827] transition-all">
                        <Edit3 size={14} />
                        <span>Editar propiedad</span>
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-all">
                        <MessageCircle size={16} />
                    </button>
                    <button className="flex items-center justify-center w-9 h-9 bg-white border border-[#E5E7EB] rounded-lg text-[#6B7280] hover:bg-[#F9FAFB] transition-all">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </div>
        </div>
    )
}
