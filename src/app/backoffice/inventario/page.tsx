'use client'

import React, { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import InventoryHeader from './components/InventoryHeader'
import InventoryDashboard from './components/InventoryDashboard'
import StatusRibbon from './components/StatusRibbon'
import PropertyCard from './components/PropertyCard'
import ValuationModal from './components/ValuationModal'
import { InventoryProperty } from './types'

const MOCK_INVENTORY: InventoryProperty[] = [
    {
        id: '1',
        agency_id: 'agency-1',
        producer_id: 'prod-1',
        title: 'Cerrada de Bezares 13',
        description: 'Hermosa residencia...',
        property_type: 'casa',
        operation_type: 'venta',
        address: 'Cerrada de Bezares 13',
        neighborhood: 'Lomas de Bezares',
        city: 'Miguel Hidalgo',
        state: 'CDMX',
        price: 13500000,
        rent_price: null,
        bedrooms: 4,
        bathrooms: 4,
        half_bathrooms: 1,
        parking_spaces: 3,
        total_area: 239,
        construction_m2: 450,
        land_m2: 239,
        maintenance_fee: 5000,
        commission_percentage: 4.64,
        main_image_url: 'https://images.unsplash.com/photo-1600596542815-2a4f04d5d159?q=80&w=2969&auto=format&fit=crop',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 85,
        mls_shared: false,
        slug: 'cerrada-bezares-13',
        owner_name: 'Juan Perez',
        owner_phone: '5512345678',
        owner_email: 'juan@example.com',
        is_my_agency: true,
        is_mine: true,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Inventory Extensions
        stats: { queries: 13, visits: 1, offers: 0 },
        quality: 'Alta',
        qualityScore: 0.85,
        pendingTasks: 3,
        advisors: [
            { name: 'Viola Prat', role: 'Productor' },
            { name: 'Viola Prat', role: 'Vendedor' }
        ],
        exclusive: false,
        legal_status: 'sin_contrato',
        valuation: 'optimo'
    }
]

export default function InventoryPage() {
    const [showValuationModal, setShowValuationModal] = useState(false)
    const [properties] = useState<InventoryProperty[]>(MOCK_INVENTORY)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)

    // Filter properties based on selected status
    const filteredProperties = selectedStatus
        ? properties.filter(p => p.legal_status === selectedStatus)
        : properties

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* 1. Cabecera Dinámica (Filtros y Búsqueda) */}
                <InventoryHeader />

                {/* 2. Dashboard de Métricas (KPI Cards) */}
                <InventoryDashboard
                    onValuationClick={() => setShowValuationModal(true)}
                    properties={properties}
                />

                {/* 3. Ribbon de Estados (Sub-navegación) */}
                <StatusRibbon
                    selectedStatus={selectedStatus}
                    onStatusClick={(status: string) => setSelectedStatus(status === selectedStatus ? null : status)}
                />

                {/* 4. Listado de Propiedades */}
                <div className="space-y-4">
                    {filteredProperties.length > 0 ? (
                        filteredProperties.map(property => (
                            <PropertyCard key={property.id} {...property} />
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-[#E5E3DB]">
                            <p className="text-[14px] font-medium text-[#6B7B6B]">
                                No hay propiedades en esta etapa
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showValuationModal && (
                    <ValuationModal
                        isOpen={showValuationModal}
                        onClose={() => setShowValuationModal(false)}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}
