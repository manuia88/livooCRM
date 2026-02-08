'use client'

import React, { useMemo } from 'react'
import { X, Share2, ChevronRight, TrendingUp } from 'lucide-react'
import { motion } from 'framer-motion'
import { InventoryProperty } from '../types'
import { buildValuationReport, PriceBucketKind } from '../lib/valuationReport'

interface ValuationModalProps {
  isOpen: boolean
  onClose: () => void
  /** Propiedad a valuar; si es null se muestra mensaje para elegir una. */
  property: InventoryProperty | null
  /** Todas las propiedades del CRM (propias, inmobiliaria, red, MLS) para el análisis comparativo. */
  allProperties: InventoryProperty[]
}

const BUCKET_COLORS: Record<PriceBucketKind, string> = {
  optimo: 'bg-[#10B981]/20 border-[#10B981]',
  no_competitivo: 'bg-[#F59E0B]/20 border-[#F59E0B]',
  fuera_mercado: 'bg-[#EF4444]/20 border-[#EF4444]'
}

export default function ValuationModal({ isOpen, onClose, property, allProperties }: ValuationModalProps) {
  const report = useMemo(() => {
    if (!property || allProperties.length === 0) return null
    return buildValuationReport(property, allProperties)
  }, [property, allProperties])

  if (!isOpen) return null

  const maxCount = report ? Math.max(1, ...report.buckets.map(b => b.count)) : 1

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
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-[32px] shadow-2xl overflow-hidden border border-[#E5E3DB]"
      >
        {/* Header */}
        <div className="p-6 border-b border-[#E5E3DB] flex items-center justify-between bg-[#FAF8F3]/50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center text-[#B8975A]">
              <TrendingUp size={20} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-[#111827] tracking-tight">
                Análisis de Valuación
              </h2>
              <p className="text-[11px] font-bold text-[#6B7B6B] uppercase tracking-widest opacity-60">
                {report ? report.property.title : 'Estudio de mercado y análisis comparativo'}
              </p>
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
        <div className="p-6 overflow-y-auto flex-1 min-h-0 space-y-6">
          {!report ? (
            <p className="text-[14px] text-[#6B7B6B] text-center py-8">
              Haz clic en el ícono de <strong>Valuación</strong> de una tarjeta de propiedad para ver el informe comparativo.
            </p>
          ) : (
            <>
              {/* Título de diagnóstico */}
              <div className="rounded-xl border border-[#E5E3DB] bg-[#FAF8F3] px-4 py-3">
                <h3 className="text-[16px] font-black text-[#2C3E2C]">
                  {report.diagnosisTitle}
                </h3>
              </div>

              {/* Gráfico: Distribución de precios / m² */}
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <span className="text-[11px] font-black text-[#6B7B6B] uppercase tracking-widest">
                    Distribución de Precios / m²
                  </span>
                  <span className="text-[12px] font-black text-[#111827]">
                    MXN {Math.round(report.pricePerM2).toLocaleString('es-MX')} / m²
                  </span>
                </div>
                <div className="h-28 flex items-end gap-1 px-0">
                  {report.buckets.map((bucket, i) => {
                    const heightPct = maxCount > 0 ? (bucket.count / maxCount) * 100 : 0
                    const isCurrent = i === report.currentBucketIndex
                    return (
                      <div
                        key={i}
                        className="flex-1 min-w-0 flex flex-col items-center gap-0.5 relative"
                      >
                        <div
                          className={`w-full min-h-[4px] rounded-t border-t-2 ${BUCKET_COLORS[bucket.kind]}`}
                          style={{ height: `${Math.max(8, heightPct)}%` }}
                        />
                        {isCurrent && (
                          <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-[#111827] text-white text-[9px] font-black rounded shadow">
                            ACTUAL
                          </div>
                        )}
                        <span className="text-[9px] font-bold text-[#6B7B6B] mt-1">
                          {bucket.count}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between text-[9px] font-black text-[#6B7B6B] uppercase tracking-[0.2em] opacity-60">
                  <span>{report.buckets[0] ? `${Math.round(report.buckets[0].minM2).toLocaleString('es-MX')}` : ''}</span>
                  <span>Óptimo</span>
                  <span>No competitivo</span>
                  <span>Fuera</span>
                  <span>{report.buckets.length ? `${Math.round(report.buckets[report.buckets.length - 1].maxM2).toLocaleString('es-MX')}` : ''}</span>
                </div>
                {/* Leyenda */}
                <div className="flex flex-wrap gap-4 pt-2">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B7B6B]">
                    <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Precio óptimo
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B7B6B]">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Precio no competitivo
                  </span>
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#6B7B6B]">
                    <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Precio fuera de mercado
                  </span>
                </div>
              </div>

              {/* Conclusiones */}
              <div className="bg-[#FAF8F3] rounded-2xl p-6 border border-[#E5E3DB] border-dashed">
                <h3 className="text-[12px] font-black text-[#2C3E2C] uppercase tracking-widest mb-4 opacity-70">
                  Conclusiones del análisis comparativo
                </h3>
                <ul className="space-y-3">
                  <li className="flex gap-3 text-[13px] text-[#374151] font-bold leading-snug">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A] mt-1.5 shrink-0" />
                    Se encontraron {report.conclusions.totalSimilar} propiedades similares (mismo tipo, ciudad y superficie ±40%).
                  </li>
                  <li className="flex gap-3 text-[13px] text-[#374151] font-bold leading-snug">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A] mt-1.5 shrink-0" />
                    Hay {report.conclusions.withLowerPrice} propiedades con un precio por m² más bajo.
                  </li>
                  <li className="flex gap-3 text-[13px] text-[#374151] font-bold leading-snug">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A] mt-1.5 shrink-0" />
                    Hay {report.conclusions.withLowerPriceAndLargerSurface} propiedades con precio más bajo y mayor superficie.
                  </li>
                  <li className="flex gap-3 text-[13px] text-[#374151] font-bold leading-snug">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A] mt-1.5 shrink-0" />
                    Las propiedades con precio no competitivo tienen en promedio {report.conclusions.avgDaysListedNonCompetitive} días publicadas.
                  </li>
                  <li className="flex gap-3 text-[13px] text-[#374151] font-bold leading-snug">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#B8975A] mt-1.5 shrink-0" />
                    {report.recommendationText}
                  </li>
                </ul>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {report && (
          <div className="p-6 bg-white border-t border-[#E5E3DB] flex items-center justify-between gap-4 shrink-0">
            <button
              type="button"
              className="flex items-center gap-2 px-6 h-12 bg-white border border-[#E5E3DB] rounded-xl text-[12px] font-black text-[#111827] hover:bg-[#FAF8F3] transition-all active:scale-95 shadow-sm"
            >
              <Share2 size={16} />
              <span>COMPARTIR</span>
            </button>
            <button
              type="button"
              className="flex-1 flex items-center justify-center gap-2 px-8 h-12 bg-[#111827] text-white rounded-xl text-[12px] font-black hover:bg-black transition-all shadow-xl shadow-black/10 active:scale-95"
            >
              <span>EDITAR COMPARABLES ({report.conclusions.totalSimilar})</span>
              <ChevronRight size={16} strokeWidth={3} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}
