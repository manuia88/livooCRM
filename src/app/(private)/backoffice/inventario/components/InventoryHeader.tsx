'use client'

import React from 'react'
import { Search, Plus, Filter, LayoutGrid, ChevronDown } from 'lucide-react'

export default function InventoryHeader() {
    return (
        <div className="space-y-6 pt-6 pb-2">
            {/* Title Section: Professional & Sharp */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-[28px] font-black text-[#111827] tracking-tighter leading-none">
                        Inventario de Propiedades
                    </h1>
                    <p className="text-[14px] font-bold text-[#6B7B6B] mt-2 uppercase tracking-widest opacity-70">
                        Control de activos y gestión de embudos
                    </p>
                </div>

                <button className="flex items-center gap-2.5 px-8 h-12 bg-[#111827] text-white rounded-xl text-[14px] font-black hover:bg-black transition-all shadow-[0_4px_12px_rgba(0,0,0,0.1)] active:scale-95">
                    <Plus size={18} strokeWidth={3} />
                    <span>NUEVA PROPIEDAD</span>
                </button>
            </div>

            {/* Unified Search & Multi-Filters Bar */}
            <div className="flex flex-col xl:flex-row items-center gap-3">
                {/* Compact Search Bar */}
                <div className="relative flex-1 w-full group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7B6B] group-focus-within:text-[#111827] transition-colors">
                        <Search size={18} strokeWidth={2.5} />
                    </div>
                    <input
                        type="text"
                        placeholder="Buscar por ID, calle, cliente o asesor..."
                        className="w-full h-12 pl-12 pr-6 bg-white border border-[#E5E3DB] rounded-xl text-[14px] sm:text-[15px] font-bold text-[#111827] placeholder:text-[#6B7B6B]/50 focus:outline-none focus:ring-2 focus:ring-[#111827]/5 focus:border-[#111827] transition-all shadow-sm"
                    />
                </div>

                {/* Action Group: High Density */}
                <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full xl:w-auto">
                    <button className="flex-1 sm:flex-none flex items-center justify-between gap-3 px-5 h-12 bg-white border border-[#E5E3DB] rounded-xl text-[12px] sm:text-[13px] font-black text-[#111827] hover:bg-[#FAF8F3] transition-all shadow-sm min-w-[120px]">
                        <span className="opacity-60">ESTADO</span>
                        <ChevronDown size={16} className="text-[#B8975A]" />
                    </button>

                    <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 h-12 bg-white border border-[#E5E3DB] rounded-xl text-[12px] sm:text-[13px] font-black text-[#111827] hover:bg-[#FAF8F3] transition-all shadow-sm min-w-[120px]">
                        <Filter size={16} className="text-[#B8975A]" />
                        <span>FILTROS</span>
                    </button>

                    <div className="hidden sm:block w-px h-6 bg-[#E5E3DB] mx-1" />

                    <button className="hidden sm:flex w-12 h-12 items-center justify-center bg-white border border-[#E5E3DB] rounded-xl text-[#111827] hover:bg-[#FAF8F3] transition-all shadow-sm">
                        <LayoutGrid size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
