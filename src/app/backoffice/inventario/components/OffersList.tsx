'use client'

import React, { useState } from 'react'
import { MoreHorizontal } from 'lucide-react'
import ClientAttentionAnalysisModal from './ClientAttentionAnalysisModal'
import type { OfferItem } from '../lib/propertyLeads'

const defaultOffers: OfferItem[] = [
  { initials: 'AC', clientName: 'Ana Castro', assignedAdvisor: 'Viola Prat', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '5 Feb 24', lastContact: '20 Feb 24', leadSource: 'Referido', phone: '55 5555 6677', amount: 12800000, offerDate: '20 Feb 24', status: 'negociando' }
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

const MESES: Record<string, number> = { Ene: 0, Jan: 0, Feb: 1, Mar: 2, Abr: 3, Apr: 3, May: 4, Jun: 5, Jul: 6, Ago: 7, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dic: 11, Dec: 11 }

/** Parsea fecha corta "d MMM yy" (ej. "28 Feb 24") y devuelve Date a medianoche local. */
function parseShortDate(s: string): Date | null {
  if (!s?.trim()) return null
  const parts = s.trim().split(/\s+/)
  if (parts.length < 3) return null
  const day = parseInt(parts[0], 10)
  const month = MESES[parts[1]]
  if (month === undefined || Number.isNaN(day)) return null
  const year = 2000 + parseInt(parts[2], 10)
  const d = new Date(year, month, day)
  return isNaN(d.getTime()) ? null : d
}

/** Vigencia = 5 días desde fecha de oferta. Calcula fecha de vencimiento. */
function getExpiryDate(offerDate: string, validUntil?: string): Date | null {
  const fromValid = validUntil ? parseShortDate(validUntil) : null
  if (fromValid) return fromValid
  const offer = parseShortDate(offerDate)
  if (!offer) return null
  const expiry = new Date(offer)
  expiry.setDate(expiry.getDate() + 5)
  return expiry
}

/** Días hasta la fecha (positivo = futuros, 0 = hoy, negativo = pasados). */
function daysUntil(date: Date): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (24 * 60 * 60 * 1000))
}

function formatExpiryMessage(days: number): string {
  if (days > 1) return `Quedan ${days} días para el vencimiento de la oferta`
  if (days === 1) return `Vence mañana`
  if (days === 0) return `Vence hoy`
  if (days === -1) return `Venció ayer`
  return `Venció hace ${-days} días`
}

function listForCount<T>(arr: T[], count: number): T[] {
  if (count <= 0) return []
  if (arr.length >= count) return arr.slice(0, count)
  const out: T[] = []
  for (let i = 0; i < count; i++) out.push(arr[i % arr.length])
  return out
}

export default function OffersList({ items, count }: { items?: OfferItem[]; count?: number }) {
  const [openAnalysisFor, setOpenAnalysisFor] = useState<string | null>(null)
  const list = items ?? listForCount(defaultOffers, count ?? 0)

  return (
    <div className="mt-4 bg-white rounded-2xl border border-[#E5E3DB] overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
      <div className="px-6 py-4 border-b border-[#E5E3DB] bg-[#FAFAFA] flex items-center justify-between">
        <h4 className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Historial de Ofertas</h4>
        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-widest">{list.length} {list.length === 1 ? 'Oferta recibida' : 'Ofertas recibidas'}</span>
      </div>
      {list.length > 0 ? (
        <div className="divide-y divide-[#E5E3DB]">
          {list.map((offer, i) => (
            <div key={i} className="px-6 py-5 hover:bg-[#FAFAFA]/50 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                <div className="flex gap-4 min-w-0 flex-1">
                  <div className="w-12 h-12 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center text-[14px] font-black text-[#374151] uppercase shrink-0">
                    {offer.initials}
                  </div>
                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className={VALUE + ' text-[15px]'}>{offer.clientName}</p>
                        <p className={LABEL + ' mt-0.5'}>Cliente</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg border tracking-widest ${
                          offer.status === 'aceptada' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : offer.status === 'rechazada' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{offer.status === 'aceptada' ? 'Aceptada' : offer.status === 'rechazada' ? 'Rechazada' : 'Negociando'}</span>
                        <button type="button" onClick={() => setOpenAnalysisFor(offer.clientName)} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827] hover:border-[#D1D5DB] transition-all" title="Ver análisis de atención (IA)" aria-label="Ver análisis de atención al cliente">
                          <MoreHorizontal size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-x-8 gap-y-5">
                      <div className="space-y-4">
                        <div><p className={VALUE}>{offer.assignedAdvisor}</p><p className={LABEL + ' mt-0.5'}>Asesor</p></div>
                        <div><p className={VALUE}>{offer.agency}</p><p className={LABEL + ' mt-0.5'}>Inmobiliaria</p></div>
                      </div>
                      <div className="space-y-4">
                        <div><p className={VALUE}>{offer.leadRegisteredAt}</p><p className={LABEL + ' mt-0.5'}>Registro</p></div>
                        <div><p className={VALUE}>{offer.lastContact}</p><p className={LABEL + ' mt-0.5'}>Último contacto</p></div>
                      </div>
                      <div className="space-y-4">
                        <div><p className={VALUE}>{offer.leadSource}</p><p className={LABEL + ' mt-0.5'}>Fuente del lead</p></div>
                        <div>
                          <a href={whatsappLink(offer.phone)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-[#25D366] hover:text-[#20BD5A] transition-colors" title="Enviar mensaje por WhatsApp">
                            <WhatsAppIcon className="w-5 h-5 shrink-0" />
                            <span className={VALUE + ' text-[#1F2937]'}>{offer.phone}</span>
                          </a>
                          <p className={LABEL + ' mt-0.5'}>Teléfono cliente</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div><p className={VALUE}>${offer.amount.toLocaleString('es-MX')} MXN</p><p className={LABEL + ' mt-0.5'}>Oferta</p></div>
                        <div><p className={VALUE}>{offer.offerDate}</p><p className={LABEL + ' mt-0.5'}>Fecha de oferta</p></div>
                      </div>
                      <div className="space-y-4">
                        <div><p className={VALUE}>{offer.closedPrice != null ? `$${offer.closedPrice.toLocaleString('es-MX')} MXN` : '—'}</p><p className={LABEL + ' mt-0.5'}>Precio de cierre</p></div>
                        <div><p className={VALUE}>{offer.closedAt ?? '—'}</p><p className={LABEL + ' mt-0.5'}>Fecha de cierre</p></div>
                      </div>
                    </div>
                    {(() => {
                      const expiry = getExpiryDate(offer.offerDate, offer.validUntil)
                      const vigenciaLabel = expiry ? expiry.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: '2-digit' }) : '—'
                      const days = expiry != null ? daysUntil(expiry) : null
                      const showCountdown = offer.status === 'negociando' && days !== null && days > -15
                      return (
                        <div className="mt-2 space-y-0.5">
                          <p className="text-[11px] text-[#6B7280]"><span className="font-semibold">Vigencia:</span> {vigenciaLabel}</p>
                          {showCountdown && (
                            <p className={`text-[11px] font-medium ${days < 0 ? 'text-red-600' : days === 0 ? 'text-amber-600' : 'text-[#6B7280]'}`}>
                              {formatExpiryMessage(days)}
                            </p>
                          )}
                        </div>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-6 py-10 text-center">
          <p className="text-[13px] font-semibold text-[#6B7280]">No hay ofertas registradas</p>
        </div>
      )}

      {openAnalysisFor && (
        <ClientAttentionAnalysisModal isOpen={!!openAnalysisFor} onClose={() => setOpenAnalysisFor(null)} clientName={openAnalysisFor} />
      )}
    </div>
  )
}
