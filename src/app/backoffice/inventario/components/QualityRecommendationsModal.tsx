'use client'

import React from 'react'
import { X, Check, AlertCircle, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { InventoryProperty } from '../types'
import { computeQualityScore } from '../lib/qualityScore'

interface QualityRecommendationsModalProps {
  isOpen: boolean
  onClose: () => void
  property: InventoryProperty
}

function getScoreColor(percentage: number) {
  if (percentage >= 80) return { bg: 'from-[#10B981] to-[#059669]', text: 'text-[#10B981]' }
  if (percentage >= 50) return { bg: 'from-[#F59E0B] to-[#D97706]', text: 'text-[#F59E0B]' }
  return { bg: 'from-[#EF4444] to-[#DC2626]', text: 'text-[#EF4444]' }
}

export default function QualityRecommendationsModal({ isOpen, onClose, property }: QualityRecommendationsModalProps) {
  if (!isOpen) return null

  const result = computeQualityScore(property)
  const { percentage, criteria } = result
  const scoreStyle = getScoreColor(percentage)

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
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${scoreStyle.bg} flex items-center justify-center text-white`}>
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-[20px] font-black text-[#111827] tracking-tight">Calidad de la publicación</h2>
              <p className="text-[11px] font-bold text-[#6B7B6B] uppercase tracking-widest opacity-60">
                {property.title || 'Propiedad'}
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

        {/* Body: score + list */}
        <div className="p-6 overflow-y-auto flex-1 min-h-0">
          {/* Score circle */}
          <div className="flex justify-center mb-8">
            <div className={`w-28 h-28 rounded-full bg-gradient-to-br ${scoreStyle.bg} flex items-center justify-center shadow-lg`}>
              <span className="text-3xl font-black text-white">{percentage}%</span>
            </div>
          </div>
          <p className="text-center text-[13px] text-[#6B7B6B] font-medium mb-6">
            Recomendaciones para incrementar el porcentaje de calidad de la publicación:
          </p>

          {/* Criteria list */}
          <ul className="space-y-4">
            {criteria.map((c) => (
              <li
                key={c.id}
                className={`rounded-xl border p-4 ${
                  c.ok ? 'bg-[#F0FDF4] border-[#10B981]/30' : 'bg-[#FFFBEB] border-[#F59E0B]/30'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      c.ok ? 'bg-[#10B981] text-white' : 'bg-[#F59E0B] text-white'
                    }`}
                  >
                    {c.ok ? <Check size={16} strokeWidth={2.5} /> : <AlertCircle size={16} strokeWidth={2.5} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[13px] font-bold text-[#2C3E2C]">{c.label}</span>
                      <span className="text-[11px] font-black text-[#6B7B6B] shrink-0">
                        {c.earned}/{c.max} pts
                      </span>
                    </div>
                    <p className="text-[12px] text-[#6B7B6B] leading-snug">{c.recommendation}</p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-[11px] text-[#9CA3AF] text-center">
            Los pesos de cada elemento pueden modificarse para ajustar la calificación global.
          </p>
        </div>
      </motion.div>
    </div>
  )
}
