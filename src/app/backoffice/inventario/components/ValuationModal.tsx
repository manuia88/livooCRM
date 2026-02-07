'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { X, Share2, AlertCircle, ChevronRight } from 'lucide-react'

interface ValuationModalProps {
    onClose: () => void
}

export default function ValuationModal({ onClose }: ValuationModalProps) {
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
            />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 20, scale: 0.95 }}
                className="relative w-full max-w-[680px] bg-white rounded-[28px] shadow-2xl overflow-hidden"
            >
                {/* Banner Amarillo */}
                <div className="bg-[#FEF3C7] border-b border-[#FDE68A] px-6 py-4 flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F59E0B] flex items-center justify-center text-white shrink-0">
                        <AlertCircle size={14} strokeWidth={3} />
                    </div>
                    <p className="text-sm font-bold text-[#92400E]">El precio de la propiedad es poco competitivo</p>
                    <button
                        onClick={onClose}
                        className="ml-auto text-[#B45309] hover:bg-black/5 rounded-full p-2 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    <div>
                        <h2 className="text-[20px] font-bold text-[#111827]">Análisis de Valuación</h2>
                        <p className="text-sm text-[#6B7280] font-medium mt-1">Comparativa basada en 24 propiedades similares en la zona</p>
                    </div>

                    {/* Gráfico Comparativo */}
                    <div className="space-y-6">
                        <div className="h-24 flex items-end gap-1.5 relative">
                            {/* Optimal Range (Green) */}
                            <div className="flex-1 h-[40%] bg-[#0D9488]/10 border-t-2 border-[#0D9488] rounded-t-lg relative group">
                                <div className="absolute inset-0 bg-[#0D9488]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {/* Non-competitive (Yellow) */}
                            <div className="flex-1 h-[70%] bg-[#F59E0B]/10 border-t-2 border-[#F59E0B] rounded-t-lg relative group">
                                <div className="absolute inset-0 bg-[#F59E0B]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            {/* Off-market (Red) */}
                            <div className="flex-1 h-[100%] bg-[#EF4444]/10 border-t-2 border-[#EF4444] rounded-t-lg relative group">
                                <div className="absolute inset-0 bg-[#EF4444]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>

                            {/* Indicador Actual */}
                            <div className="absolute left-[65%] top-0 bottom-0 w-px bg-[#6B7280] dashed border-l border-dashed border-[#6B7280] flex flex-col items-center">
                                <div className="absolute -top-8 px-2 py-1 bg-[#111827] text-white text-[11px] font-bold rounded-md whitespace-nowrap shadow-lg">
                                    Actual: 40,000 MXN/m²
                                </div>
                                <div className="w-2 h-2 rounded-full bg-[#111827] mt-auto -mb-1 shadow-md" />
                            </div>
                        </div>

                        <div className="flex justify-between text-[11px] font-bold text-[#9CA3AF] uppercase tracking-wider">
                            <span>$21,800</span>
                            <span className="text-[#0D9488]">Óptimo</span>
                            <span className="text-[#F59E0B]">No competitivo</span>
                            <span className="text-[#EF4444]">Fuera de mercado</span>
                            <span>$54,200</span>
                        </div>
                    </div>

                    {/* Conclusiones */}
                    <div className="bg-[#F9FAFB] rounded-2xl p-6 border border-[#E5E7EB]">
                        <h3 className="text-[15px] font-bold text-[#111827] mb-4">Conclusiones</h3>
                        <ul className="space-y-3">
                            {[
                                'El precio por m² es 15% superior al promedio de la zona.',
                                'Se identificaron 24 propiedades con características similares a menor precio.',
                                'Recomendación: Ajustar un 8% para entrar en el rango de alta competitividad.'
                            ].map((point, i) => (
                                <li key={i} className="flex gap-3 text-sm text-[#374151] font-medium leading-normal">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[#111827] mt-1.5 shrink-0" />
                                    {point}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white border-t border-[#E5E7EB] p-6 flex items-center justify-between gap-4">
                    <button className="flex items-center gap-2 px-6 h-12 bg-white border border-[#E5E7EB] rounded-xl text-sm font-bold text-[#374151] hover:bg-[#F9FAFB] transition-all active:scale-95">
                        <Share2 size={18} />
                        <span>Compartir</span>
                    </button>
                    <button className="flex items-center gap-2 px-8 h-12 bg-[#111827] text-white rounded-xl text-sm font-bold hover:bg-[#1F2937] transition-all active:scale-95 shadow-lg shadow-black/10">
                        <span>Ver o editar comparables (24)</span>
                        <ChevronRight size={18} />
                    </button>
                </div>
            </motion.div>
        </div>
    )
}
