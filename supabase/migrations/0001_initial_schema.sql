-- =============================================
-- NEXUS OS - Complete Database Schema
-- Migration: 0001_initial_schema
-- Description: Core CRM tables for real estate
-- =============================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- =============================================
-- MODULE 1: CORE SYSTEM
-- =============================================

-- Agencies (Multi-tenant support)
CREATE TABLE agencies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    website TEXT,
    phone TEXT,
    email TEXT,
    address JSONB,
    
    -- Settings
    settings JSONB DEFAULT '{}',
    timezone TEXT DEFAULT 'America/Mexico_City',
    
    -- Subscription
    plan_type TEXT DEFAULT 'trial' CHECK (plan_type IN ('trial', 'basic', 'pro', 'enterprise')),
    plan_expires_at TIMESTAMPTZ,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- User Profiles (extends auth.users)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    -- Personal Info
    first_name TEXT NOT NULL,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || COALESCE(last_name, '')) STORED,
    avatar_url TEXT,
    phone TEXT,
    whatsapp TEXT,
    
    -- Role & Permissions
    role TEXT DEFAULT 'agent' CHECK (role IN ('admin', 'manager', 'agent', 'viewer')),
    permissions JSONB DEFAULT '[]',
    
    -- Professional Info
    license_number TEXT,
    specialties JSONB DEFAULT '[]',
    bio TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    last_login_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teams
CREATE TABLE teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    leader_id UUID REFERENCES user_profiles(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Team Members
CREATE TABLE team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('leader', 'member')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(team_id, user_id)
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Role Permissions
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role TEXT NOT NULL,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE NOT NULL,
    
    UNIQUE(role, permission_id)
);

-- =============================================
-- MODULE 2: PROPERTIES (CRITICAL)
-- =============================================

-- Owners (moved here for FK dependency)
CREATE TABLE owners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    -- Personal/Company Info
    type TEXT DEFAULT 'individual' CHECK (type IN ('individual', 'company')),
    first_name TEXT,
    last_name TEXT,
    company_name TEXT,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    rfc TEXT,
    
    -- Address
    address JSONB,
    
    -- Banking
    bank_info JSONB,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Properties (MAIN TABLE)
CREATE TABLE properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    producer_id UUID REFERENCES user_profiles(id),
    seller_id UUID REFERENCES user_profiles(id),
    owner_id UUID REFERENCES owners(id),
    
    -- Basic Info
    title TEXT NOT NULL,
    description TEXT,
    property_type TEXT NOT NULL CHECK (property_type IN (
        'house', 'apartment', 'condo', 'townhouse', 'land', 'commercial', 
        'office', 'warehouse', 'building', 'farm', 'development'
    )),
    operation_type TEXT NOT NULL CHECK (operation_type IN ('sale', 'rent', 'both')),
    status TEXT DEFAULT 'draft' CHECK (status IN (
        'draft', 'active', 'reserved', 'sold', 'rented', 'suspended', 'archived'
    )),
    
    -- Location
    address JSONB NOT NULL,
    street TEXT,
    exterior_number TEXT,
    interior_number TEXT,
    neighborhood TEXT,
    city TEXT,
    state TEXT,
    postal_code TEXT,
    country TEXT DEFAULT 'México',
    coordinates GEOGRAPHY(POINT, 4326),
    show_exact_location BOOLEAN DEFAULT false,
    
    -- Characteristics
    bedrooms INTEGER,
    bathrooms NUMERIC(3,1),
    half_bathrooms INTEGER,
    parking_spaces INTEGER,
    construction_m2 NUMERIC(10,2),
    land_m2 NUMERIC(10,2),
    total_m2 NUMERIC(10,2),
    floors INTEGER,
    floor_number INTEGER,
    year_built INTEGER,
    condition TEXT CHECK (condition IN ('new', 'excellent', 'good', 'needs_repair', 'under_construction')),
    
    -- Pricing
    sale_price NUMERIC(12,2),
    rent_price NUMERIC(12,2),
    currency TEXT DEFAULT 'MXN',
    maintenance_fee NUMERIC(10,2),
    property_tax NUMERIC(10,2),
    
    -- Features & Amenities
    amenities JSONB DEFAULT '[]',
    features JSONB DEFAULT '{}',
    
    -- MLS & Sharing
    shared_in_mls BOOLEAN DEFAULT false,
    mls_id TEXT,
    commission_shared BOOLEAN DEFAULT false,
    commission_percentage NUMERIC(5,2),
    commission_amount NUMERIC(12,2),
    is_exclusive BOOLEAN DEFAULT false,
    exclusivity_expires_at TIMESTAMPTZ,
    
    -- Health Score (0-100)
    health_score INTEGER DEFAULT 0 CHECK (health_score BETWEEN 0 AND 100),
    
    -- Multimedia
    photos JSONB DEFAULT '[]',
    videos JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    floor_plan_url TEXT,
    
    -- Analytics
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    
    -- SEO
    slug TEXT,
    meta_title TEXT,
    meta_description TEXT,
    
    -- Timestamps
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Property Changes (Audit Trail)
CREATE TABLE property_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    
    field_name TEXT NOT NULL,
    old_value JSONB,
    new_value JSONB,
    change_type TEXT CHECK (change_type IN ('create', 'update', 'delete')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Views (Analytics)
CREATE TABLE property_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    contact_id UUID REFERENCES contacts(id),
    
    source TEXT CHECK (source IN ('web', 'mobile', 'portal', 'email', 'internal')),
    referrer TEXT,
    ip_address INET,
    user_agent TEXT,
    duration_seconds INTEGER,
    
    viewed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Property Favorites
CREATE TABLE property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    contact_id UUID REFERENCES contacts(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(property_id, user_id),
    CHECK ((user_id IS NOT NULL) OR (contact_id IS NOT NULL))
);

-- Property Documents
CREATE TABLE property_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('deed', 'cadastral', 'appraisal', 'certificate', 'contract', 'other')),
    file_url TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    
    uploaded_by UUID REFERENCES user_profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULE 3: REAL ESTATE DEVELOPMENTS
-- =============================================

-- Developments
CREATE TABLE developments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    developer_id UUID REFERENCES owners(id),
    
    name TEXT NOT NULL,
    description TEXT,
    logo_url TEXT,
    
    -- Location
    address JSONB NOT NULL,
    coordinates GEOGRAPHY(POINT, 4326),
    
    -- Details
    total_units INTEGER,
    available_units INTEGER,
    delivery_date DATE,
    status TEXT CHECK (status IN ('planning', 'construction', 'selling', 'completed')),
    
    -- Amenities
    amenities JSONB DEFAULT '[]',
    
    -- Media
    photos JSONB DEFAULT '[]',
    videos JSONB DEFAULT '[]',
    virtual_tour_url TEXT,
    master_plan_url TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Development Unit Types
CREATE TABLE development_unit_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    development_id UUID REFERENCES developments(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    -- Characteristics
    bedrooms INTEGER,
    bathrooms NUMERIC(3,1),
    parking_spaces INTEGER,
    construction_m2 NUMERIC(10,2),
    
    -- Pricing
    base_price NUMERIC(12,2),
    
    -- Media
    floor_plan_url TEXT,
    photos JSONB DEFAULT '[]',
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Development Units
CREATE TABLE development_units (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    development_id UUID REFERENCES developments(id) ON DELETE CASCADE NOT NULL,
    unit_type_id UUID REFERENCES development_unit_types(id),
    
    unit_number TEXT NOT NULL,
    floor INTEGER,
    
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'reserved', 'sold')),
    
    -- Pricing
    price NUMERIC(12,2),
    
    -- References
    property_id UUID REFERENCES properties(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Development Financial Plans
CREATE TABLE development_financial_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    development_id UUID REFERENCES developments(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    down_payment_percentage NUMERIC(5,2),
    monthly_payments INTEGER,
    interest_rate NUMERIC(5,2),
    
    details JSONB DEFAULT '{}',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULE 4: PROPERTY OWNERS (continued)
-- =============================================

-- Owner Documents
CREATE TABLE owner_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES owners(id) ON DELETE CASCADE NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('id', 'proof_of_ownership', 'tax_document', 'contract', 'other')),
    file_url TEXT NOT NULL,
    
    uploaded_by UUID REFERENCES user_profiles(id),
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Owner Reports (Monthly statements)
CREATE TABLE owner_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES owners(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id),
    
    report_type TEXT CHECK (report_type IN ('monthly', 'quarterly', 'annual', 'custom')),
    period_start DATE,
    period_end DATE,
    
    total_income NUMERIC(12,2),
    total_expenses NUMERIC(12,2),
    net_income NUMERIC(12,2),
    
    details JSONB DEFAULT '{}',
    pdf_url TEXT,
    
    generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULE 5: CONTACTS/LEADS (CRITICAL)
-- =============================================

-- Contacts
CREATE TABLE contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    assigned_to UUID REFERENCES user_profiles(id),
    
    -- Personal Info
    first_name TEXT NOT NULL,
    last_name TEXT,
    full_name TEXT GENERATED ALWAYS AS (first_name || ' ' || COALESCE(last_name, '')) STORED,
    email TEXT,
    phone TEXT,
    whatsapp TEXT,
    
    -- Classification
    type TEXT CHECK (type IN ('buyer', 'seller', 'renter', 'landlord', 'investor', 'other')),
    status TEXT DEFAULT 'new' CHECK (status IN (
        'new', 'contacted', 'qualified', 'visiting', 'negotiating', 
        'closed_won', 'closed_lost', 'inactive'
    )),
    lead_score INTEGER DEFAULT 0 CHECK (lead_score BETWEEN 0 AND 100),
    
    -- Origin
    source TEXT,
    source_details JSONB,
    campaign_id TEXT,
    
    -- Search Criteria
    search_criteria JSONB DEFAULT '{}',
    budget_min NUMERIC(12,2),
    budget_max NUMERIC(12,2),
    preferred_zones JSONB DEFAULT '[]',
    preferred_property_types JSONB DEFAULT '[]',
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    custom_fields JSONB DEFAULT '{}',
    notes TEXT,
    
    -- Follow-up
    last_contact_at TIMESTAMPTZ,
    next_followup_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Contact Properties (Many-to-Many)
CREATE TABLE contact_properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    
    interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(contact_id, property_id)
);

-- Contact Interactions
CREATE TABLE contact_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    
    type TEXT NOT NULL CHECK (type IN (
        'call', 'email', 'whatsapp', 'meeting', 'visit', 'sms', 'note', 'other'
    )),
    direction TEXT CHECK (direction IN ('inbound', 'outbound')),
    
    subject TEXT,
    notes TEXT,
    duration_minutes INTEGER,
    outcome TEXT,
    
    interaction_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Notes
CREATE TABLE contact_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES user_profiles(id),
    
    content TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    is_pinned BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Contact Tags
CREATE TABLE contact_tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    name TEXT NOT NULL,
    color TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, name)
);

-- Contact Sources
CREATE TABLE contact_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('organic', 'paid', 'referral', 'portal', 'social', 'other')),
    cost_per_lead NUMERIC(10,2),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, name)
);

-- =============================================
-- MODULE 6: COMMUNICATIONS (SOCIAL INBOX)
-- =============================================

-- Conversations
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    contact_id UUID REFERENCES contacts(id),
    assigned_to UUID REFERENCES user_profiles(id),
    
    channel TEXT NOT NULL CHECK (channel IN (
        'whatsapp', 'instagram_dm', 'facebook_messenger', 'sms', 
        'email', 'webchat', 'telegram', 'tiktok'
    )),
    
    -- External Platform IDs
    platform_id TEXT,
    platform_thread_id TEXT,
    
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed', 'spam')),
    
    -- Message Tracking
    last_message_at TIMESTAMPTZ,
    last_message_from TEXT CHECK (last_message_from IN ('contact', 'agent')),
    unread_count INTEGER DEFAULT 0,
    
    -- Metadata
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    sender_id UUID REFERENCES user_profiles(id),
    
    content TEXT NOT NULL,
    media_urls JSONB DEFAULT '[]',
    
    -- Platform Integration
    platform_message_id TEXT,
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'read', 'failed')),
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    
    -- AI/Automation
    is_automated BOOLEAN DEFAULT false,
    sentiment TEXT CHECK (sentiment IN ('positive', 'neutral', 'negative')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- WhatsApp Sessions
CREATE TABLE whatsapp_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE NOT NULL,
    
    phone_number TEXT NOT NULL,
    session_start TIMESTAMPTZ NOT NULL,
    session_end TIMESTAMPTZ,
    
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'closed')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Email Templates
CREATE TABLE email_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    name TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_html TEXT NOT NULL,
    body_text TEXT,
    
    category TEXT,
    variables JSONB DEFAULT '[]',
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- SMS Logs
CREATE TABLE sms_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contact_id UUID REFERENCES contacts(id),
    
    phone_number TEXT NOT NULL,
    message TEXT NOT NULL,
    
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    status TEXT CHECK (status IN ('sent', 'delivered', 'failed', 'received')),
    
    provider TEXT,
    provider_message_id TEXT,
    cost NUMERIC(10,4),
    
    sent_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULE 7: TASKS (PULPPO-STYLE)
-- =============================================

-- Tasks
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    assigned_to UUID REFERENCES user_profiles(id),
    created_by UUID REFERENCES user_profiles(id),
    
    task_type TEXT NOT NULL CHECK (task_type IN ('property', 'contact', 'visit', 'general')),
    related_property_id UUID REFERENCES properties(id),
    related_contact_id UUID REFERENCES contacts(id),
    
    title TEXT NOT NULL,
    description TEXT,
    
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_progress', 'completed', 'skipped', 'expired', 'cancelled'
    )),
    
    -- Automation
    auto_generated BOOLEAN DEFAULT false,
    generation_rule TEXT,
    template_id UUID REFERENCES task_templates(id),
    
    -- Scheduling
    due_date TIMESTAMPTZ,
    reminder_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    
    -- Results
    completion_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Templates
CREATE TABLE task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    task_type TEXT NOT NULL,
    
    default_title TEXT NOT NULL,
    default_description TEXT,
    default_priority TEXT DEFAULT 'medium',
    default_due_days INTEGER,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Rules (Automation)
CREATE TABLE task_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    
    trigger_event TEXT NOT NULL CHECK (trigger_event IN (
        'property_created', 'property_published', 'contact_created', 
        'visit_scheduled', 'offer_received', 'custom'
    )),
    conditions JSONB DEFAULT '{}',
    
    template_id UUID REFERENCES task_templates(id) NOT NULL,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULE 8: VISITS & OFFERS
-- =============================================

-- Visits
CREATE TABLE visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES contacts(id) NOT NULL,
    agent_id UUID REFERENCES user_profiles(id),
    
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER DEFAULT 60,
    
    status TEXT DEFAULT 'scheduled' CHECK (status IN (
        'scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'
    )),
    
    visit_type TEXT CHECK (visit_type IN ('in_person', 'virtual')),
    meeting_url TEXT,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Visit Feedback
CREATE TABLE visit_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    visit_id UUID REFERENCES visits(id) ON DELETE CASCADE NOT NULL,
    
    contact_feedback TEXT,
    contact_rating INTEGER CHECK (contact_rating BETWEEN 1 AND 5),
    interest_level TEXT CHECK (interest_level IN ('low', 'medium', 'high')),
    
    agent_notes TEXT,
    next_steps TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Offers
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES contacts(id) NOT NULL,
    agent_id UUID REFERENCES user_profiles(id),
    
    offer_amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    
    offer_type TEXT CHECK (offer_type IN ('purchase', 'rent')),
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'accepted', 'rejected', 'countered', 'expired', 'withdrawn'
    )),
    
    -- Terms
    terms JSONB DEFAULT '{}',
    conditions TEXT,
    financing TEXT,
    
    -- Dates
    offer_date DATE NOT NULL DEFAULT CURRENT_DATE,
    expiry_date DATE,
    acceptance_date DATE,
    
    -- Counteroffers
    counter_amount NUMERIC(12,2),
    counter_terms JSONB,
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID REFERENCES properties(id) NOT NULL,
    contact_id UUID REFERENCES contacts(id) NOT NULL,
    agent_id UUID REFERENCES user_profiles(id),
    offer_id UUID REFERENCES offers(id),
    
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('sale', 'rent', 'lease')),
    
    -- Financial
    final_amount NUMERIC(12,2) NOT NULL,
    currency TEXT DEFAULT 'MXN',
    commission_amount NUMERIC(12,2),
    commission_percentage NUMERIC(5,2),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'in_process', 'completed', 'cancelled'
    )),
    
    -- Dates
    contract_date DATE,
    closing_date DATE,
    
    -- Documents
    documents JSONB DEFAULT '[]',
    
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MODULE 9: ANALYTICS & AUDIT
-- =============================================

-- Activity Logs
CREATE TABLE activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id),
    user_id UUID REFERENCES user_profiles(id),
    
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);

-- Sales Funnel Stages
CREATE TABLE sales_funnel_stages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    agency_id UUID REFERENCES agencies(id) NOT NULL,
    
    name TEXT NOT NULL,
    description TEXT,
    stage_order INTEGER NOT NULL,
    
    stage_type TEXT CHECK (stage_type IN ('lead', 'qualification', 'visit', 'negotiation', 'closing')),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(agency_id, stage_order)
);

-- Agent Performance
CREATE TABLE agent_performance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id) NOT NULL,
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Metrics
    properties_listed INTEGER DEFAULT 0,
    properties_sold INTEGER DEFAULT 0,
    total_sales_value NUMERIC(12,2) DEFAULT 0,
    total_commission NUMERIC(12,2) DEFAULT 0,
    
    contacts_created INTEGER DEFAULT 0,
    visits_completed INTEGER DEFAULT 0,
    offers_received INTEGER DEFAULT 0,
    
    -- Performance Score
    performance_score NUMERIC(5,2),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(user_id, period_start, period_end)
);

-- Audit Logs (Security)
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES user_profiles(id),
    
    action_type TEXT NOT NULL CHECK (action_type IN (
        'login', 'logout', 'create', 'update', 'delete', 'export', 'import', 'access_denied'
    )),
    resource_type TEXT NOT NULL,
    resource_id UUID,
    
    changes JSONB,
    ip_address INET,
    user_agent TEXT,
    location TEXT,
    
    severity TEXT DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action_type);

-- =============================================
-- END OF SCHEMA
-- =============================================

COMMENT ON TABLE properties IS 'Main property catalog - CRITICAL TABLE';
COMMENT ON TABLE contacts IS 'CRM contact/lead management - CRITICAL TABLE';
COMMENT ON TABLE conversations IS 'Unified social inbox - CRITICAL TABLE';
COMMENT ON TABLE tasks IS 'Intelligent task system - Pulppo-style';
