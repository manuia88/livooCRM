'use client'

import React, { useState, useEffect } from 'react'
import { X, Sparkles, ThumbsUp, ThumbsDown, Target, User, MessageSquare, Eye, FileSignature } from 'lucide-react'

type EtapaKey = 'consulta' | 'visita' | 'oferta'

const ETAPAS: { key: EtapaKey; label: string; icon: React.ElementType }[] = [
  { key: 'consulta', label: 'Consulta', icon: MessageSquare },
  { key: 'visita', label: 'Visita', icon: Eye },
  { key: 'oferta', label: 'Oferta', icon: FileSignature },
]

/** Feedback de una sola etapa (consulta, visita u oferta). Más adelante: prompts por etapa para feedback preciso. */
export interface FeedbackEtapa {
  pros: string[]
  contras: string[]
  areasOportunidad: string[]
}

export interface AttentionAnalysis {
  consulta: FeedbackEtapa
  visita: FeedbackEtapa
  oferta: FeedbackEtapa
  statusCliente: string
  /** Score 0-100 (opcional; cuando exista prompt de evaluación de conversación) */
  scoreAtencion?: number
}

const MOCK_ANALYSIS: AttentionAnalysis = {
  consulta: {
    pros: [
      'Respuesta rápida al primer contacto.',
      'Claridad en la información de la propiedad ofrecida.',
    ],
    contras: [
      'Demora en enviar documentación solicitada.',
    ],
    areasOportunidad: [
      'Enviar material de apoyo (planos, video) tras la primera consulta.',
    ],
  },
  visita: {
    pros: [
      'Seguimiento programado y cumplido.',
    ],
    contras: [
      'Pocas opciones de horario para visita.',
    ],
    areasOportunidad: [
      'Ofrecer más de un horario para agendar visita.',
      'Confirmar recordatorio 24 h antes del contacto.',
    ],
  },
  oferta: {
    pros: [
      'Negociación clara y seguimiento hasta cierre.',
      'Documentación entregada a tiempo.',
    ],
    contras: [],
    areasOportunidad: [
      'Registrar fecha de firma y entrega de llaves para métricas.',
    ],
  },
  statusCliente: 'Cliente interesado en la propiedad; pendiente de visita. Buena disposición para cerrar en el corto plazo.',
  scoreAtencion: undefined,
}

function BlockEtapa({
  titulo,
  icon: Icon,
  data,
}: {
  titulo: string
  icon: React.ElementType
  data: FeedbackEtapa
}) {
  const hasContent = data.pros.length > 0 || data.contras.length > 0 || data.areasOportunidad.length > 0
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-[#FAFAFA] overflow-hidden">
      <div className="px-4 py-2.5 border-b border-[#E5E7EB] bg-white flex items-center gap-2">
        <Icon size={16} className="text-[#6B7280]" />
        <h4 className="text-[11px] font-black text-[#374151] uppercase tracking-wider">{titulo}</h4>
      </div>
      <div className="p-4 space-y-4">
        {!hasContent ? (
          <p className="text-[12px] text-[#9CA3AF] italic">Sin feedback en esta etapa aún.</p>
        ) : (
          <>
            {data.pros.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-[10px] font-black text-[#374151] uppercase tracking-wider mb-1.5">
                  <ThumbsUp size={12} className="text-[#10B981]" /> Pros
                </h5>
                <ul className="space-y-1">
                  {data.pros.map((item, i) => (
                    <li key={i} className="text-[12px] text-[#374151] font-medium flex gap-2">
                      <span className="text-[#10B981]">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.contras.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-[10px] font-black text-[#374151] uppercase tracking-wider mb-1.5">
                  <ThumbsDown size={12} className="text-[#EF4444]" /> Contras
                </h5>
                <ul className="space-y-1">
                  {data.contras.map((item, i) => (
                    <li key={i} className="text-[12px] text-[#374151] font-medium flex gap-2">
                      <span className="text-[#EF4444]">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {data.areasOportunidad.length > 0 && (
              <div>
                <h5 className="flex items-center gap-2 text-[10px] font-black text-[#374151] uppercase tracking-wider mb-1.5">
                  <Target size={12} className="text-[#F59E0B]" /> Áreas de oportunidad
                </h5>
                <ul className="space-y-1">
                  {data.areasOportunidad.map((item, i) => (
                    <li key={i} className="text-[12px] text-[#374151] font-medium flex gap-2">
                      <span className="text-[#F59E0B]">•</span> {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

/** Etapas que el cliente ha cumplido en esta propiedad (para mostrar solo pestañas con feedback relevante). */
export interface ClientStages {
  consulta: boolean
  visita: boolean
  oferta: boolean
}

interface ClientAttentionAnalysisModalProps {
  isOpen: boolean
  onClose: () => void
  clientName: string
  /** Etapas cumplidas por este cliente en esta propiedad; si no se pasa, se muestran todas las pestañas. */
  stages?: ClientStages | null
  /** Análisis real cuando exista integración con IA (prompts por etapa); por ahora mock */
  analysis?: AttentionAnalysis | null
}

export default function ClientAttentionAnalysisModal({
  isOpen,
  onClose,
  clientName,
  stages: stagesProp,
  analysis = MOCK_ANALYSIS,
}: ClientAttentionAnalysisModalProps) {
  const [etapa, setEtapa] = useState<EtapaKey>('consulta')
  if (!isOpen) return null

  const data = analysis ?? MOCK_ANALYSIS
  const titulos: Record<EtapaKey, string> = {
    consulta: 'Feedback durante la consulta',
    visita: 'Feedback durante la visita',
    oferta: 'Feedback durante la oferta',
  }
  const icons: Record<EtapaKey, React.ElementType> = {
    consulta: MessageSquare,
    visita: Eye,
    oferta: FileSignature,
  }

  const stages: ClientStages = stagesProp ?? { consulta: true, visita: true, oferta: true }
  const etapasVisibles = ETAPAS.filter(e => stages[e.key])
  const etapaValida = etapasVisibles.some(e => e.key === etapa) ? etapa : (etapasVisibles[0]?.key ?? 'consulta')

  useEffect(() => {
    if (!isOpen) return
    const s = stagesProp ?? { consulta: true, visita: true, oferta: true }
    const visibles = (['consulta', 'visita', 'oferta'] as EtapaKey[]).filter(k => s[k])
    if (!visibles.includes(etapa)) {
      setEtapa(visibles[0] ?? 'consulta')
    }
  }, [isOpen, stagesProp])

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

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {data.scoreAtencion != null && (
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0]">
              <span className="text-[12px] font-bold text-[#166534]">Score de atención</span>
              <span className="text-[18px] font-black text-[#15803D]">{data.scoreAtencion}/100</span>
            </div>
          )}

          <div className="flex gap-2">
            {etapasVisibles.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                type="button"
                onClick={() => setEtapa(key)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all ${
                  etapa === key
                    ? 'bg-[#4F46E5] text-white border-2 border-[#4F46E5]'
                    : 'bg-[#F3F4F6] text-[#6B7280] border-2 border-transparent hover:bg-[#E5E7EB]'
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          <BlockEtapa
            titulo={titulos[etapa]}
            icon={icons[etapa]}
            data={data[etapa]}
          />

          <div className="rounded-xl border border-[#E5E7EB] bg-[#F5F3FF] p-4">
            <h4 className="flex items-center gap-2 text-[11px] font-black text-[#374151] uppercase tracking-wider mb-2">
              <User size={14} className="text-[#6366F1]" /> Status del cliente
            </h4>
            <p className="text-[13px] text-[#374151] font-medium leading-snug">{data.statusCliente}</p>
          </div>

          {data.scoreAtencion == null && (
            <p className="text-[11px] text-[#9CA3AF] italic border-t border-[#E5E7EB] pt-3">
              Próximamente: score de atención y prompts por etapa (consulta, visita, oferta) para un feedback más preciso (IA).
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
