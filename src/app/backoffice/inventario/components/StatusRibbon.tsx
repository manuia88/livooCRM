'use client'

import React from 'react'
import { Info } from 'lucide-react'

const statuses = [
    { label: 'Sin Contrato', value: 'sin_contrato', hasTooltip: true },
    { label: 'Documentos Pendientes', value: 'documentos_pendientes' },
    { label: 'En Revisión', value: 'en_revision' },
    { label: 'Aprobados', value: 'aprobados' },
    { label: 'Rechazados', value: 'rechazados' },
    { label: 'Contrato Enviado', value: 'contrato_enviado' },
    { label: 'Contrato Firmado', value: 'contrato_firmado' },
]

interface StatusRibbonProps {
    selectedStatus?: string | null
    onStatusClick?: (status: string) => void
}

export default function StatusRibbon({ selectedStatus, onStatusClick }: StatusRibbonProps) {
    return (
        <div className="bg-[#FAF8F3]/40 border-y border-[#E5E3DB] -mx-4 sm:-mx-8 lg:-mx-12 py-5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide whitespace-nowrap scroll-smooth">
                    {statuses.map((item, i) => {
                        const isActive = selectedStatus === item.value
                        return (
                            <div
                                key={i}
                                className="flex items-center gap-2.5 shrink-0 group cursor-pointer"
                                onClick={() => onStatusClick?.(item.value)}
                            >
                                {/* Placeholder box for future counter */}
                                <div className={`h-7 w-10 rounded-lg border flex items-center justify-center shadow-sm transition-all ${isActive
                                        ? 'bg-[#B8975A] border-[#B8975A]'
                                        : 'bg-white border-[#E5E3DB] group-hover:border-[#B8975A]'
                                    }`}>
                                    <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isActive
                                            ? 'bg-white'
                                            : 'bg-[#E5E3DB] group-hover:bg-[#B8975A]'
                                        }`} />
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className={`text-[10px] font-bold uppercase tracking-[0.02em] transition-all leading-tight ${isActive
                                            ? 'text-[#111827] opacity-100'
                                            : 'text-[#6B7B6B] opacity-70 group-hover:opacity-100 group-hover:text-[#111827]'
                                        }`}>
                                        {item.label}
                                    </span>
                                    {item.hasTooltip && (
                                        <div className="relative group/tooltip">
                                            <Info size={12} className="text-[#B8975A] cursor-help opacity-40 group-hover/tooltip:opacity-100 transition-opacity" />
                                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 px-3 py-2 bg-[#111827] text-white text-[10px] font-bold rounded-lg opacity-0 pointer-events-none group-hover/tooltip:opacity-100 transition-all z-50 shadow-xl min-w-[140px] text-center border border-white/10 uppercase tracking-widest">
                                                Documentación pendiente de firma
                                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-x-[5px] border-x-transparent border-t-[5px] border-t-[#111827]" />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
