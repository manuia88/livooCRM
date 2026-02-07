'use client'

import React from 'react'
import { DollarSign, MoreHorizontal } from 'lucide-react'

const offers = [
    { 
        initials: 'AC', 
        name: 'Ana Castro', 
        date: '20 Feb 24', 
        amount: 12800000, 
        status: 'PENDIENTE',
        notes: 'Necesita confirmar con su esposo'
    },
]

export default function OffersList() {
    return (
        <div className="mt-4 bg-[#FAF8F3]/50 rounded-2xl border border-[#E5E3DB] overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E3DB] bg-white">
                <h4 className="text-[12px] font-black text-[#111827] uppercase tracking-wider">Historial de Ofertas</h4>
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#6B7B6B] uppercase tracking-widest opacity-60">
                    <span>{offers.length} {offers.length === 1 ? 'Oferta recibida' : 'Ofertas recibidas'}</span>
                </div>
            </div>
            {offers.length > 0 ? (
                <div className="divide-y divide-[#E5E3DB]/30">
                    {offers.map((offer, i) => (
                        <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-white transition-colors group">
                            <div className="flex items-center gap-4">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center text-[12px] font-black text-white uppercase shadow-sm">
                                    {offer.initials}
                                </div>
                                <div>
                                    <p className="text-[14px] font-black text-[#111827] leading-none group-hover:text-[#8B5CF6] transition-colors">{offer.name}</p>
                                    <div className="flex items-center gap-2 mt-1.5">
                                        <DollarSign size={10} className="text-[#8B5CF6]" />
                                        <p className="text-[13px] text-[#8B5CF6] font-bold">
                                            ${offer.amount.toLocaleString('es-MX')} MXN
                                        </p>
                                        <span className="text-[10px] text-[#6B7B6B] font-bold uppercase tracking-widest opacity-70">
                                            • {offer.date}
                                        </span>
                                    </div>
                                    {offer.notes && (
                                        <p className="text-[11px] text-[#6B7B6B] mt-1 italic">{offer.notes}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-md border tracking-widest ${
                                    offer.status === 'ACEPTADA'
                                        ? 'bg-green-50 text-green-600 border-green-100'
                                        : offer.status === 'RECHAZADA'
                                        ? 'bg-red-50 text-red-600 border-red-100'
                                        : 'bg-purple-50 text-purple-600 border-purple-100'
                                }`}>
                                    {offer.status}
                                </span>
                                <button className="w-8 h-8 flex items-center justify-center text-[#BCC3BC] hover:text-[#111827] hover:bg-gray-50 rounded-lg transition-all">
                                    <MoreHorizontal size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="px-6 py-8 text-center">
                    <p className="text-[12px] text-[#6B7B6B] font-semibold">No hay ofertas registradas</p>
                </div>
            )}
        </div>
    )
}
