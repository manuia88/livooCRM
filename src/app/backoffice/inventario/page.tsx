'use client'

import React, { useState, useRef, useEffect } from 'react'
import { flushSync } from 'react-dom'
import { AnimatePresence } from 'framer-motion'
import InventoryHeader from './components/InventoryHeader'
import InventoryDashboard from './components/InventoryDashboard'
import StatusRibbon from './components/StatusRibbon'
import PropertyCard from './components/PropertyCard'
import ValuationModal from './components/ValuationModal'
import { InventoryProperty, DashboardFiltersState, ExclusivityFilter, QualityFilter, ValuationFilter } from './types'

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
        main_image_url: 'https://picsum.photos/seed/house1/800/600',
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
        // Inventory Extensions (exclusive = !mls_shared: Exclusiva)
        stats: { queries: 13, visits: 1, offers: 0 },
        quality: 'Alta',
        qualityScore: 0.85,
        pendingTasks: 3,
        advisors: [
            { name: 'Viola Prat', role: 'Productor' },
            { name: 'Viola Prat', role: 'Vendedor' }
        ],
        exclusive: true,
        legal_status: 'sin_contrato',
        valuation: 'optimo'
    },
    {
        id: '2',
        agency_id: 'agency-1',
        producer_id: 'prod-1',
        title: 'Departamento Polanco',
        description: 'Moderno departamento...',
        property_type: 'departamento',
        operation_type: 'renta',
        address: 'Calle Homero 1500',
        neighborhood: 'Polanco',
        city: 'Miguel Hidalgo',
        state: 'CDMX',
        price: 45000,
        rent_price: 45000,
        bedrooms: 2,
        bathrooms: 2,
        half_bathrooms: 0,
        parking_spaces: 2,
        total_area: 120,
        construction_m2: 120,
        land_m2: null,
        maintenance_fee: 8000,
        commission_percentage: 10,
        main_image_url: 'https://picsum.photos/seed/apartment1/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 65,
        mls_shared: true,
        slug: 'departamento-polanco',
        owner_name: 'María García',
        owner_phone: '5587654321',
        owner_email: 'maria@example.com',
        is_my_agency: true,
        is_mine: true,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Inventory Extensions (exclusive = !mls_shared: Opción)
        stats: { queries: 8, visits: 3, offers: 1 },
        quality: 'Media',
        qualityScore: 0.65,
        pendingTasks: 5,
        advisors: [
            { name: 'Carlos Méndez', role: 'Productor' },
            { name: 'Laura Torres', role: 'Vendedor' }
        ],
        exclusive: false,
        legal_status: 'aprobados',
        valuation: 'medio'
    },
    {
        id: '3',
        agency_id: 'agency-1',
        producer_id: 'prod-2',
        title: 'Casa en Coyoacán',
        description: 'Casa antigua para remodelar...',
        property_type: 'casa',
        operation_type: 'venta',
        address: 'Calle Allende 234',
        neighborhood: 'Coyoacán Centro',
        city: 'Coyoacán',
        state: 'CDMX',
        price: 8500000,
        rent_price: null,
        bedrooms: 3,
        bathrooms: 2,
        half_bathrooms: 0,
        parking_spaces: 1,
        total_area: 180,
        construction_m2: 150,
        land_m2: 180,
        maintenance_fee: 0,
        commission_percentage: 5,
        main_image_url: 'https://picsum.photos/seed/house2/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 35,
        mls_shared: false,
        slug: 'casa-coyoacan',
        owner_name: 'Roberto Sánchez',
        owner_phone: '5598765432',
        owner_email: 'roberto@example.com',
        is_my_agency: true,
        is_mine: false,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Inventory Extensions (exclusive = !mls_shared: Exclusiva)
        stats: { queries: 3, visits: 0, offers: 0 },
        quality: 'Baja',
        qualityScore: 0.35,
        pendingTasks: 8,
        advisors: [
            { name: 'Pedro Ramírez', role: 'Productor' },
            { name: 'Ana Martínez', role: 'Vendedor' }
        ],
        exclusive: true,
        legal_status: 'docs_pendientes',
        valuation: 'fuera'
    },
    {
        id: '4',
        agency_id: 'agency-1',
        producer_id: 'prod-1',
        title: 'Penthouse Condesa',
        description: 'Penthouse con terraza.',
        property_type: 'departamento',
        operation_type: 'venta',
        address: 'Av. Amsterdam 234',
        neighborhood: 'Condesa',
        city: 'Cuauhtémoc',
        state: 'CDMX',
        price: 18500000,
        rent_price: null,
        bedrooms: 3,
        bathrooms: 3,
        half_bathrooms: 1,
        parking_spaces: 2,
        total_area: 280,
        construction_m2: 280,
        land_m2: null,
        maintenance_fee: 12000,
        commission_percentage: 5,
        main_image_url: 'https://picsum.photos/seed/penthouse/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 88,
        mls_shared: false,
        slug: 'penthouse-condesa',
        owner_name: 'Claudia Ruiz',
        owner_phone: '5511223344',
        owner_email: 'claudia@example.com',
        is_my_agency: true,
        is_mine: true,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 20, visits: 5, offers: 2 },
        quality: 'Alta',
        qualityScore: 0.88,
        pendingTasks: 1,
        advisors: [{ name: 'Viola Prat', role: 'Productor' }, { name: 'Viola Prat', role: 'Vendedor' }],
        exclusive: true,
        legal_status: 'aprobados',
        valuation: 'fuera'
    },
    {
        id: '5',
        agency_id: 'agency-1',
        producer_id: 'prod-2',
        title: 'Loft Roma Norte',
        description: 'Loft industrial.',
        property_type: 'departamento',
        operation_type: 'renta',
        address: 'Calle Colima 456',
        neighborhood: 'Roma Norte',
        city: 'Cuauhtémoc',
        state: 'CDMX',
        price: 28000,
        rent_price: 28000,
        bedrooms: 1,
        bathrooms: 1,
        half_bathrooms: 0,
        parking_spaces: 0,
        total_area: 75,
        construction_m2: 75,
        land_m2: null,
        maintenance_fee: 3500,
        commission_percentage: 8,
        main_image_url: 'https://picsum.photos/seed/loft/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 58,
        mls_shared: true,
        slug: 'loft-roma',
        owner_name: 'Luis Mora',
        owner_phone: '5599887766',
        owner_email: 'luis@example.com',
        is_my_agency: true,
        is_mine: false,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 5, visits: 2, offers: 0 },
        quality: 'Media',
        qualityScore: 0.58,
        pendingTasks: 4,
        advisors: [{ name: 'Carlos Méndez', role: 'Productor' }, { name: 'Laura Torres', role: 'Vendedor' }],
        exclusive: false,
        legal_status: 'sin_contrato',
        valuation: 'medio'
    },
    {
        id: '6',
        agency_id: 'agency-1',
        producer_id: 'prod-1',
        title: 'Casa San Ángel',
        description: 'Casa con jardín.',
        property_type: 'casa',
        operation_type: 'venta',
        address: 'Calle Juárez 100',
        neighborhood: 'San Ángel',
        city: 'Álvaro Obregón',
        state: 'CDMX',
        price: 22000000,
        rent_price: null,
        bedrooms: 5,
        bathrooms: 4,
        half_bathrooms: 1,
        parking_spaces: 4,
        total_area: 450,
        construction_m2: 380,
        land_m2: 450,
        maintenance_fee: 0,
        commission_percentage: 4,
        main_image_url: 'https://picsum.photos/seed/sanangel/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 42,
        mls_shared: false,
        slug: 'casa-san-angel',
        owner_name: 'Patricia Díaz',
        owner_phone: '5522334455',
        owner_email: 'patricia@example.com',
        is_my_agency: true,
        is_mine: true,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 2, visits: 0, offers: 0 },
        quality: 'Baja',
        qualityScore: 0.42,
        pendingTasks: 6,
        advisors: [{ name: 'Pedro Ramírez', role: 'Productor' }, { name: 'Ana Martínez', role: 'Vendedor' }],
        exclusive: true,
        legal_status: 'docs_pendientes',
        valuation: 'optimo'
    },
    {
        id: '7',
        agency_id: 'agency-1',
        producer_id: 'prod-2',
        title: 'Departamento Del Valle',
        description: 'Dpto. listo para entrar.',
        property_type: 'departamento',
        operation_type: 'venta',
        address: 'Av. Coyoacán 789',
        neighborhood: 'Del Valle',
        city: 'Benito Juárez',
        state: 'CDMX',
        price: 7200000,
        rent_price: null,
        bedrooms: 2,
        bathrooms: 2,
        half_bathrooms: 0,
        parking_spaces: 1,
        total_area: 95,
        construction_m2: 95,
        land_m2: null,
        maintenance_fee: 2500,
        commission_percentage: 6,
        main_image_url: 'https://picsum.photos/seed/delvalle/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 72,
        mls_shared: true,
        slug: 'dpto-del-valle',
        owner_name: 'Ricardo López',
        owner_phone: '5566778899',
        owner_email: 'ricardo@example.com',
        is_my_agency: true,
        is_mine: false,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 11, visits: 4, offers: 1 },
        quality: 'Media',
        qualityScore: 0.72,
        pendingTasks: 2,
        advisors: [{ name: 'Viola Prat', role: 'Productor' }, { name: 'Viola Prat', role: 'Vendedor' }],
        exclusive: false,
        legal_status: 'en_revision',
        valuation: 'medio'
    },
    {
        id: '8',
        agency_id: 'agency-1',
        producer_id: 'prod-1',
        title: 'Casa Pedregal',
        description: 'Residencia en zona residencial.',
        property_type: 'casa',
        operation_type: 'venta',
        address: 'Av. de las Fuentes 50',
        neighborhood: 'Pedregal',
        city: 'Coyoacán',
        state: 'CDMX',
        price: 35000000,
        rent_price: null,
        bedrooms: 6,
        bathrooms: 5,
        half_bathrooms: 2,
        parking_spaces: 4,
        total_area: 620,
        construction_m2: 520,
        land_m2: 620,
        maintenance_fee: 0,
        commission_percentage: 4.5,
        main_image_url: 'https://picsum.photos/seed/pedregal/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 92,
        mls_shared: false,
        slug: 'casa-pedregal',
        owner_name: 'Fernanda Castro',
        owner_phone: '5533445566',
        owner_email: 'fernanda@example.com',
        is_my_agency: true,
        is_mine: true,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 25, visits: 8, offers: 3 },
        quality: 'Alta',
        qualityScore: 0.92,
        pendingTasks: 0,
        advisors: [{ name: 'Carlos Méndez', role: 'Productor' }, { name: 'Laura Torres', role: 'Vendedor' }],
        exclusive: true,
        legal_status: 'contrato_firmado',
        valuation: 'optimo'
    },
    {
        id: '9',
        agency_id: 'agency-1',
        producer_id: 'prod-2',
        title: 'Local Comercial Narvarte',
        description: 'Local en esquina para negocio.',
        property_type: 'local',
        operation_type: 'venta',
        address: 'Av. Universidad 1200',
        neighborhood: 'Narvarte',
        city: 'Benito Juárez',
        state: 'CDMX',
        price: 4500000,
        rent_price: null,
        bedrooms: 0,
        bathrooms: 1,
        half_bathrooms: 0,
        parking_spaces: 0,
        total_area: 85,
        construction_m2: 85,
        land_m2: null,
        maintenance_fee: 2000,
        commission_percentage: 5,
        main_image_url: 'https://picsum.photos/seed/local/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 38,
        mls_shared: true,
        slug: 'local-narvarte',
        owner_name: 'Sandra Lima',
        owner_phone: '5544332211',
        owner_email: 'sandra@example.com',
        is_my_agency: true,
        is_mine: false,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 1, visits: 0, offers: 0 },
        quality: 'Baja',
        qualityScore: 0.38,
        pendingTasks: 7,
        advisors: [{ name: 'Pedro Ramírez', role: 'Productor' }, { name: 'Ana Martínez', role: 'Vendedor' }],
        exclusive: false,
        legal_status: 'sin_contrato',
        valuation: 'medio'
    },
    {
        id: '10',
        agency_id: 'agency-1',
        producer_id: 'prod-1',
        title: 'Oficina Insurgentes',
        description: 'Oficina lista para usar.',
        property_type: 'oficina',
        operation_type: 'renta',
        address: 'Av. Insurgentes Sur 1500',
        neighborhood: 'Del Valle',
        city: 'Benito Juárez',
        state: 'CDMX',
        price: 22000,
        rent_price: 22000,
        bedrooms: 0,
        bathrooms: 2,
        half_bathrooms: 0,
        parking_spaces: 2,
        total_area: 110,
        construction_m2: 110,
        land_m2: null,
        maintenance_fee: 4500,
        commission_percentage: 7,
        main_image_url: 'https://picsum.photos/seed/oficina/800/600',
        images: [],
        status: 'active',
        visibility: 'public',
        published: true,
        health_score: 45,
        mls_shared: false,
        slug: 'oficina-insurgentes',
        owner_name: 'Gerardo Paz',
        owner_phone: '5566771122',
        owner_email: 'gerardo@example.com',
        is_my_agency: true,
        is_mine: true,
        source: 'own',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        stats: { queries: 4, visits: 1, offers: 0 },
        quality: 'Baja',
        qualityScore: 0.45,
        pendingTasks: 5,
        advisors: [{ name: 'Carlos Méndez', role: 'Productor' }, { name: 'Laura Torres', role: 'Vendedor' }],
        exclusive: true,
        legal_status: 'docs_pendientes',
        valuation: 'medio'
    }
]

// Criterios únicos para que filtro y tarjetas coincidan en todas las combinaciones
function getQualityBucket(healthScore: number): QualityFilter {
    if (healthScore >= 80) return 'quality_alta'
    if (healthScore >= 50) return 'quality_media'
    return 'quality_baja'
}

function getValuationBucket(valuation?: string | null): ValuationFilter {
    if (!valuation) return 'valuation_medio' // fallback
    const v = valuation.toLowerCase()
    if (v === 'optimo' || v === 'óptimo') return 'valuation_optimo'
    if (v === 'fuera') return 'valuation_fuera'
    return 'valuation_medio' // medio, no_competitivo, etc.
}

/** Aplica filtros del dashboard. Entre grupos es AND; dentro de cada grupo es OR. */
function applyDashboardFiltersMulti(properties: InventoryProperty[], filters: DashboardFiltersState): InventoryProperty[] {
    return properties.filter(p => {
        // 1. Exclusividad: mismo criterio que la tarjeta (Exclusiva = !mls_shared, Opción = mls_shared)
        const isExclusive = p.mls_shared === false
        if (filters.exclusivity === 'exclusive' && !isExclusive) return false
        if (filters.exclusivity === 'option' && isExclusive) return false

        // 2. Calidad (pueden ser varias): la propiedad debe estar en AL MENOS UNA de las seleccionadas
        if (filters.qualities.length > 0) {
            const bucket = getQualityBucket(p.health_score ?? 0)
            if (!filters.qualities.includes(bucket)) return false
        }

        // 3. Valuación (pueden ser varias): la propiedad debe estar en AL MENOS UNA de las seleccionadas
        if (filters.valuations.length > 0) {
            const bucket = getValuationBucket(p.valuation)
            if (!filters.valuations.includes(bucket)) return false
        }

        return true
    })
}

const initialDashboardFilters: DashboardFiltersState = {
    exclusivity: null,
    qualities: [],
    valuations: []
}

export default function InventoryPage() {
    const [showValuationModal, setShowValuationModal] = useState(false)
    const [properties] = useState<InventoryProperty[]>(MOCK_INVENTORY)
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null)
    const [dashboardFilters, setDashboardFilters] = useState<DashboardFiltersState>(initialDashboardFilters)
    const resultsStartRef = useRef<HTMLDivElement>(null)
    const isFirstMount = useRef(true)
    const prevFilterCountRef = useRef(
        (initialDashboardFilters.exclusivity ? 1 : 0) +
        initialDashboardFilters.qualities.length +
        initialDashboardFilters.valuations.length
    )

    const toggleExclusivity = (value: ExclusivityFilter) => {
        const next = (prev: DashboardFiltersState) => ({
            ...prev,
            exclusivity: prev.exclusivity === value ? null : value
        })
        flushSync(() => setDashboardFilters(next))
    }
    const toggleQuality = (value: QualityFilter) => {
        const next = (prev: DashboardFiltersState) => ({
            ...prev,
            qualities: prev.qualities.includes(value) ? prev.qualities.filter(q => q !== value) : [...prev.qualities, value]
        })
        flushSync(() => setDashboardFilters(next))
    }
    const toggleValuation = (value: ValuationFilter) => {
        const next = (prev: DashboardFiltersState) => ({
            ...prev,
            valuations: prev.valuations.includes(value) ? prev.valuations.filter(v => v !== value) : [...prev.valuations, value]
        })
        flushSync(() => setDashboardFilters(next))
    }

    // Filter: dashboard (multi) then legal status
    const byDashboard = applyDashboardFiltersMulti(properties, dashboardFilters)
    const filteredProperties = selectedStatus
        ? byDashboard.filter(p => p.legal_status === selectedStatus)
        : byDashboard

    // Scroll al inicio de los resultados solo cuando seleccionas un filtro (añades), no cuando quitas la selección
    useEffect(() => {
        const count = (dashboardFilters.exclusivity ? 1 : 0) + dashboardFilters.qualities.length + dashboardFilters.valuations.length
        if (isFirstMount.current) {
            isFirstMount.current = false
            prevFilterCountRef.current = count
            return
        }
        const prevCount = prevFilterCountRef.current
        prevFilterCountRef.current = count
        if (count > prevCount) {
            resultsStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }, [dashboardFilters])

    return (
        <div className="min-h-screen bg-[#F5F5F7] pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
                {/* 1. Cabecera Dinámica (Filtros y Búsqueda) */}
                <InventoryHeader />

                {/* 2. Dashboard de Métricas (KPI Cards) */}
                <InventoryDashboard
                    onValuationClick={() => setShowValuationModal(true)}
                    properties={properties}
                    dashboardFilters={dashboardFilters}
                    onClearAll={() => setDashboardFilters(initialDashboardFilters)}
                    onExclusivityClick={toggleExclusivity}
                    onQualityToggle={toggleQuality}
                    onValuationToggle={toggleValuation}
                />

                {/* 3. Ribbon de Estados (Sub-navegación) */}
                <StatusRibbon
                    selectedStatus={selectedStatus}
                    onStatusClick={(status: string) => setSelectedStatus(status === selectedStatus ? null : status)}
                />

                {/* 4. Listado de Propiedades */}
                <div ref={resultsStartRef} className="space-y-4">
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
