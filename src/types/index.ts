/**
 * Types Index - Punto de entrada único para todos los tipos
 * 
 * USO:
 * import { Property, Contact, UserProfile } from '@/types'
 * 
 * En lugar de:
 * import { Property } from '@/types/property'
 * import { Contact } from '@/types/contact'
 */

// Re-exportar todo desde database.ts (archivo maestro consolidado)
export * from './database'

// Re-exportar tipos especializados no incluidos en database.ts
export * from './inbox'
export * from './templates'
export * from './analytics'
// broadcast.ts ya está incluido en database.ts
