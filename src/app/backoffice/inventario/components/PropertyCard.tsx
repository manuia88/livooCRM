'use client'

import React, { useState } from 'react'
import { ChevronRight, Eye, MessageSquare, MoreHorizontal, FileText } from 'lucide-react'
import ConsultationsList from './ConsultationsList'
import { InventoryProperty } from '../types'

export default function PropertyCard(props: InventoryProperty) {
    const {
        id,
        title,
        neighborhood,
        city,
        state,
        price,
        operation_type,
        stats,
        quality,
        qualityScore,
        pendingTasks,
        advisors,
        commission_percentage,
        exclusive,
        status,
        total_area,
        valuation,
        main_image_url
    } = props

    const [showConsultations, setShowConsultations] = useState(false)
    const [checked, setChecked] = useState(false)

    // Using a reliable image placeholder logic
    const imgUrl = main_image_url || "https://images.unsplash.com/photo-1600596542815-2a4f04d5d159?auto=format&fit=crop&w=800&q=80"

    const producer = advisors[0] || { name: 'Viola Prat', role: 'Productor' }
    const seller = advisors[1] || advisors[0] || { name: 'Viola Prat', role: 'Vendedor' }

    const hasDocumentation = (status as string) !== 'sin_documentacion'
    const fullAddress = `${neighborhood ? neighborhood + ', ' : ''}${city}`
    const pricePerM2 = total_area ? Math.round(price / total_area) : 0

    const getQualityConfig = (qualityLevel: string) => {
        const level = qualityLevel.toLowerCase()
        if (level.includes('alta')) {
            return {
                gradient: 'from-[#10B981] to-[#059669]',
                label: 'Alta'
            }
        } else if (level.includes('media')) {
            return {
                gradient: 'from-[#F59E0B] to-[#D97706]',
                label: 'Media'
            }
        } else {
            return {
                gradient: 'from-[#EF4444] to-[#DC2626]',
                label: 'Baja'
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
        <div className="bg-white rounded-[24px] border border-[#E5E3DB] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all duration-300 overflow-hidden flex flex-col md:flex-row min-h-[220px]">

            {/* Image Slot - Left/Top */}
            <div className="w-full md:w-[260px] h-[200px] md:h-auto min-h-[220px] overflow-hidden relative flex-shrink-0 border-b md:border-b-0 md:border-r border-[#E5E3DB] bg-gray-100">
                <img
                    src={imgUrl}
                    alt={title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.currentTarget.src = "https://images.unsplash.com/photo-1600596542815-2a4f04d5d159?auto=format&fit=crop&w=800&q=80"
                    }}
                />
                {/* Mobile-only badge for quick context */}
                <div className="absolute top-3 left-3 md:hidden">
                    <span className="px-2 py-1 rounded-md bg-white/90 text-[10px] font-bold text-[#111827] shadow-sm uppercase tracking-wide">
                        {operation_type}
                    </span>
                </div>
            </div>

            {/* Original Card Content Wrapper */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Header: Advisors + Commission Info + Actions */}
                <div className="px-5 py-4 border-b border-[#E5E3DB] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        {/* Producers/Sellers Group */}
                        <div className="flex items-center gap-4">
                            {/* Producer Avatar */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm flex-shrink-0">
                                    {producer.name.substring(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-[#111827] leading-tight">{producer.name}</span>
                                    <span className="text-[10px] font-medium text-[#9CA3AF] leading-tight">{producer.role}</span>
                                </div>
                            </div>

                            {/* Visual Separator */}
                            <div className="h-8 w-px bg-[#E5E3DB] hidden sm:block"></div>

                            {/* Seller Avatar */}
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-[11px] font-bold shadow-sm flex-shrink-0">
                                    {seller.name.substring(0, 2)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[12px] font-bold text-[#111827] leading-tight">{seller.name}</span>
                                    <span className="text-[10px] font-medium text-[#9CA3AF] leading-tight">{seller.role}</span>
                                </div>
                            </div>
                        </div>

                        {/* Commission & Status Badges */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-semibold text-[#6B7B6B] whitespace-nowrap">
                                {commission_percentage}%
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-[#F3F4F6] text-[11px] font-semibold text-[#6B7B6B] whitespace-nowrap">
                                {exclusive ? 'Exc.' : 'No Exc.'}
                            </span>
                        </div>
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
                <div className="p-5 flex flex-col xl:flex-row xl:items-center gap-6">
                    {/* Left: Checkbox + Property Info */}
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => setChecked(e.target.checked)}
                            className="w-4 h-4 mt-1 rounded border-2 border-[#E5E3DB] text-[#111827] focus:ring-2 focus:ring-[#111827] cursor-pointer flex-shrink-0"
                        />

                        <div className="flex-1 min-w-0">
                            <h3 className="text-[16px] font-bold text-[#111827] mb-1 leading-tight truncate sm:whitespace-normal">{title}</h3>
                            <p className="text-[12px] font-medium text-[#6B7B6B] mb-3 leading-tight">{fullAddress}</p>

                            <div className="flex flex-col gap-1 mt-2">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-[24px] font-black text-[#111827] tracking-tight">
                                        ${price.toLocaleString('es-MX', { minimumFractionDigits: 0 })}
                                    </span>
                                    <span className="text-[12px] font-bold text-[#111827] opacity-60">MXN</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[13px] font-bold ${valuationColor}`}>
                                        ${pricePerM2.toLocaleString()}/m²
                                    </span>
                                    <span className="px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wide bg-[#111827] text-white">
                                        {operation_type}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Center & Right: Integrated Metrics & Quality Grid */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        {/* Metrics Group */}
                        <div className="flex items-center gap-6">
                            {[
                                {
                                    label: 'Consultas',
                                    value: stats.queries,
                                    icon: MessageSquare,
                                    action: true,
                                    gradient: 'from-[#0EA5E9] to-[#0284C7]'
                                },
                                {
                                    label: 'Visitas',
                                    value: stats.visits,
                                    icon: Eye,
                                    gradient: 'from-[#F59E0B] to-[#D97706]'
                                },
                                {
                                    label: 'Ofertas',
                                    value: stats.offers,
                                    icon: ChevronRight,
                                    gradient: 'from-[#8B5CF6] to-[#7C3AED]'
                                }
                            ].map((stat, i) => (
                                <div
                                    key={i}
                                    onClick={stat.action ? () => setShowConsultations(!showConsultations) : undefined}
                                    className={`flex flex-col items-center w-[80px] ${stat.action ? 'cursor-pointer group/stat' : ''}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md mb-2 group-hover/stat:scale-110 transition-transform`}>
                                        <stat.icon className="w-5 h-5 text-white" strokeWidth={2.5} />
                                    </div>
                                    <span className="text-xl font-black text-[#2C3E2C] tabular-nums leading-none mb-1">{stat.value}</span>
                                    <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">{stat.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block h-16 w-px bg-[#E5E3DB]"></div>

                        {/* Quality & Tasks Group */}
                        <div className="flex items-center gap-6">
                            {/* Detailed Quality Badge */}
                            <div className="flex flex-col items-center w-[80px]">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${qualityConfig.gradient} flex items-center justify-center shadow-md mb-2`}>
                                    <span className="text-[14px] font-black text-white">
                                        {quality.substring(0, 1)}
                                    </span>
                                </div>
                                <span className="text-xl font-black text-[#2C3E2C] leading-none mb-1">
                                    {qualityScore ? `${qualityScore <= 1 ? Math.round(qualityScore * 100) : qualityScore}%` : qualityConfig.label}
                                </span>
                                <span className="text-[10px] font-extrabold text-[#6B7B6B] uppercase tracking-[0.06em] opacity-80 text-center">Calidad</span>
                            </div>

                            {/* Divider */}
                            <div className="hidden sm:block h-16 w-px bg-[#E5E3DB]"></div>

                            {/* Pending Tasks Pill */}
                            <div className="flex flex-col items-center w-[80px]">
                                <button className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE047] flex items-center justify-center shadow-md mb-2 hover:bg-[#FDE68A] transition-colors">
                                    <FileText className="w-5 h-5 text-[#CA8A04]" strokeWidth={2.5} />
                                </button>
                                <span className="text-xl font-black text-[#CA8A04] leading-none mb-1">{pendingTasks}</span>
                                <span className="text-[10px] font-extrabold text-[#CA8A04] uppercase tracking-[0.06em] opacity-80 text-center">Tareas</span>
                            </div>

                            {/* Arrow */}
                            <button
                                onClick={() => setShowConsultations(!showConsultations)}
                                className="w-10 h-10 rounded-full bg-[#F3F4F6] flex items-center justify-center hover:bg-[#E5E7EB] transition-all text-[#6B7B6B]"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Expandable Consultations Area */}
                {showConsultations && (
                    <div className="px-5 pb-5 pt-0 bg-[#FAF8F3] border-t border-[#E5E3DB]">
                        <ConsultationsList />
                    </div>
                )}
            </div>
        </div>
    )
}
