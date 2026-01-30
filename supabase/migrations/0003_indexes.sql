-- =============================================
-- NEXUS OS - Database Indexes
-- Migration: 0003_indexes
-- Description: Performance optimization indexes
-- =============================================

-- =============================================
-- CORE SYSTEM INDEXES
-- =============================================

-- Agencies
CREATE INDEX idx_agencies_slug ON agencies(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_agencies_active ON agencies(is_active) WHERE is_active = true;

-- User Profiles
CREATE INDEX idx_user_profiles_agency ON user_profiles(agency_id) WHERE is_active = true;
CREATE INDEX idx_user_profiles_role ON user_profiles(role);
CREATE INDEX idx_user_profiles_active ON user_profiles(is_active);

-- Teams
CREATE INDEX idx_teams_agency ON teams(agency_id);
CREATE INDEX idx_teams_leader ON teams(leader_id);

-- Team Members
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_team_members_user ON team_members(user_id);

-- =============================================
-- PROPERTY INDEXES
-- =============================================

-- Properties (CRITICAL - Most important indexes)
CREATE INDEX idx_properties_agency ON properties(agency_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_status ON properties(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_type ON properties(property_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_operation ON properties(operation_type) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_producer ON properties(producer_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_seller ON properties(seller_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_owner ON properties(owner_id) WHERE deleted_at IS NULL;

-- Spatial index for location searches
CREATE INDEX idx_properties_coordinates ON properties USING GIST (coordinates);

-- Price range searches
CREATE INDEX idx_properties_sale_price ON properties(sale_price) WHERE sale_price IS NOT NULL AND deleted_at IS NULL;
CREATE INDEX idx_properties_rent_price ON properties(rent_price) WHERE rent_price IS NOT NULL AND deleted_at IS NULL;

-- MLS & sharing
CREATE INDEX idx_properties_mls ON properties(shared_in_mls) WHERE shared_in_mls = true AND deleted_at IS NULL;
CREATE INDEX idx_properties_exclusive ON properties(is_exclusive) WHERE is_exclusive = true;

-- Health score
CREATE INDEX idx_properties_health_score ON properties(health_score DESC) WHERE deleted_at IS NULL;

-- Location fields for filtering
CREATE INDEX idx_properties_city ON properties(city) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_state ON properties(state) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_neighborhood ON properties(neighborhood) WHERE deleted_at IS NULL;

-- Composite indexes for common queries
CREATE INDEX idx_properties_agency_status ON properties(agency_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_agency_type_operation ON properties(agency_id, property_type, operation_type) WHERE deleted_at IS NULL;

-- Full-text search on title and description
CREATE INDEX idx_properties_search ON properties USING GIN (to_tsvector('spanish', coalesce(title, '') || ' ' || coalesce(description, '')));

-- Property Changes
CREATE INDEX idx_property_changes_property ON property_changes(property_id);
CREATE INDEX idx_property_changes_user ON property_changes(user_id);
CREATE INDEX idx_property_changes_created ON property_changes(created_at DESC);

-- Property Views
CREATE INDEX idx_property_views_property ON property_views(property_id);
CREATE INDEX idx_property_views_contact ON property_views(contact_id);
CREATE INDEX idx_property_views_viewed ON property_views(viewed_at DESC);

-- Property Favorites
CREATE INDEX idx_property_favorites_property ON property_favorites(property_id);
CREATE INDEX idx_property_favorites_user ON property_favorites(user_id);
CREATE INDEX idx_property_favorites_contact ON property_favorites(contact_id);

-- Property Documents
CREATE INDEX idx_property_documents_property ON property_documents(property_id);
CREATE INDEX idx_property_documents_type ON property_documents(type);

-- =============================================
-- OWNERS INDEXES
-- =============================================

CREATE INDEX idx_owners_agency ON owners(agency_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_owners_type ON owners(type);
CREATE INDEX idx_owner_documents_owner ON owner_documents(owner_id);
CREATE INDEX idx_owner_reports_owner ON owner_reports(owner_id);

-- =============================================
-- DEVELOPMENTS INDEXES
-- =============================================

CREATE INDEX idx_developments_agency ON developments(agency_id);
CREATE INDEX idx_developments_status ON developments(status);
CREATE INDEX idx_developments_developer ON developments(developer_id);
CREATE INDEX idx_developments_coordinates ON developments USING GIST (coordinates);

CREATE INDEX idx_development_unit_types_development ON development_unit_types(development_id);
CREATE INDEX idx_development_units_development ON development_units(development_id);
CREATE INDEX idx_development_units_type ON development_units(unit_type_id);
CREATE INDEX idx_development_units_status ON development_units(status);
CREATE INDEX idx_development_financial_plans_development ON development_financial_plans(development_id);

-- =============================================
-- CONTACTS INDEXES (CRITICAL)
-- =============================================

-- Contacts
CREATE INDEX idx_contacts_agency ON contacts(agency_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_status ON contacts(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_type ON contacts(type);
CREATE INDEX idx_contacts_score ON contacts(lead_score DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_source ON contacts(source);

-- Contact follow-up
CREATE INDEX idx_contacts_next_followup ON contacts(next_followup_at) WHERE next_followup_at IS NOT NULL AND deleted_at IS NULL;

-- Composite indexes
CREATE INDEX idx_contacts_agency_status ON contacts(agency_id, status) WHERE deleted_at IS NULL;
CREATE INDEX idx_contacts_assigned_status ON contacts(assigned_to, status) WHERE deleted_at IS NULL;

-- Full-text search
CREATE INDEX idx_contacts_search ON contacts USING GIN (to_tsvector('spanish', coalesce(first_name, '') || ' ' || coalesce(last_name, '') || ' ' || coalesce(email, '') || ' ' || coalesce(phone, '')));

-- Contact Properties
CREATE INDEX idx_contact_properties_contact ON contact_properties(contact_id);
CREATE INDEX idx_contact_properties_property ON contact_properties(property_id);
CREATE INDEX idx_contact_properties_interest ON contact_properties(interest_level);

-- Contact Interactions
CREATE INDEX idx_contact_interactions_contact ON contact_interactions(contact_id);
CREATE INDEX idx_contact_interactions_user ON contact_interactions(user_id);
CREATE INDEX idx_contact_interactions_type ON contact_interactions(type);
CREATE INDEX idx_contact_interactions_date ON contact_interactions(interaction_at DESC);

-- Contact Notes
CREATE INDEX idx_contact_notes_contact ON contact_notes(contact_id);
CREATE INDEX idx_contact_notes_user ON contact_notes(user_id);
CREATE INDEX idx_contact_notes_pinned ON contact_notes(is_pinned) WHERE is_pinned = true;

-- Contact Tags & Sources
CREATE INDEX idx_contact_tags_agency ON contact_tags(agency_id);
CREATE INDEX idx_contact_sources_agency ON contact_sources(agency_id);

-- =============================================
-- COMMUNICATIONS INDEXES
-- =============================================

-- Conversations
CREATE INDEX idx_conversations_agency ON conversations(agency_id);
CREATE INDEX idx_conversations_contact ON conversations(contact_id);
CREATE INDEX idx_conversations_assigned ON conversations(assigned_to);
CREATE INDEX idx_conversations_channel ON conversations(channel);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_conversations_unread ON conversations(unread_count) WHERE unread_count > 0;
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);

-- Composite for inbox views
CREATE INDEX idx_conversations_assigned_status ON conversations(assigned_to, status);
CREATE INDEX idx_conversations_agency_status ON conversations(agency_id, status);

-- Messages
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_direction ON messages(direction);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_messages_status ON messages(status);

-- WhatsApp Sessions
CREATE INDEX idx_whatsapp_sessions_conversation ON whatsapp_sessions(conversation_id);
CREATE INDEX idx_whatsapp_sessions_phone ON whatsapp_sessions(phone_number);
CREATE INDEX idx_whatsapp_sessions_status ON whatsapp_sessions(status);

-- Email Templates
CREATE INDEX idx_email_templates_agency ON email_templates(agency_id);
CREATE INDEX idx_email_templates_active ON email_templates(is_active) WHERE is_active = true;

-- SMS Logs
CREATE INDEX idx_sms_logs_contact ON sms_logs(contact_id);
CREATE INDEX idx_sms_logs_direction ON sms_logs(direction);
CREATE INDEX idx_sms_logs_sent ON sms_logs(sent_at DESC);

-- =============================================
-- TASKS INDEXES
-- =============================================

-- Tasks
CREATE INDEX idx_tasks_agency ON tasks(agency_id);
CREATE INDEX idx_tasks_assigned ON tasks(assigned_to);
CREATE INDEX idx_tasks_created_by ON tasks(created_by);
CREATE INDEX idx_tasks_type ON tasks(task_type);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_property ON tasks(related_property_id);
CREATE INDEX idx_tasks_contact ON tasks(related_contact_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE status IN ('pending', 'in_progress');

-- Composite for task lists
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status);
CREATE INDEX idx_tasks_assigned_due ON tasks(assigned_to, due_date) WHERE status IN ('pending', 'in_progress');

-- Task Templates & Rules
CREATE INDEX idx_task_templates_agency ON task_templates(agency_id);
CREATE INDEX idx_task_templates_active ON task_templates(is_active) WHERE is_active = true;
CREATE INDEX idx_task_rules_agency ON task_rules(agency_id);
CREATE INDEX idx_task_rules_active ON task_rules(is_active) WHERE is_active = true;
CREATE INDEX idx_task_rules_template ON task_rules(template_id);

-- =============================================
-- VISITS & OFFERS INDEXES
-- =============================================

-- Visits
CREATE INDEX idx_visits_property ON visits(property_id);
CREATE INDEX idx_visits_contact ON visits(contact_id);
CREATE INDEX idx_visits_agent ON visits(agent_id);
CREATE INDEX idx_visits_scheduled ON visits(scheduled_at);
CREATE INDEX idx_visits_status ON visits(status);

-- Composite for calendar views
CREATE INDEX idx_visits_agent_scheduled ON visits(agent_id, scheduled_at) WHERE status IN ('scheduled', 'confirmed');

-- Visit Feedback
CREATE INDEX idx_visit_feedback_visit ON visit_feedback(visit_id);

-- Offers
CREATE INDEX idx_offers_property ON offers(property_id);
CREATE INDEX idx_offers_contact ON offers(contact_id);
CREATE INDEX idx_offers_agent ON offers(agent_id);
CREATE INDEX idx_offers_status ON offers(status);
CREATE INDEX idx_offers_date ON offers(offer_date DESC);

-- Transactions
CREATE INDEX idx_transactions_property ON transactions(property_id);
CREATE INDEX idx_transactions_contact ON transactions(contact_id);
CREATE INDEX idx_transactions_agent ON transactions(agent_id);
CREATE INDEX idx_transactions_offer ON transactions(offer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(transaction_type);
CREATE INDEX idx_transactions_closing ON transactions(closing_date);

-- =============================================
-- ANALYTICS INDEXES
-- =============================================

-- Activity Logs
CREATE INDEX idx_activity_logs_agency ON activity_logs(agency_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);

-- Sales Funnel Stages
CREATE INDEX idx_sales_funnel_stages_agency ON sales_funnel_stages(agency_id);
CREATE INDEX idx_sales_funnel_stages_order ON sales_funnel_stages(stage_order);

-- Agent Performance
CREATE INDEX idx_agent_performance_user ON agent_performance(user_id);
CREATE INDEX idx_agent_performance_period ON agent_performance(period_start, period_end);

-- Audit Logs
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity) WHERE severity IN ('error', 'critical');

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON INDEX idx_properties_coordinates IS 'Spatial index for geographic searches';
COMMENT ON INDEX idx_properties_search IS 'Full-text search index for property titles and descriptions';
COMMENT ON INDEX idx_contacts_search IS 'Full-text search index for contact information';
