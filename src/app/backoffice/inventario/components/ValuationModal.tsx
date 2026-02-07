'use client'

import React from 'react'
import { X, Share2, ChevronRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'

interface ValuationModalProps {
    isOpen: boolean
    onClose: () => void
}

export default function ValuationModal({ isOpen, onClose }: ValuationModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#E5E3DB]"
            >
                {/* Header */}
                <div className="p-8 border-b border-[#E5E3DB] flex items-center justify-between bg-[#FAF8F3]/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-[#B8975A]">
                            <TrendingUp size={20} />
                        </div>
                        <div>
                            <h2 className="text-[20px] font-black text-[#111827] tracking-tight">Análisis de Valuación</h2>
                            <p className="text-[11px] font-bold text-[#6B7B6B] uppercase tracking-widest opacity-60">Benchmarks de mercado en tiempo real</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-[#E5E3DB] text-[#6B7280] hover:text-[#111827] hover:border-[#111827] transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 space-y-8">
                    {/* Comparative Graph area */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-[11px] font-black text-[#6B7B6B] uppercase tracking-widest">Distribución de Precios / m²</span>
                            <span className="text-[12px] font-black text-[#111827]">MXN $40,000</span>
                        </div>
                        <div className="h-24 flex items-end gap-2 px-1">
                            {/* Simple, sharp bars */}
                            <div className="flex-1 h-[30%] bg-[#0D9488]/10 border-t-2 border-[#0D9488] rounded-t-lg relative" />
                            <div className="flex-1 h-[60%] bg-[#F59E0B]/10 border-t-2 border-[#F59E0B] rounded-t-lg relative" />
                            <div className="flex-1 h-[100%] bg-[#EF4444]/10 border-t-2 border-[#EF4444] rounded-t-lg relative" />

                            {/* Current price marker */}
                            <div className="absolute left-[65%] top-0 bottom-0 w-px border-l-2 border-dashed border-[#111827]/40 flex flex-col items-center">
                                <div className="absolute -top-8 px-2.5 py-1 bg-[#111827] text-white text-[10px] font-black rounded-lg shadow-lg">ACTUAL</div>
                                <div className="w-3 h-3 rounded-full bg-[#111827] border-2 border-white shadow-sm mt-auto -mb-1.5" />
                            </div>
                        </div>
                        <div className="flex justify-between text-[9px] font-black text-[#6B7B6B] uppercase tracking-[0.2em] opacity-40">
                            <span>$21k Min</span>
                            <span>Óptimo</span>
                            <span>Competencia</span>
                            <span>Fuera</span>
                            <span>$54k Max</span>
                        </div>
                    </div>

                    {/* Conclusions */}
                    <div className="bg-[#FAF8F3] rounded-2xl p-6 border border-[#E5E3DB] border-dashed">
                        <h3 className="text-[12px] font-black text-[#2C3E2C] uppercase tracking-widest mb-4 opacity-70">Diagnóstico Estratégico</h3>
                        <ul className="space-y-3">
                            {[
                                'El precio por m² es 15% superior al promedio de la zona.',
                                'Se identificaron 24 propiedades comparables con mayor absorción.',
                                'Recomendación: Ajuste del 8% para penetrar el rango óptimo.'
                            ].map((point, i) => (
                                <li key={i} className="flex gap-3 text-[13px] text-[#374151] font-bold leading-snug">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A] mt-1.5 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 bg-white border-t border-[#E5E3DB] flex items-center justify-between gap-4">
                    <button className="flex items-center gap-2 px-6 h-12 bg-white border border-[#E5E3DB] rounded-xl text-[12px] font-black text-[#111827] hover:bg-[#FAF8F3] transition-all active:scale-95 shadow-sm">
                        <Share2 size={16} />
                        <span>COMPARTIR</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center gap-2 px-8 h-12 bg-[#111827] text-white rounded-xl text-[12px] font-black hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95">
                        <span>EDITAR COMPARABLES (24)</span>
                        <ChevronRight size={16} strokeWidth={3} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
