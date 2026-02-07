'use client'

import React, { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import ClientAttentionAnalysisModal from './ClientAttentionAnalysisModal'
import type { VisitItem } from '../lib/propertyLeads'

const defaultVisits: VisitItem[] = [
  { initials: 'MP', clientName: 'María Pérez', assignedAdvisor: 'Viola Prat', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '8 Feb 24', lastContact: '15 Feb 24', leadSource: 'Recomendación', phone: '55 1111 2222', visitDate: '15 Feb 24', propertiesVisitedCount: 1, lastVisitDate: '15 Feb 24', etapa: 'COMPLETADA' },
  { initials: 'JL', clientName: 'Juan López', assignedAdvisor: 'Laura Torres', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '12 Feb 24', lastContact: '18 Feb 24', leadSource: 'Portal Inmuebles', phone: '55 3333 4444', visitDate: '18 Feb 24', propertiesVisitedCount: 2, lastVisitDate: '18 Feb 24', etapa: 'PENDIENTE' }
]

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits.length === 10 ? `52${digits}` : digits}`
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  )
}

const LABEL = 'text-[10px] font-bold text-[#6B7280] uppercase tracking-wider'
const VALUE = 'text-[12px] font-semibold text-[#1F2937]'

function listForCount<T>(arr: T[], count: number): T[] {
  if (count <= 0) return []
  if (arr.length >= count) return arr.slice(0, count)
  const out: T[] = []
  for (let i = 0; i < count; i++) out.push(arr[i % arr.length])
  return out
}

export default function VisitsList({ items, count }: { items?: VisitItem[]; count?: number }) {
  const [openAnalysisFor, setOpenAnalysisFor] = useState<string | null>(null)
  const list = items ?? listForCount(defaultVisits, count ?? 0)

  return (
    <div className="mt-4 bg-white rounded-2xl border border-[#E5E3DB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="px-6 py-4 border-b border-[#E5E3DB] bg-[#FAFAFA] flex items-center justify-between">
        <h4 className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Historial de Visitas</h4>
        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{list.length} Visitas registradas</span>
      </div>
      {list.length === 0 ? (
        <div className="px-6 py-10 text-center">
          <p className="text-[13px] font-semibold text-[#6B7280]">No hay visitas registradas para esta propiedad</p>
        </div>
      ) : (
      <div className="divide-y divide-[#E5E3DB]">
        {list.map((v, i) => (
          <div key={i} className="px-6 py-5 hover:bg-[#FAFAFA]/50 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5">
              <div className="flex gap-4 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[14px] font-black text-[#374151] uppercase shrink-0">
                  {v.initials}
                </div>
                <div className="min-w-0 flex-1 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className={VALUE + ' text-[15px]'}>{v.clientName}</p>
                      <p className={LABEL + ' mt-0.5'}>Cliente</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border tracking-widest ${v.etapa === 'COMPLETADA' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>{v.etapa}</span>
                      <button type="button" onClick={() => setOpenAnalysisFor(v.clientName)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] hover:border-[#D1D5DB] transition-all" title="Ver análisis de atención (IA)" aria-label="Ver análisis de atención al cliente">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-5">
                    <div className="space-y-4">
                      <div className="text-center"><p className={VALUE}>{v.assignedAdvisor}</p><p className={LABEL + ' mt-0.5'}>Asesor</p></div>
                      <div className="text-center"><p className={VALUE}>{v.agency}</p><p className={LABEL + ' mt-0.5'}>Inmobiliaria</p></div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center"><p className={VALUE}>{v.leadRegisteredAt}</p><p className={LABEL + ' mt-0.5'}>Registro</p></div>
                      <div className="text-center"><p className={VALUE}>{v.lastContact}</p><p className={LABEL + ' mt-0.5'}>Último contacto</p></div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center"><p className={VALUE}>{v.leadSource}</p><p className={LABEL + ' mt-0.5'}>Fuente del lead</p></div>
                      <div className="text-center">
                        <a href={whatsappLink(v.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20BD5A] transition-colors" title="Enviar mensaje por WhatsApp">
                          <WhatsAppIcon className="w-5 h-5 shrink-0" />
                          <span className={VALUE + ' text-[#1F2937]'}>{v.phone}</span>
                        </a>
                        <p className={LABEL + ' mt-0.5'}>Teléfono cliente</p>
                      </div>
                    </div>
                  </div>
                  {/* Flujo visita: primera visita, propiedades visitadas, última visita */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-4 pt-3 border-t border-[#E5E7EB]">
                    <div className="text-center">
                      <p className={VALUE}>{v.visitDate}</p>
                      <p className={LABEL + ' mt-0.5'}>Primera visita</p>
                    </div>
                    <div className="text-center">
                      <p className={VALUE}>{v.propertiesVisitedCount ?? 0}</p>
                      <p className={LABEL + ' mt-0.5'}>Propiedades visitadas</p>
                    </div>
                    <div className="text-center">
                      <p className={VALUE}>{v.lastVisitDate}</p>
                      <p className={LABEL + ' mt-0.5'}>Última visita</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {openAnalysisFor && (
        <ClientAttentionAnalysisModal isOpen={!!openAnalysisFor} onClose={() => setOpenAnalysisFor(null)} clientName={openAnalysisFor} />
      )}
    </div>
  )
}
