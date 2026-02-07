'use client'

import React from 'react'
import { Calendar, MoreHorizontal } from 'lucide-react'

const visits = [
    { initials: 'MP', name: 'María Pérez', date: '15 Feb 24', time: '10:00 AM', status: 'COMPLETADA', feedback: 'Le gustó la zona' },
    { initials: 'JL', name: 'Juan López', date: '18 Feb 24', time: '16:30 PM', status: 'PENDIENTE', feedback: null },
]

export default function VisitsList() {
    return (
        <div className="mt-4 bg-[#FAF8F3]/50 rounded-2xl border border-[#E5E3DB] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E3DB] bg-white">
                <h4 className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Historial de Visitas</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7B6B] uppercase tracking-widest opacity-60">
                    <span>{visits.length} Visitas registradas</span>
                </div>
            </div>
            <div className="divide-y divide-[#E5E3DB]/30">
                {visits.map((visit, i) => (
                    <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white transition-colors group">
                        <div className="flex items-center gap-4">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center text-[12px] font-black text-white uppercase shadow-sm">
                                {visit.initials}
                            </div>
                            <div>
                                <p className="text-[14px] font-black text-[#111827] leading-none group-hover:text-[#F59E0B] transition-colors">{visit.name}</p>
                                <p className="text-[10px] text-[#6B7B6B] font-bold mt-1.5 uppercase tracking-widest opacity-70 flex items-center gap-2">
                                    <Calendar size={10} />
                                    {visit.date} • {visit.time}
                                </p>
                                {visit.feedback && (
                                    <p className="text-[11px] text-[#6B7B6B] mt-1 italic">{visit.feedback}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border tracking-widest ${
                                visit.status === 'COMPLETADA'
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : 'bg-orange-50 text-orange-600 border-orange-100'
                            }`}>
                                {visit.status}
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
