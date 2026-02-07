'use client'

import React from 'react'
import { Info } from 'lucide-react'

const statuses = [
    { label: 'Riesgo de baja', count: 14, color: '#EF4444', isCritical: true },
    { label: 'Sin contrato', count: 50, hasTooltip: true },
    { label: 'Pendientes', count: 32 },
    { label: 'En revisión', count: 2 },
    { label: 'Aprobados', count: 2 },
    { label: 'Rechazados', count: 3 },
    { label: 'Contrato enviado', count: 11 },
]

export default function StatusRibbon() {
    return (
        <div className="bg-white border-y border-[#E5E7EB] -mx-4 sm:-mx-8 lg:-mx-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center overflow-x-auto scrollbar-hide py-4 gap-8 whitespace-nowrap">
                    {statuses.map((item, i) => (
                        <div key={i} className="flex items-center gap-2 group cursor-pointer shrink-0">
                            <span
                                className={`text-lg font-bold tabular-nums ${item.isCritical ? 'text-[#EF4444]' : 'text-[#111827]'}`}
                            >
                                {item.count}
                            </span>
                            <div className="flex items-center gap-1.5">
                                <span className={`text-[13px] font-medium ${item.isCritical ? 'text-[#EF4444]' : 'text-[#6B7280]'} group-hover:text-[#111827] transition-colors`}>
                                    {item.label}
                                </span>
                                {item.hasTooltip && (
                                    <div className="relative group/tooltip">
                                        <Info size={14} className="text-[#9CA3AF] cursor-help" />
                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-[#111827] text-white text-[11px] rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-opacity z-50 shadow-xl min-w-[120px] text-center">
                                            Propiedades sin documento legal firmado
                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-4 border-x-transparent border-t-4 border-t-[#111827]" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
