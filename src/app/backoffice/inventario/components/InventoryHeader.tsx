'use client'

import React from 'react'
import { Search, ChevronDown, ArrowUpDown, Plus } from 'lucide-react'

export default function InventoryHeader() {
    return (
        <div className="space-y-6">
            {/* Breadcrumb / Orden */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                    <span className="font-medium">Orden:</span>
                    <span className="text-[#111827] font-semibold">Relevancia</span>
                    <div className="w-1 h-1 rounded-full bg-[#D1D5DB] mx-1" />
                    <button className="text-[#6B7280] hover:text-[#111827] font-medium transition-colors">
                        Borrar filtros
                    </button>
                </div>
            </div>

            {/* Primary Header Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Barra de Búsqueda */}
                <div className="flex-1 relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#111827] transition-colors">
                        <Search size={18} strokeWidth={1.8} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por dirección, ID, código interno..."
                        className="w-full h-12 pl-12 pr-4 bg-white border border-[#E5E7EB] rounded-xl text-sm focus:border-[#111827] focus:ring-4 focus:ring-black/[0.03] transition-all placeholder:text-[#9CA3AF]"
                    />
                </div>

                {/* Acciones Segmento Derecho */}
                <div className="flex flex-wrap items-center gap-3">
                    {/* Selector: Estado de documentación */}
                    <button className="flex items-center justify-between gap-3 px-4 h-12 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all">
                        <span>Estado de documentación</span>
                        <ChevronDown size={16} className="text-[#9CA3AF]" />
                    </button>

                    {/* Selector: Actividad */}
                    <button className="flex items-center justify-between gap-3 px-4 h-12 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all">
                        <span>Actividad</span>
                        <ChevronDown size={16} className="text-[#9CA3AF]" />
                    </button>

                    {/* Selector: Ordenar por */}
                    <button className="flex items-center justify-between gap-3 px-4 h-12 bg-white border border-[#E5E7EB] rounded-xl text-sm font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all">
                        <ArrowUpDown size={16} className="text-[#9CA3AF]" />
                        <span>Ordenar por</span>
                    </button>

                    {/* Botón Nueva propiedad */}
                    <button className="flex items-center gap-2 px-6 h-12 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-[#1F2937] active:scale-95 transition-all shadow-lg shadow-black/10">
                        <Plus size={18} strokeWidth={2.5} />
                        <span>Nueva propiedad</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
