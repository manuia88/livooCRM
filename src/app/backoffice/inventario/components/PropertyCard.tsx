'use client'

import React, { useState, useRef, useMemo } from 'react'
import { ChevronRight, Eye, MessageSquare, MoreHorizontal, FileText } from 'lucide-react'
import ConsultationsList from './ConsultationsList'
import VisitsList from './VisitsList'
import OffersList from './OffersList'
import QualityRecommendationsModal from './QualityRecommendationsModal'
import { getMockLeadsForProperty } from '../lib/propertyLeads'
import { InventoryProperty } from '../types'

const LEGAL_STATUS_LABELS: Record<string, string> = {
    'sin_contrato': 'Sin Contrato',
    'docs_pendientes': 'Documentos Pendientes',
    'en_revision': 'En Revisión',
    'aprobados': 'Aprobado',
    'rechazados': 'Rechazado',
    'contrato_enviado': 'Contrato Enviado',
    'contrato_firmado': 'Contrato Firmado'
}

export interface PropertyCardProps extends InventoryProperty {
    onValuationClick?: (property: InventoryProperty) => void
}

export default function PropertyCard(props: PropertyCardProps) {
    const {
        id,
        title,
        neighborhood,
        city,
        state,
        price,
        operation_type,
        stats: statsProp,
        quality,
        qualityScore,
        pendingTasks,
        advisors,
        commission_percentage,
        mls_shared,
        status,
        total_area,
        valuation,
        main_image_url,
        legal_status,
        onValuationClick
    } = props

    // Una sola fuente por propiedad: mismo lead en consulta, visita y oferta (se vinculará con calendario/contacto)
    const leadsData = useMemo(() => getMockLeadsForProperty(id, statsProp), [id, statsProp])
    const stats = leadsData.stats

    const [showConsultations, setShowConsultations] = useState(false)
    const [showVisits, setShowVisits] = useState(false)
    const [showOffers, setShowOffers] = useState(false)
    const [showQualityModal, setShowQualityModal] = useState(false)
    const [checked, setChecked] = useState(false)

    // Refs for expandable sections (scroll automático desactivado para no molestar al usar filtros)
    const consultationsRef = useRef<HTMLDivElement>(null)
    const visitsRef = useRef<HTMLDivElement>(null)
    const offersRef = useRef<HTMLDivElement>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    // Using a reliable image placeholder logic
    const imgUrl = main_image_url || "https://picsum.photos/seed/default/800/600"

    const hasDocumentation = (status as string) !== 'sin_documentacion'
    const fullAddress = `${neighborhood ? neighborhood + ', ' : ''}${city}`
    const pricePerM2 = total_area ? Math.round(price / total_area) : 0
    
    // Calculate exclusive status from mls_shared (same logic as PropertyDrawer)
    const isExclusive = !mls_shared

    const getQualityConfig = (qualityLevel: string) => {
        const level = qualityLevel.toLowerCase()
        if (level.includes('alta')) {
            return {
                gradient: 'from-[#10B981] to-[#059669]',
                label: 'Alta',
                textColor: 'text-[#10B981]'
            }
        } else if (level.includes('media')) {
            return {
                gradient: 'from-[#F59E0B] to-[#D97706]',
                label: 'Media',
                textColor: 'text-[#F59E0B]'
            }
        } else {
            return {
                gradient: 'from-[#EF4444] to-[#DC2626]',
                label: 'Baja',
                textColor: 'text-[#EF4444]'
            }
        }
    }

    const getValuationColor = (val?: string) => {
        if (!val) return 'text-[#9CA3AF]'
        const v = val.toLowerCase()
        if (v.includes('optimo') || v.includes('óptimo')) return 'text-[#10B981]'
        if (v.includes('medio') || v.includes('no_competitivo')) return 'text-[#F59E0B]'
        if (v.includes('fuera')) return 'text-[#EF4444]'
        return 'text-[#9CA3AF]'
    }

    const qualityConfig = getQualityConfig(quality)
    const valuationColor = getValuationColor(valuation)

    return (
        <div ref={cardRef} className="bg-white rounded-[14px] border border-[#E5E3DB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col">
            {/* Main content row: Image + Info */}
            <div className="flex flex-col md:flex-row">
                {/* Image Slot - Left/Top - Fixed height to prevent expansion */}
                <div className="w-full md:w-[240px] h-[200px] md:h-auto overflow-hidden relative flex-shrink-0 border-b md:border-b-0 md:border-r border-[#E5E3DB] bg-gray-200">
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="240" height="200"%3E%3Crect width="240" height="200" fill="%23ddd"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="%23999" font-family="sans-serif" font-size="14"%3EImagen no disponible%3C/text%3E%3C/svg%3E';
                    }}
                />
                {/* Mobile-only badge for quick context */}
                <div className="absolute top-3 left-3 md:hidden z-10">
                    <span className="px-2 py-1 rounded-md bg-white/90 text-[10px] font-bold text-[#111827] shadow-sm uppercase tracking-wide">
                        {operation_type}
                    </span>
                </div>
            </div>

            {/* Original Card Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header: Commission, Exclusive, Legal Status + Actions */}
                <div className="px-5 py-2 border-b border-[#E5E3DB] flex flex-col md:flex-row md:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                        {commission_percentage != null && (
                            <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-semibold text-[#6B7B6B] whitespace-nowrap">
                                Comisión: {operation_type === 'renta' ? `${commission_percentage} ${Number(commission_percentage) === 1 ? 'mes' : 'meses'}` : `${commission_percentage}%`}
                            </span>
                        )}
                        <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-semibold text-[#6B7B6B] whitespace-nowrap">
                            {isExclusive ? 'Exclusiva' : 'Opción'}
                        </span>
                        <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-semibold text-[#6B7B6B] whitespace-nowrap">
                            Legal: {legal_status ? (LEGAL_STATUS_LABELS[legal_status] ?? legal_status) : 'Sin Contrato'}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <button className="flex-1 md:flex-none px-4 py-2 bg-white border border-[#E5E3DB] rounded-lg text-[11px] font-semibold text-[#6B7B6B] hover:border-[#111827] hover:text-[#111827] hover:shadow-sm transition-all">
                            Editar
                        </button>
                        <button className="w-8 h-8 bg-white border border-[#E5E3DB] rounded-lg text-[#6B7B6B] hover:border-[#111827] hover:text-[#111827] hover:shadow-sm transition-all flex items-center justify-center flex-shrink-0">
                            <MoreHorizontal size={14} />
                        </button>
                    </div>
                </div>

                {/* Main Row: Checkbox + Property Info + Metrics + Quality + Tasks + Arrow */}
                <div className="px-4 py-3 flex flex-col xl:flex-row xl:items-center gap-4">
                    {/* Left: Checkbox + Property Info */}
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="w-4 h-4 mt-1 rounded border-2 border-[#E5E3DB] text-[#111827] focus:ring-2 focus:ring-[#111827] cursor-pointer flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                            <h3 className="text-[15px] font-bold text-[#111827] mb-0.5 leading-tight truncate sm:whitespace-normal">{title}</h3>
                            <p className="text-[12px] font-medium text-[#6B7B6B] mb-1.5 leading-tight">{fullAddress}</p>

                            <div className="flex flex-col gap-0.5 mt-1">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[22px] font-black text-[#111827] tracking-tight">
                                        ${price.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-[11px] font-bold text-[#111827] opacity-60">MXN</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[14px] font-bold ${valuationColor}`}>
                                        ${pricePerM2.toLocaleString()}/m²
                                    </span>
                                    <span className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wide bg-[#111827] text-white">
                                        {operation_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center & Right: Integrated Metrics & Quality Grid */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
                        {/* Metrics Group */}
                        <div className="flex items-center gap-3.5">
                            {[
                                { label: 'Consultas', value: stats.queries, icon: MessageSquare, action: () => { setShowConsultations(!showConsultations); setShowVisits(false); setShowOffers(false) }, isActive: showConsultations },
                                { label: 'Visitas', value: stats.visits, icon: Eye, action: () => { setShowVisits(!showVisits); setShowConsultations(false); setShowOffers(false) }, isActive: showVisits },
                                { label: 'Ofertas', value: stats.offers, icon: ChevronRight, action: () => { setShowOffers(!showOffers); setShowConsultations(false); setShowVisits(false) }, isActive: showOffers }
                            ].map((stat, i) => (
                                <div key={i} onClick={stat.action} className="flex flex-col items-center w-[60px] cursor-pointer group/stat">
                                    <div className={`w-8 h-8 rounded-xl bg-[#F3F4F6] border border-[#E5E7EB] flex items-center justify-center mb-1.5 transition-all group-hover/stat:bg-[#E5E7EB] group-hover/stat:border-[#D1D5DB] ${stat.isActive ? 'ring-2 ring-offset-2 ring-[#9CA3AF] bg-[#E5E7EB] border-[#D1D5DB]' : ''}`}>
                                        <stat.icon className="w-4 h-4 text-[#4B5563]" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-base font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{stat.value}</span>
                                    <span className="text-[9px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-14 w-px bg-[#E5E3DB]"></div>

                        {/* Quality & Valuation & Tasks Group */}
                        <div className="flex items-center gap-3.5">
                            {/* Detailed Quality Badge - click opens recommendations */}
                            <button
                                type="button"
                                onClick={() => setShowQualityModal(true)}
                                className="flex flex-col items-center w-[60px] cursor-pointer group/quality hover:opacity-90 transition-opacity"
                            >
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${qualityConfig.gradient} flex items-center justify-center shadow-md mb-1.5 group-hover/quality:scale-110 transition-transform`}>
                                    <span className="text-[12px] font-black text-white">
                                        {quality.substring(0, 1)}
                                    </span>
                                </div>
                                <span className={`text-base font-black leading-none mb-1 ${qualityConfig.textColor}`}>
                                    {qualityScore ? `${qualityScore <= 1 ? Math.round(qualityScore * 100) : qualityScore}%` : qualityConfig.label}
                                </span>
                                <span className="text-[9px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Calidad</span>
                            </button>

                            {/* Valuation Badge - click abre informe comparativo */}
                            <button
                                type="button"
                                onClick={() => onValuationClick?.(props)}
                                className="flex flex-col items-center w-[60px] cursor-pointer group/val hover:opacity-90 transition-opacity"
                            >
                                <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${valuationColor === 'text-[#10B981]' ? 'from-[#10B981] to-[#059669]' : valuationColor === 'text-[#F59E0B]' ? 'from-[#F59E0B] to-[#D97706]' : 'from-[#EF4444] to-[#DC2626]'} flex items-center justify-center shadow-md mb-1.5 group-hover/val:scale-110 transition-transform`}>
                                    <span className="text-[12px] font-black text-white">
                                        {valuation === 'optimo' ? 'O' : valuation === 'medio' || valuation === 'no_competitivo' ? 'M' : 'F'}
                                    </span>
                                </div>
                                <span className={`text-[11px] font-black leading-none mb-1 ${valuationColor}`}>
                                    {valuation === 'optimo' ? 'Óptimo' : valuation === 'medio' || valuation === 'no_competitivo' ? 'Medio' : 'Fuera'}
                                </span>
                                <span className="text-[9px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Valuación</span>
                            </button>

                            {/* Divider */}
                            <div className="hidden sm:block h-14 w-px bg-[#E5E3DB]"></div>

                            {/* Pending Tasks Pill */}
                            <div className="flex flex-col items-center w-[60px]">
                                <button className="w-8 h-8 rounded-xl bg-[#FEF3C7] border border-[#FDE047] flex items-center justify-center shadow-md mb-1.5 hover:bg-[#FDE68A] transition-colors">
                                    <FileText className="w-4 h-4 text-[#CA8A04]" strokeWidth={2.5} />
                                </button>
                                <span className="text-base font-black text-[#CA8A04] leading-none mb-1">{pendingTasks}</span>
                                <span className="text-[9px] font-extrabold text-[#CA8A04] uppercase tracking-[0.06em] opacity-80 text-center">Tareas</span>
                            </div>

                            {/* Arrow - toggles any active view */}
                            <button
                                onClick={() => {
                                    if (showConsultations || showVisits || showOffers) {
                                        setShowConsultations(false)
                                        setShowVisits(false)
                                        setShowOffers(false)
                                    } else {
                                        setShowConsultations(true)
                                    }
                                }}
                                className={`w-8 h-8 rounded-full bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-all text-[#6B7B6B] ${
                                    (showConsultations || showVisits || showOffers) ? 'rotate-90' : ''
                                }`}
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
            
            {/* Expandable Areas - Consultas, Visitas, Ofertas - Outside main flex-row */}
            {showConsultations && (
                <div ref={consultationsRef} className="px-5 pb-4 pt-3 bg-[#FAF8F3] border-t border-[#E5E3DB]">
                    <ConsultationsList items={leadsData.consultations} />
                </div>
            )}
            
            {showVisits && (
                <div ref={visitsRef} className="px-5 pb-4 pt-3 bg-[#FAF8F3] border-t border-[#E5E3DB]">
                    <VisitsList items={leadsData.visits} />
                </div>
            )}
            
            {showOffers && (
                <div ref={offersRef} className="px-5 pb-4 pt-3 bg-[#FAF8F3] border-t border-[#E5E3DB]">
                    <OffersList items={leadsData.offers} />
                </div>
            )}

            <QualityRecommendationsModal
                isOpen={showQualityModal}
                onClose={() => setShowQualityModal(false)}
                property={props}
            />
        </div>
    )
}
