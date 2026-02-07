'use client'

import React from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

const leads = [
    { initials: 'HP', name: 'Héctor Pérez', source: 'Viola de Brokeri...', date: '12 Feb 24', status: 'PERDIDA' },
    { initials: 'R', name: 'Rodrigo', source: 'Viola de Brokeri...', date: '10 Feb 24', status: 'PERDIDA' },
]

export default function ConsultationsList() {
    return (
        <div className="mt-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB] overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-[#E5E7EB] bg-white">
                <h4 className="text-[13px] font-bold text-[#111827] uppercase tracking-wider">Últimas Consultas</h4>
                <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                    <ChevronDown size={20} />
                </button>
            </div>
            <div className="divide-y divide-[#E5E7EB]">
                {leads.map((lead, i) => (
                    <div key={i} className="p-4 flex items-center justify-between hover:bg-white transition-colors">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-[13px] font-bold text-white uppercase">
                                {lead.initials}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-[#111827] leading-none">{lead.name}</p>
                                <p className="text-[11px] text-[#9CA3AF] font-medium mt-1 uppercase tracking-wide">
                                    {lead.source} • {lead.date}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="bg-[#FEF2F2] text-[#B91C1C] text-[10px] font-bold px-2.5 py-1 rounded-full border border-[#FEE2E2]">
                                {lead.status}
                            </span>
                            <button className="text-[#9CA3AF] hover:text-[#111827] transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
