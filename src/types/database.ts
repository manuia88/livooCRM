/**
 * Tipos de Base de Datos - livooCRM
 * 
 * Este archivo contiene todos los tipos TypeScript que reflejan
 * la estructura real de la base de datos en Supabase.
 * 
 * IMPORTANTE: Este es el archivo maestro de tipos.
 * NO crear tipos duplicados en otros archivos.
 * 
 * Estructura:
 * 1. Enums y Constantes
 * 2. Tablas Core (agencies, user_profiles)
 * 3. Tablas de Negocio (properties, contacts, tasks)
 * 4. Tablas de Relación
 * 5. Vistas y RPC
 */

// ============================================================================
// 1. ENUMS Y CONSTANTES
// ============================================================================

export type UserRole = 'admin' | 'manager' | 'agent' | 'viewer'

export type PropertyType = 
  | 'casa' 
  | 'departamento' 
  | 'terreno' 
  | 'oficina' 
  | 'local' 
  | 'bodega' 
  | 'edificio'

export type OperationType = 'sale' | 'rent' | 'both'

export type PropertyStatus = 
  | 'draft' 
  | 'active' 
  | 'sold' 
  | 'rented' 
  | 'inactive' 
  | 'archived'

export type ContactType = 
  | 'buyer' 
  | 'seller' 
  | 'renter' 
  | 'landlord' 
  | 'investor'

export type ContactStatus = 
  | 'lead' 
  | 'prospect' 
  | 'qualified' 
  | 'negotiating' 
  | 'closed' 
  | 'inactive'

export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export type Currency = 'MXN' | 'USD'

// ============================================================================
// 2. TABLAS CORE
// ============================================================================

/**
 * Tabla: agencies
 * Representa una inmobiliaria en el sistema multi-tenant
 */
export interface Agency {
  id: string
  name: string
  slug: string
  logo_url: string | null
  website: string | null
  phone: string | null
  email: string | null
  address: Record<string, any> | null
  settings: Record<string, any>
  timezone: string
  plan_type: 'trial' | 'basic' | 'pro' | 'enterprise'
  plan_expires_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * Tabla: user_profiles
 * Perfil de usuario extendido (extiende auth.users)
 */
export interface UserProfile {
  id: string
  agency_id: string
  first_name: string
  last_name: string | null
  full_name: string // Generated column
  avatar_url: string | null
  phone: string | null
  whatsapp: string | null
  role: UserRole
  permissions: string[]
  license_number: string | null
  specialties: string[]
  bio: string | null
  is_active: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/**
 * UserProfile con relación a Agency
 */
export interface UserProfileWithAgency extends UserProfile {
  agency: Agency | null
}

/**
 * CurrentUser - Usuario autenticado con email de auth.users
 */
export interface CurrentUser extends UserProfile {
  email: string
  agency: Agency | null
}

// ============================================================================
// 3. TABLAS DE NEGOCIO
// ============================================================================

/**
 * Tabla: properties
 * Propiedades inmobiliarias
 */
export interface Property {
  id: string
  agency_id: string
  created_by: string | null
  assigned_to: string | null
  
  // Información básica
  title: string
  description: string | null
  property_type: PropertyType
  operation_type: OperationType
  status: PropertyStatus
  
  // Ubicación
  address: Record<string, any>
  street: string | null
  exterior_number: string | null
  interior_number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  postal_code: string | null
  country: string
  coordinates: any | null // PostGIS geography
  show_exact_location: boolean
  
  // Características físicas
  bedrooms: number | null
  bathrooms: number | null
  half_bathrooms: number | null
  parking_spaces: number | null
  construction_m2: number | null
  land_m2: number | null
  total_m2: number | null
  floors: number | null
  floor_number: number | null
  year_built: number | null
  condition: string | null
  
  // Precios
  sale_price: number | null
  rent_price: number | null
  currency: Currency
  maintenance_fee: number | null
  property_tax: number | null
  
  // Características y amenidades
  amenities: string[]
  features: Record<string, any>
  
  // MLS y compartición
  shared_in_mls: boolean
  mls_id: string | null
  commission_shared: boolean
  commission_percentage: number | null
  commission_amount: number | null
  is_exclusive: boolean
  exclusivity_expires_at: string | null
  
  // Scoring
  health_score: number
  
  // Media
  photos: Array<{ url: string; caption?: string }>
  videos: Array<{ url: string; caption?: string }>
  virtual_tour_url: string | null
  floor_plan_url: string | null
  
  // Métricas
  views_count: number
  favorites_count: number
  inquiries_count: number
  
  // SEO
  slug: string | null
  meta_title: string | null
  meta_description: string | null
  
  // Timestamps
  published_at: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * Property con relaciones
 */
export interface PropertyWithRelations extends Property {
  creator?: UserProfile
  assigned_user?: UserProfile
  agency?: Agency
}

/**
 * Property para formularios (subset de campos)
 */
export interface PropertyFormData {
  title: string
  description: string
  property_type: PropertyType
  operation_type: OperationType
  street: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
  bedrooms: number
  bathrooms: number
  parking_spaces: number
  construction_m2: number
  land_m2: number
  sale_price?: number
  rent_price?: number
  amenities: string[]
}

/**
 * Tabla: contacts
 * Contactos y leads
 */
export interface Contact {
  id: string
  agency_id: string
  created_by: string | null
  assigned_to: string | null
  
  // Información personal
  first_name: string
  last_name: string | null
  full_name: string // Generated column
  email: string | null
  phone: string | null
  whatsapp: string | null
  
  // Clasificación
  contact_type: ContactType
  source: string | null
  status: ContactStatus
  current_stage: string | null
  
  // Scoring y tags
  lead_score: number
  tags: string[]
  
  // Información empresarial
  company: string | null
  position: string | null
  
  // Dirección
  address: Record<string, any> | null
  
  // Notas
  notes: string | null
  
  // Seguimiento
  last_contact_date: string | null
  next_followup_date: string | null
  
  // Timestamps
  created_at: string
  updated_at: string
  deleted_at: string | null
}

/**
 * Contact con relaciones
 */
export interface ContactWithRelations extends Contact {
  creator?: UserProfile
  assigned_user?: UserProfile
  agency?: Agency
}

/**
 * Tabla: tasks
 * Tareas y recordatorios
 */
export interface Task {
  id: string
  assigned_to: string
  created_by: string | null
  
  // Información básica
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  
  // Relaciones
  related_to_type: 'property' | 'contact' | 'general' | null
  related_to_id: string | null
  
  // Fechas
  due_date: string | null
  completed_at: string | null
  
  // Metadata
  metadata: Record<string, any>
  
  // Timestamps
  created_at: string
  updated_at: string
}

/**
 * Task con relaciones
 */
export interface TaskWithRelations extends Task {
  assigned_user: UserProfile
  creator?: UserProfile
  property?: Property
  contact?: Contact
}

/**
 * Tabla: contact_interactions
 * Interacciones con contactos
 */
export interface ContactInteraction {
  id: string
  contact_id: string
  user_id: string | null
  
  type: 'call' | 'email' | 'whatsapp' | 'meeting' | 'visit' | 'other'
  notes: string | null
  outcome: string | null
  metadata: Record<string, any>
  
  created_at: string
}

/**
 * Tabla: broadcasts
 * Campañas de mensajería masiva
 */
export interface Broadcast {
  id: string
  agency_id: string
  name: string
  message_content: string
  status: 'draft' | 'processing' | 'completed' | 'failed'
  
  total_recipients: number
  sent_count: number
  failed_count: number
  
  scheduled_at: string | null
  started_at: string | null
  completed_at: string | null
  
  created_at: string
  updated_at: string
}

/**
 * Tabla: broadcast_recipients
 * Recipients de campañas
 */
export interface BroadcastRecipient {
  id: string
  broadcast_id: string
  contact_id: string
  status: 'pending' | 'sent' | 'failed'
  sent_at: string | null
  error_message: string | null
  
  created_at: string
}

/**
 * Tabla: activity_logs
 * Logs de actividad del sistema
 */
export interface ActivityLog {
  id: string
  user_id: string | null
  action: string
  resource_type: string | null
  resource_id: string | null
  details: string | null
  metadata: Record<string, any>
  ip_address: string | null
  user_agent: string | null
  created_at: string
}

// ============================================================================
// 4. TIPOS PARA VISTAS Y RPC
// ============================================================================

/**
 * Dashboard Summary - Resumen de métricas del dashboard
 */
export interface DashboardSummary {
  level: string
  metrics: {
    properties_active: number
    new_leads: number
    sales_this_month: number
    tasks_pending: number
  }
  objective: {
    target: number
    current: number
    percentage: number
    period: string
  } | null
}

/**
 * Agency Metrics - Métricas de la agencia
 */
export interface AgencyMetrics {
  total_properties: number
  total_leads: number
  total_sales: number
  active_agents: number
  agents_performance: Array<{
    user_id: string
    full_name: string
    level: string
    properties_count: number
    leads_count: number
    sales_amount: number
  }>
}

/**
 * Agent Metrics - Métricas de un asesor específico
 */
export interface AgentMetrics {
  user_id: string
  full_name: string
  level: string
  metrics: {
    properties_active: number
    new_leads: number
    sales_this_month: number
    tasks_pending: number
  }
  objective: {
    target: number
    current: number
    percentage: number
    period: string
  } | null
}

/**
 * Properties Stats - Estadísticas de propiedades
 */
export interface PropertiesStats {
  mine: number
  total: number
  network: number
}

// ============================================================================
// 5. TIPOS HELPER Y UTILITY
// ============================================================================

/**
 * Paginación
 */
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
}

/**
 * Filtros de búsqueda de propiedades
 */
export interface PropertyFilters {
  source?: 'own' | 'agency' | 'network'
  property_type?: PropertyType
  operation_type?: OperationType
  status?: PropertyStatus
  city?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  search?: string
}

/**
 * Filtros de búsqueda de contactos
 */
export interface ContactFilters {
  contact_type?: ContactType
  status?: ContactStatus
  source?: string
  assigned_to?: string
  search?: string
}

/**
 * Resultado de búsqueda con paginación
 */
export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Response estándar de API
 */
export interface ApiResponse<T = any> {
  success: boolean
  message?: string
  data?: T
  error?: string
  details?: any
}

/**
 * Authenticated User - Para middleware
 */
export interface AuthenticatedUser {
  id: string
  email: string
  agency_id: string
  role: UserRole
}

// ============================================================================
// 6. TIPOS PARA FORMULARIOS (Wizard de Propiedades)
// ============================================================================

export interface PropertyFormStep1 {
  title: string
  description: string
  property_type: PropertyType
  operation_type: OperationType
}

export interface PropertyFormStep2 {
  street: string
  exterior_number?: string
  interior_number?: string
  neighborhood: string
  city: string
  state: string
  postal_code: string
  show_exact_location: boolean
  coordinates?: { lat: number; lng: number }
}

export interface PropertyFormStep3 {
  bedrooms: number
  bathrooms: number
  half_bathrooms?: number
  parking_spaces: number
  construction_m2: number
  land_m2?: number
  floors?: number
  floor_number?: number
  year_built?: number
  condition?: string
}

export interface PropertyFormStep4 {
  sale_price?: number
  rent_price?: number
  currency: Currency
  maintenance_fee?: number
  property_tax?: number
}

export interface PropertyFormStep5 {
  amenities: string[]
  features: Record<string, boolean>
}

export interface PropertyFormStep6 {
  commission_shared: boolean
  commission_percentage?: number
  commission_amount?: number
  is_exclusive: boolean
  exclusivity_expires_at?: string
  shared_in_mls?: boolean
  mls_id?: string
}

export interface PropertyFormStep7 {
  photos: Array<{ url: string; file?: File }>
  videos?: Array<{ url: string }>
  virtual_tour_url?: string
  floor_plan_url?: string
}

// ============================================================================
// EXPORTS CONSOLIDADOS
// ============================================================================

// Re-exportar todo para facilitar imports
export type {
  // Core
  Agency,
  UserProfile,
  UserProfileWithAgency,
  CurrentUser,
  
  // Business
  Property,
  PropertyWithRelations,
  PropertyFormData,
  Contact,
  ContactWithRelations,
  Task,
  TaskWithRelations,
  ContactInteraction,
  Broadcast,
  BroadcastRecipient,
  ActivityLog,
  
  // Metrics
  DashboardSummary,
  AgencyMetrics,
  AgentMetrics,
  PropertiesStats,
  
  // Helpers
  PaginationParams,
  PropertyFilters,
  ContactFilters,
  PaginatedResult,
  ApiResponse,
  AuthenticatedUser,
  
  // Form Steps
  PropertyFormStep1,
  PropertyFormStep2,
  PropertyFormStep3,
  PropertyFormStep4,
  PropertyFormStep5,
  PropertyFormStep6,
  PropertyFormStep7,
}
