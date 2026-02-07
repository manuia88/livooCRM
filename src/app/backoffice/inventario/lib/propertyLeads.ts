/**
 * Eventos por propiedad: cada consulta, visita y oferta está ligada a una propiedad.
 * Un mismo lead puede consultar la propiedad A, y en su búsqueda visitar y ofertar en la propiedad B:
 * aparece en Consultas de A y en Visitas/Ofertas de B.
 * Aplica solo a propiedades del inventario propio y/o de la inmobiliaria.
 * Pensado para vincular con calendario y contacto.
 */

import type { PropertyStats } from '../types'

/** Datos base compartidos por un lead en cualquier etapa. */
export interface PropertyLeadBase {
  initials: string
  clientName: string
  assignedAdvisor: string
  agency: string
  leadRegisteredAt: string
  lastContact: string
  leadSource: string
  phone: string
}

/** Lead con etapa de consulta (para mostrar en lista). */
export interface ConsultationItem extends PropertyLeadBase {
  etapa: string
}

/** Lead con etapa de visita (para mostrar en lista). */
export interface VisitItem extends PropertyLeadBase {
  visitDate: string
  propertiesVisitedCount: number
  lastVisitDate: string
  etapa: string
}

/** Estado de la oferta. */
export type OfferStatus = 'aceptada' | 'rechazada' | 'negociando'

/** Lead con oferta (para mostrar en lista). */
export interface OfferItem extends PropertyLeadBase {
  amount: number
  offerDate: string
  status: OfferStatus
  /** Vigencia de la oferta (fecha límite para responder). Opcional. */
  validUntil?: string
  /** Fecha de cierre: proviene del módulo pipeline cuando el lead se mueve a la etapa cerrado (nombre de etapa puede variar). Solo para ofertas aceptadas. */
  closedAt?: string
  /** Precio de cierre: valor al que se cerró el negocio. Proviene del pipeline. */
  closedPrice?: number
  /** Comisión pagada: proviene del pipeline. Solo aplica para ofertas aceptadas/cerradas. */
  commissionPaid?: boolean
}

/** Evento de consulta: ligado a una propiedad. */
interface ConsultationEvent extends ConsultationItem {
  propertyId: string
}

/** Evento de visita: ligado a una propiedad. */
interface VisitEvent extends VisitItem {
  propertyId: string
}

/** Evento de oferta: ligado a una propiedad. */
interface OfferEvent extends OfferItem {
  propertyId: string
}

export interface PropertyLeadsData {
  consultations: ConsultationItem[]
  visits: VisitItem[]
  offers: OfferItem[]
  stats: PropertyStats
}

/**
 * Mock: eventos globales por propiedad.
 * Mismo lead puede tener consulta en propiedad A, visita y oferta en propiedad B.
 */
function buildAllEvents(): { consultations: ConsultationEvent[]; visits: VisitEvent[]; offers: OfferEvent[] } {
  // —— Propiedad 1 (Cerrada de Bezares): 13 consultas, 1 visita, 0 ofertas ——
  // Héctor Pérez: solo CONSULTA en prop 1. Luego (en búsqueda) visitará y ofertará en prop 2.
  const hectorConsultaProp1: ConsultationEvent = {
    propertyId: '1',
    initials: 'HP',
    clientName: 'Héctor Pérez',
    assignedAdvisor: 'Viola Prat',
    agency: 'Livoo Inmobiliaria',
    leadRegisteredAt: '12 Feb 24',
    lastContact: '14 Feb 24',
    leadSource: 'Portal Inmuebles',
    phone: '55 1234 5678',
    etapa: 'INTERESADO'
  }
  const otrosConsultasProp1: ConsultationEvent[] = [
    { propertyId: '1', initials: 'RM', clientName: 'Rodrigo Martínez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '10 Feb 24', lastContact: '11 Feb 24', leadSource: 'Campaña Facebook', phone: '55 9876 5432', etapa: 'PERDIDA' },
    { propertyId: '1', initials: 'MP', clientName: 'María Pérez', assignedAdvisor: 'Viola Prat', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '8 Feb 24', lastContact: '15 Feb 24', leadSource: 'Recomendación', phone: '55 1111 2222', etapa: 'INTERESADO' },
    { propertyId: '1', initials: 'JL', clientName: 'Juan López', assignedAdvisor: 'Laura Torres', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '12 Feb 24', lastContact: '18 Feb 24', leadSource: 'Portal Inmuebles', phone: '55 3333 4444', etapa: 'INTERESADO' },
    { propertyId: '1', initials: 'AC', clientName: 'Ana Castro', assignedAdvisor: 'Viola Prat', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '5 Feb 24', lastContact: '20 Feb 24', leadSource: 'Referido', phone: '55 5555 6677', etapa: 'INTERESADO' }
  ]
  const consultasProp1: ConsultationEvent[] = [hectorConsultaProp1, ...otrosConsultasProp1]
  while (consultasProp1.length < 13) {
    consultasProp1.push({ ...otrosConsultasProp1[(consultasProp1.length - 1) % otrosConsultasProp1.length], propertyId: '1' })
  }
  // Una visita en prop 1 (otra persona, ej. María Pérez)
  const visitasProp1: VisitEvent[] = [
    { propertyId: '1', initials: 'MP', clientName: 'María Pérez', assignedAdvisor: 'Viola Prat', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '8 Feb 24', lastContact: '15 Feb 24', leadSource: 'Recomendación', phone: '55 1111 2222', visitDate: '15 Feb 24', propertiesVisitedCount: 1, lastVisitDate: '15 Feb 24', etapa: 'COMPLETADA' }
  ]

  // —— Propiedad 2 (Departamento Polanco): 8 consultas, 3 visitas, 1 oferta ——
  // Héctor Pérez: consultó en prop 1; en su búsqueda visitó y ofertó en prop 2. Aparece en prop 2 en Visitas y Ofertas.
  const visitasProp2: VisitEvent[] = [
    { propertyId: '2', initials: 'HP', clientName: 'Héctor Pérez', assignedAdvisor: 'Laura Torres', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '12 Feb 24', lastContact: '16 Feb 24', leadSource: 'Portal Inmuebles', phone: '55 1234 5678', visitDate: '14 Feb 24', propertiesVisitedCount: 2, lastVisitDate: '18 Feb 24', etapa: 'COMPLETADA' },
    { propertyId: '2', initials: 'MP', clientName: 'María Pérez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '5 Feb 24', lastContact: '20 Feb 24', leadSource: 'Referido', phone: '55 1111 2222', visitDate: '12 Feb 24', propertiesVisitedCount: 2, lastVisitDate: '18 Feb 24', etapa: 'COMPLETADA' },
    { propertyId: '2', initials: 'RM', clientName: 'Rodrigo Martínez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '3 Feb 24', lastContact: '15 Feb 24', leadSource: 'Campaña Facebook', phone: '55 9876 5432', visitDate: '14 Feb 24', propertiesVisitedCount: 1, lastVisitDate: '14 Feb 24', etapa: 'COMPLETADA' }
  ]
  // Vigencia = 5 días desde la fecha de oferta en todas las ofertas
  const ofertasProp2: OfferEvent[] = [
    { propertyId: '2', initials: 'HP', clientName: 'Héctor Pérez', assignedAdvisor: 'Laura Torres', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '12 Feb 24', lastContact: '16 Feb 24', leadSource: 'Portal Inmuebles', phone: '55 1234 5678', amount: 42000, offerDate: '20 Feb 24', status: 'negociando', validUntil: '25 Feb 24' },
    { propertyId: '2', initials: 'MP', clientName: 'María Pérez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '5 Feb 24', lastContact: '22 Feb 24', leadSource: 'Referido', phone: '55 1111 2222', amount: 43500, offerDate: '18 Feb 24', status: 'aceptada', validUntil: '23 Feb 24', closedAt: '25 Feb 24', closedPrice: 43200, commissionPaid: true },
    { propertyId: '2', initials: 'RM', clientName: 'Rodrigo Martínez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '3 Feb 24', lastContact: '15 Feb 24', leadSource: 'Campaña Facebook', phone: '55 9876 5432', amount: 40000, offerDate: '14 Feb 24', status: 'rechazada', validUntil: '19 Feb 24' }
  ]
  const consultasProp2: ConsultationEvent[] = [
    { propertyId: '2', initials: 'MP', clientName: 'María Pérez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '5 Feb 24', lastContact: '20 Feb 24', leadSource: 'Referido', phone: '55 1111 2222', etapa: 'INTERESADO' },
    { propertyId: '2', initials: 'RM', clientName: 'Rodrigo Martínez', assignedAdvisor: 'Carlos Méndez', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '3 Feb 24', lastContact: '15 Feb 24', leadSource: 'Campaña Facebook', phone: '55 9876 5432', etapa: 'INTERESADO' },
    { propertyId: '2', initials: 'JL', clientName: 'Juan López', assignedAdvisor: 'Laura Torres', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '1 Feb 24', lastContact: '10 Feb 24', leadSource: 'Portal Inmuebles', phone: '55 3333 4444', etapa: 'INTERESADO' },
    { propertyId: '2', initials: 'AC', clientName: 'Ana Castro', assignedAdvisor: 'Viola Prat', agency: 'Livoo Inmobiliaria', leadRegisteredAt: '2 Feb 24', lastContact: '12 Feb 24', leadSource: 'Sitio web', phone: '55 5555 6677', etapa: 'INTERESADO' }
  ]
  for (let i = 0; i < 4; i++) {
    consultasProp2.push({ propertyId: '2', initials: `C${i + 1}`, clientName: `Cliente consulta ${i + 1}`, assignedAdvisor: 'Laura Torres', agency: 'Livoo Inmobiliaria', leadRegisteredAt: `${i + 6} Feb 24`, lastContact: `${i + 7} Feb 24`, leadSource: 'Sitio web', phone: `55 0000 ${1000 + i}`, etapa: 'INTERESADO' })
  }

  return {
    consultations: [...consultasProp1, ...consultasProp2],
    visits: [...visitasProp1, ...visitasProp2],
    offers: [...ofertasProp2]
  }
}

let cachedEvents: { consultations: ConsultationEvent[]; visits: VisitEvent[]; offers: OfferEvent[] } | null = null

function getAllEvents() {
  if (!cachedEvents) cachedEvents = buildAllEvents()
  return cachedEvents
}

function dropPropertyId<T extends { propertyId: string }>(e: T): Omit<T, 'propertyId'> {
  const { propertyId: _, ...rest } = e
  return rest
}

/**
 * Construye leads placeholder para coincidir con stats (solo cuando no hay eventos mock para esa propiedad).
 */
function buildFallbackLeads(stats: PropertyStats): { consultations: ConsultationItem[]; visits: VisitItem[]; offers: OfferItem[] } {
  const { queries, visits, offers } = stats
  if (queries === 0 && visits === 0 && offers === 0) {
    return { consultations: [], visits: [], offers: [] }
  }
  const n = Math.max(queries, visits, offers, 1)
  const base: PropertyLeadBase = {
    initials: '—',
    clientName: 'Lead',
    assignedAdvisor: 'Asesor',
    agency: 'Livoo Inmobiliaria',
    leadRegisteredAt: '1 Feb 24',
    lastContact: '10 Feb 24',
    leadSource: 'Sitio web',
    phone: '55 0000 0000'
  }
  const consultations: ConsultationItem[] = []
  const visitsList: VisitItem[] = []
  const offersList: OfferItem[] = []
  for (let i = 0; i < n; i++) {
    if (i < queries) {
      consultations.push({ ...base, clientName: `Lead ${i + 1}`, etapa: 'INTERESADO' })
    }
    if (i < visits) {
      visitsList.push({ ...base, clientName: `Lead ${i + 1}`, visitDate: '10 Feb 24', propertiesVisitedCount: 1, lastVisitDate: '10 Feb 24', etapa: 'PENDIENTE' })
    }
    if (i < offers) {
      offersList.push({ ...base, clientName: `Lead ${i + 1}`, amount: 0, offerDate: '10 Feb 24', status: 'negociando' })
    }
  }
  return { consultations, visits: visitsList, offers: offersList }
}

/**
 * Devuelve consultas, visitas y ofertas para una propiedad.
 * Cada evento está ligado a una propiedad: un lead puede consultar A y visitar/ofertar B.
 * Solo aplica a inventario propio y/o de la inmobiliaria.
 * @param fallbackStats Si no hay eventos mock para propertyId, se usan para placeholders.
 */
export function getMockLeadsForProperty(propertyId: string, fallbackStats?: PropertyStats): PropertyLeadsData {
  const events = getAllEvents()
  const consultations = events.consultations.filter(e => e.propertyId === propertyId).map(dropPropertyId)
  const visits = events.visits.filter(e => e.propertyId === propertyId).map(dropPropertyId)
  const offers = events.offers.filter(e => e.propertyId === propertyId).map(dropPropertyId)

  const hasMock = consultations.length > 0 || visits.length > 0 || offers.length > 0
  if (hasMock) {
    return {
      consultations,
      visits,
      offers,
      stats: { queries: consultations.length, visits: visits.length, offers: offers.length }
    }
  }

  const fallback = fallbackStats ? buildFallbackLeads(fallbackStats) : { consultations: [], visits: [], offers: [] }
  return {
    ...fallback,
    stats: {
      queries: fallback.consultations.length,
      visits: fallback.visits.length,
      offers: fallback.offers.length
    }
  }
}
