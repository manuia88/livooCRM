export type PropertyType = 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina' | 'bodega'

export type OperationType = 'venta' | 'renta' | 'ambos'

export type PropertyStatus = 'disponible' | 'apartado' | 'vendido' | 'rentado' | 'suspendido'

export type PropertyVisibility = 'public' | 'private' | 'agency'

export type DocumentationStatus = 'sin_documentos' | 'incompletos' | 'revision' | 'aprobados' | 'rechazados'

export interface PropertyFilters {
  status?: PropertyStatus
  property_type?: PropertyType
  operation_type?: OperationType
  city?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  source?: 'own' | 'agency' | 'network' | 'all'
  search?: string
}

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  terreno: 'Terreno',
  local: 'Local Comercial',
  oficina: 'Oficina',
  bodega: 'Bodega'
}

export const OPERATION_TYPE_LABELS: Record<OperationType, string> = {
  venta: 'Venta',
  renta: 'Renta',
  ambos: 'Venta y Renta'
}

export const STATUS_LABELS: Record<PropertyStatus, string> = {
  disponible: 'Disponible',
  apartado: 'Apartado',
  vendido: 'Vendido',
  rentado: 'Rentado',
  suspendido: 'Suspendido'
}

export const STATUS_COLORS: Record<PropertyStatus, string> = {
  disponible: 'bg-green-100 text-green-800',
  apartado: 'bg-yellow-100 text-yellow-800',
  vendido: 'bg-blue-100 text-blue-800',
  rentado: 'bg-purple-100 text-purple-800',
  suspendido: 'bg-gray-100 text-gray-800'
}
