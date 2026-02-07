'use client'

import React from 'react'
import { X, Sparkles, ThumbsUp, ThumbsDown, Target, User } from 'lucide-react'

export interface AttentionAnalysis {
  pros: string[]
  contras: string[]
  areasOportunidad: string[]
  statusCliente: string
  /** Score 0-100 (opcional; cuando exista prompt de evaluación de conversación) */
  scoreAtencion?: number
}

const MOCK_ANALYSIS: AttentionAnalysis = {
  pros: [
    'Respuesta rápida al primer contacto.',
    'Claridad en la información de la propiedad ofrecida.',
    'Seguimiento programado y cumplido.',
  ],
  contras: [
    'Demora en enviar documentación solicitada.',
    'Pocas opciones de horario para visita.',
  ],
  areasOportunidad: [
    'Enviar material de apoyo (planos, video) tras la primera consulta.',
    'Ofrecer más de un horario para agendar visita.',
    'Confirmar recordatorio 24 h antes del contacto.',
  ],
  statusCliente: 'Cliente interesado en la propiedad; pendiente de visita. Buena disposición para cerrar en el corto plazo.',
  scoreAtencion: undefined, // Próximamente: score con base en evaluación de conversación
}

interface ClientAttentionAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  /** Análisis real cuando exista integración con IA; por ahora mock */
  analysis?: AttentionAnalysis | null
}

export default function ClientAttentionAnalysisModal({
  isOpen,
  onClose,
  clientName,
  analysis = MOCK_ANALYSIS,
}: ClientAttentionAnalysisModalProps) {
  if (!isOpen) return null

  const data = analysis ?? MOCK_ANALYSIS

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-[#111827]/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-lg bg-white rounded-2xl border border-[#E5E3DB] shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E5E3DB] bg-[#FAFAFA] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#EEF2FF] border border-[#C7D2FE] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#4F46E5]" />
            </div>
            <div>
              <h3 className="text-[14px] font-black text-[#111827]">Análisis de atención al cliente</h3>
              <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">{clientName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {data.scoreAtencion != null && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[12px] font-bold text-[#166534]">Score de atención</span>
              <span className="text-[18px] font-black text-[#15803D]">{data.scoreAtencion}/100</span>
            </div>
          )}

          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-black text-[#374151] uppercase tracking-wider mb-2">
              <ThumbsUp size={14} className="text-[#10B981]" /> Pros
            </h4>
            <ul className="space-y-1.5">
              {data.pros.map((item, i) => (
                <li key={i} className="text-[13px] text-[#374151] font-medium flex gap-2">
                  <span className="text-[#10B981]">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-black text-[#374151] uppercase tracking-wider mb-2">
              <ThumbsDown size={14} className="text-[#EF4444]" /> Contras
            </h4>
            <ul className="space-y-1.5">
              {data.contras.map((item, i) => (
                <li key={i} className="text-[13px] text-[#374151] font-medium flex gap-2">
                  <span className="text-[#EF4444]">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-black text-[#374151] uppercase tracking-wider mb-2">
              <Target size={14} className="text-[#F59E0B]" /> Áreas de oportunidad
            </h4>
            <ul className="space-y-1.5">
              {data.areasOportunidad.map((item, i) => (
                <li key={i} className="text-[13px] text-[#374151] font-medium flex gap-2">
                  <span className="text-[#F59E0B]">•</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="flex items-center gap-2 text-[11px] font-black text-[#374151] uppercase tracking-wider mb-2">
              <User size={14} className="text-[#6366F1]" /> Status del cliente
            </h4>
            <p className="text-[13px] text-[#374151] font-medium leading-snug">{data.statusCliente}</p>
          </div>

          {data.scoreAtencion == null && (
            <p className="text-[11px] text-[#9CA3AF] italic border-t border-[#E5E7EB] pt-3">
              Próximamente: score de atención con base en la evaluación de la conversación (IA).
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
