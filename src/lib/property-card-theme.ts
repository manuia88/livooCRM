/**
 * Características y colores de las fichas de propiedades (listado y drawer).
 * Una sola fuente: renta, venta, venta o renta; y por tipo (oficina, terreno, local, bodega = comercial).
 */

export type OperationType = 'venta' | 'renta' | 'ambos'
export type PropertyType = 'casa' | 'departamento' | 'terreno' | 'local' | 'oficina' | 'bodega' | string

/** Tipos considerados "comercial" → barra ámbar/naranja en la ficha */
export const COMMERCIAL_PROPERTY_TYPES: PropertyType[] = ['oficina', 'terreno', 'local', 'bodega']

/** Etiquetas de operación para la ficha */
export const OPERATION_LABELS: Record<OperationType, string> = {
  venta: 'Venta',
  renta: 'Renta',
  ambos: 'Venta o Renta',
}

/** Etiquetas de tipo de inmueble para la ficha */
export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  casa: 'Casa',
  departamento: 'Departamento',
  terreno: 'Terreno',
  local: 'Local',
  oficina: 'Oficina',
  bodega: 'Bodega',
}

/** Gradientes del banner de la ficha (Tailwind): comercial > renta > venta > ambos */
const BANNER_GRADIENTS = {
  comercial: 'bg-gradient-to-r from-amber-600 to-orange-600',
  renta: 'bg-gradient-to-r from-green-600 to-green-700',
  venta: 'bg-gradient-to-r from-blue-600 to-blue-700',
  ambos: 'bg-gradient-to-r from-violet-600 to-purple-700',
} as const

/**
 * Devuelve la clase del banner según tipo de operación y tipo de propiedad.
 * Comercial (oficina, terreno, local, bodega) usa ámbar/naranja; luego renta=verde, venta=azul, ambos=violeta.
 */
export function getOperationBannerGradient(
  operationType: OperationType | string | null | undefined,
  propertyType?: PropertyType | null
): string {
  const isComercial = propertyType != null && COMMERCIAL_PROPERTY_TYPES.includes(propertyType)
  if (isComercial) return BANNER_GRADIENTS.comercial
  if (operationType === 'renta') return BANNER_GRADIENTS.renta
  if (operationType === 'venta') return BANNER_GRADIENTS.venta
  return BANNER_GRADIENTS.ambos
}

export function getOperationLabel(operationType: OperationType | string | null | undefined): string {
  if (operationType === 'renta') return OPERATION_LABELS.renta
  if (operationType === 'venta') return OPERATION_LABELS.venta
  if (operationType === 'ambos') return OPERATION_LABELS.ambos
  return 'Inmueble'
}

export function getPropertyTypeLabel(propertyType: PropertyType | null | undefined): string {
  return propertyType ? (PROPERTY_TYPE_LABELS[propertyType] ?? 'Inmueble') : 'Inmueble'
}

/** Texto del banner: "Casa en Venta", "Oficina en Renta", etc. */
export function getBannerText(operationType: OperationType | string | null | undefined, propertyType?: PropertyType | null): string {
  const typeLabel = getPropertyTypeLabel(propertyType)
  const opLabel = getOperationLabel(operationType)
  return `${typeLabel} en ${opLabel}`
}
