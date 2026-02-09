import type { Contact } from '@/hooks/useContacts'

export const mockContact: Contact = {
  id: 'contact-123',
  first_name: 'Juan',
  last_name: 'Pérez',
  full_name: 'Juan Pérez',
  email: 'juan@example.com',
  phone: '+5215512345678',
  whatsapp: '+5215512345678',
  contact_type: 'buyer',
  source: 'website',
  status: 'active',
  lead_score: 85,
  current_stage: 'calificado',
  assigned_to: 'user-123',
  assigned_to_name: 'Agent Smith',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-15T00:00:00Z',
  last_interaction: '2024-01-14T10:00:00Z',
}

export const mockContacts: Contact[] = [
  mockContact,
  {
    ...mockContact,
    id: 'contact-456',
    first_name: 'María',
    last_name: 'González',
    full_name: 'María González',
    email: 'maria@example.com',
    phone: '+5215598765432',
    lead_score: 45,
    current_stage: 'nuevo',
    source: 'referral',
  },
  {
    ...mockContact,
    id: 'contact-789',
    first_name: 'Carlos',
    last_name: 'López',
    full_name: 'Carlos López',
    email: 'carlos@example.com',
    lead_score: 92,
    current_stage: 'negociando',
    contact_type: 'investor',
  },
]
