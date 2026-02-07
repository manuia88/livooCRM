'use client'

import React from 'react'
import { ChevronDown, MoreHorizontal } from 'lucide-react'

const leads = [
    { initials: 'HP', name: 'Héctor Pérez', source: 'Portal Brokeri...', date: '12 Feb 24', status: 'INTERESADO' },
    { initials: 'R', name: 'Rodrigo', source: 'Campaña FB...', date: '10 Feb 24', status: 'PERDIDA' },
]

export default function ConsultationsList() {
    return (
        <div className="mt-4 bg-[#FAF8F3]/50 rounded-2xl border border-[#E5E3DB] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E3DB] bg-white">
                <h4 className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Historial de Consultas</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7B6B] uppercase tracking-widest opacity-60">
                    <span>2 Consultas activas</span>
                </div>
            </div>
            <div className="divide-y divide-[#E5E3DB]/30">
                {leads.map((lead, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-[#111827] flex items-center justify-center text-[12px] font-black text-white uppercase shadow-sm">
                                {lead.initials}
                            </div>
                            <div>
                                <p className="text-[14px] font-black text-[#111827] leading-none group-hover:text-[#B8975A] transition-colors">{lead.name}</p>
                                <p className="text-[10px] text-[#6B7B6B] font-bold mt-1.5 uppercase tracking-widest opacity-70">
                                    {lead.source} • {lead.date}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border tracking-widest ${lead.status === 'PERDIDA'
                                    ? 'bg-red-50 text-red-600 border-red-100'
                                    : 'bg-green-50 text-green-600 border-green-100'
                                }`}>
                                {lead.status}
                            </span>
                            <button className="w-8 h-8 flex items-center justify-center text-[#BCC3BC] hover:text-[#111827] hover:bg-gray-50 rounded-lg transition-all">
                                <MoreHorizontal size={16} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
