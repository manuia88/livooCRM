// Extended types for Properties Module with MLS, Sharing, and Health Score

export type ShareMode = 'white_label' | 'mls' | 'original';

export interface PropertyShare {
  id: string;
  property_id: string;
  shared_by: string;
  shared_with?: string;
  
  // Configuration
  share_mode: ShareMode;
  share_link: string;
  share_token: string;
  
  // White Label Customization
  custom_agent_name?: string;
  custom_agent_phone?: string;
  custom_agent_email?: string;
  custom_agency_name?: string;
  
  // Analytics
  views_count: number;
  clicks_count: number;
  leads_generated: number;
  
  // Metadata
  expires_at?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PropertyShareView {
  id: string;
  share_id: string;
  
  // Visitor Info
  ip_address?: string;
  user_agent?: string;
  referrer?: string;
  
  // Location
  country?: string;
  city?: string;
  
  // Activity
  duration_seconds?: number;
  viewed_at: string;
}

export type PortalName = 
  | 'inmuebles24'
  | 'vivanuncios' 
  | 'mercadolibre'
  | 'lamudi'
  | 'propiedades_com'
  | 'custom';

export type PortalStatus = 'draft' | 'published' | 'paused' | 'error' | 'removed';

export interface PropertyPortal {
  id: string;
  property_id: string;
  portal_name: PortalName;
  
  // Portal Integration
  portal_listing_id?: string;
  portal_url?: string;
  status: PortalStatus;
  
  // Sync
  last_synced_at?: string;
  sync_error?: string;
  sync_attempts: number;
  
  // Settings
  portal_settings: Record<string, any>;
  
  // Analytics
  views_on_portal: number;
  contacts_from_portal: number;
  
  created_at: string;
  updated_at: string;
}

export interface HealthScoreItem {
  points: number;
  max_points: number;
  completed: boolean;
  current_count?: number;
  target_count?: number;
  current_length?: number;
  target_length?: number;
}

export interface HealthScoreBreakdown {
  total_score: number;
  items: {
    coordinates: HealthScoreItem;
    photos: HealthScoreItem;
    video: HealthScoreItem;
    virtual_tour: HealthScoreItem;
    description: HealthScoreItem;
    documents: HealthScoreItem;
    amenities: HealthScoreItem;
  };
  suggestions: string[];
}

// Property Wizard Step State
export interface PropertyWizardStep {
  step: number;
  title: string;
  isComplete: boolean;
  isOptional: boolean;
}

export interface PropertyFormStep1 {
  property_type: string;
  operation_type: string;
  title: string;
  description: string;
  sale_price?: number;
  rent_price?: number;
  currency: string;
}

export interface PropertyFormStep2 {
  address: {
    street?: string;
    exterior_number?: string;
    interior_number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
    formatted_address?: string;
  };
  coordinates?: {
    lat: number;
    lng: number;
  };
  show_exact_location: boolean;
}

export interface PropertyFormStep3 {
  bedrooms?: number;
  bathrooms?: number;
  half_bathrooms?: number;
  parking_spaces?: number;
  construction_m2?: number;
  land_m2?: number;
  total_m2?: number;
  floors?: number;
  floor_number?: number;
  year_built?: number;
  condition?: string;
}

export interface PropertyFormStep4 {
  amenities: string[];
}

export interface PropertyFormStep5 {
  photos: Array<{
    id: string;
    url: string;
    file?: File;
  }>;
  videos: string[];
  virtual_tour_url?: string;
  floor_plan_url?: string;
}

export interface PropertyFormStep6 {
  owner_id?: string;
  commission_shared: boolean;
  commission_percentage?: number;
  commission_amount?: number;
  is_exclusive: boolean;
  exclusivity_expires_at?: string;
}

export interface PropertyFormStep7 {
  // Review step - no additional data
  confirm_publish: boolean;
}

// Complete property wizard data
export type PropertyWizardData = 
  & PropertyFormStep1 
  & PropertyFormStep2 
  & PropertyFormStep3 
  & PropertyFormStep4 
  & PropertyFormStep5 
  & PropertyFormStep6 
  & PropertyFormStep7;

// Available amenities list
export const PROPERTY_AMENITIES = [
  // Basic
  'pool',
  'gym',
  'security_24_7',
  'elevator',
  'parking',
  'storage',
  
  // Recreational
  'garden',
  'terrace',
  'balcony',
  'jacuzzi',
  'sauna',
  'steam_room',
  'playground',
  'sports_court',
  'bbq_area',
  'fire_pit',
  
  // Services
  'doorman',
  'laundry',
  'cleaning_service',
  'concierge',
  'valet_parking',
  
  // Technology
  'smart_home',
  'wifi',
  'cctv',
  'intercom',
  'alarm_system',
  
  // Pet-friendly
  'pet_friendly',
  'pet_park',
  'pet_grooming',
  
  // Family
  'kids_area',
  'daycare',
  'teen_room',
  
  // Business
  'business_center',
  'coworking',
  'meeting_rooms',
  'event_room',
  
  // Wellness
  'spa',
  'yoga_studio',
  'meditation_room',
  'jogging_track',
  'bike_path',
  
  // Accessibility
  'wheelchair_accessible',
  'accessible_entrance',
  'accessible_parking',
] as const;

export type Amenity = typeof PROPERTY_AMENITIES[number];

// Amenity labels in Spanish
export const AMENITY_LABELS: Record<Amenity, string> = {
  pool: 'Alberca',
  gym: 'Gimnasio',
  security_24_7: 'Seguridad 24/7',
  elevator: 'Elevador',
  parking: 'Estacionamiento',
  storage: 'Bodega',
  
  garden: 'Jardín',
  terrace: 'Terraza',
  balcony: 'Balcón',
  jacuzzi: 'Jacuzzi',
  sauna: 'Sauna',
  steam_room: 'Baño de vapor',
  playground: 'Área de juegos',
  sports_court: 'Cancha deportiva',
  bbq_area: 'Área de asador',
  fire_pit: 'Fogata',
  
  doorman: 'Portero',
  laundry: 'Lavandería',
  cleaning_service: 'Servicio de limpieza',
  concierge: 'Conserje',
  valet_parking: 'Valet parking',
  
  smart_home: 'Casa inteligente',
  wifi: 'WiFi',
  cctv: 'Cámaras CCTV',
  intercom: 'Interfón',
  alarm_system: 'Sistema de alarma',
  
  pet_friendly: 'Pet friendly',
  pet_park: 'Área para mascotas',
  pet_grooming: 'Estética para mascotas',
  
  kids_area: 'Área infantil',
  daycare: 'Guardería',
  teen_room: 'Sala para adolescentes',
  
  business_center: 'Centro de negocios',
  coworking: 'Coworking',
  meeting_rooms: 'Salas de juntas',
  event_room: 'Salón de eventos',
  
  spa: 'Spa',
  yoga_studio: 'Estudio de yoga',
  meditation_room: 'Sala de meditación',
  jogging_track: 'Pista para correr',
  bike_path: 'Ciclopista',
  
  wheelchair_accessible: 'Accesible para silla de ruedas',
  accessible_entrance: 'Entrada accesible',
  accessible_parking: 'Estacionamiento accesible',
};
