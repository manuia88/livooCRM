-- =============================================
-- NEXUS OS - Row Level Security Policies
-- Migration: 0004_rls_policies
-- Description: Multi-tenant security policies
-- =============================================

-- =============================================
-- ENABLE RLS ON ALL TABLES
-- =============================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

ALTER TABLE owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_documents ENABLE ROW LEVEL SECURITY;

ALTER TABLE developments ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_unit_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE development_financial_plans ENABLE ROW LEVEL SECURITY;

ALTER TABLE owner_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE owner_reports ENABLE ROW LEVEL SECURITY;

ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_sources ENABLE ROW LEVEL SECURITY;

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_logs ENABLE ROW LEVEL SECURITY;

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_rules ENABLE ROW LEVEL SECURITY;

ALTER TABLE visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE visit_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- =============================================
-- HELPER FUNCTIONS FOR RLS
-- =============================================

-- Get user's agency ID
CREATE OR REPLACE FUNCTION auth.user_agency_id()
RETURNS UUID AS $$
    SELECT agency_id FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user is admin
CREATE OR REPLACE FUNCTION auth.is_admin()
RETURNS BOOLEAN AS $$
    SELECT role = 'admin' FROM user_profiles WHERE id = auth.uid()
$$ LANGUAGE SQL SECURITY DEFINER;

-- Check if user has permission
CREATE OR REPLACE FUNCTION auth.has_permission(permission_name TEXT)
RETURNS BOOLEAN AS $$
    SELECT EXISTS (
        SELECT 1 FROM user_profiles up
        WHERE up.id = auth.uid()
        AND (
            up.role = 'admin'
            OR permission_name = ANY(SELECT jsonb_array_elements_text(up.permissions))
        )
    )
$$ LANGUAGE SQL SECURITY DEFINER;

-- =============================================
-- AGENCIES POLICIES
-- =============================================

CREATE POLICY "Users can view their own agency"
ON agencies FOR SELECT
USING (id = auth.user_agency_id());

CREATE POLICY "Admins can update their agency"
ON agencies FOR UPDATE
USING (id = auth.user_agency_id() AND auth.is_admin());

-- =============================================
-- USER PROFILES POLICIES
-- =============================================

CREATE POLICY "Users can view profiles in their agency"
ON user_profiles FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Users can update their own profile"
ON user_profiles FOR UPDATE
USING (id = auth.uid());

CREATE POLICY "Admins can insert users in their agency"
ON user_profiles FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id() AND auth.is_admin());

-- =============================================
-- TEAMS POLICIES
-- =============================================

CREATE POLICY "Users see teams from their agency"
ON teams FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Managers can create teams"
ON teams FOR INSERT
WITH CHECK (
    agency_id = auth.user_agency_id() 
    AND (auth.is_admin() OR EXISTS (
        SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role IN ('admin', 'manager')
    ))
);

CREATE POLICY "Team leaders can update their teams"
ON teams FOR UPDATE
USING (leader_id = auth.uid() OR auth.is_admin());

-- =============================================
-- TEAM MEMBERS POLICIES
-- =============================================

CREATE POLICY "Users see team members from their agency"
ON team_members FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM teams t
        WHERE t.id = team_members.team_id
        AND t.agency_id = auth.user_agency_id()
    )
);

-- =============================================
-- PROPERTIES POLICIES (CRITICAL)
-- =============================================

CREATE POLICY "Users see properties from their agency"
ON properties FOR SELECT
USING (
    agency_id = auth.user_agency_id()
    OR (shared_in_mls = true AND status = 'active')
);

CREATE POLICY "Users create properties for their agency"
ON properties FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id());

CREATE POLICY "Producers and sellers can update their properties"
ON properties FOR UPDATE
USING (
    agency_id = auth.user_agency_id()
    AND (
        producer_id = auth.uid()
        OR seller_id = auth.uid()
        OR auth.is_admin()
    )
);

CREATE POLICY "Admins can delete properties"
ON properties FOR DELETE
USING (agency_id = auth.user_agency_id() AND auth.is_admin());

-- =============================================
-- PROPERTY RELATED POLICIES
-- =============================================

CREATE POLICY "Users see property changes from their agency"
ON property_changes FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = property_changes.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Anyone can create property views"
ON property_views FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users see property views from their agency"
ON property_views FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = property_views.property_id
        AND (p.agency_id = auth.user_agency_id() OR p.shared_in_mls = true)
    )
);

CREATE POLICY "Users manage favorites for properties in their agency"
ON property_favorites FOR ALL
USING (
    user_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = property_favorites.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see property documents from their agency"
ON property_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = property_documents.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users can upload documents to their properties"
ON property_documents FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = property_documents.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

-- =============================================
-- OWNERS POLICIES
-- =============================================

CREATE POLICY "Users see owners from their agency"
ON owners FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Users create owners for their agency"
ON owners FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id());

CREATE POLICY "Users update owners from their agency"
ON owners FOR UPDATE
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Users see owner documents from their agency"
ON owner_documents FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM owners o
        WHERE o.id = owner_documents.owner_id
        AND o.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see owner reports from their agency"
ON owner_reports FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM owners o
        WHERE o.id = owner_reports.owner_id
        AND o.agency_id = auth.user_agency_id()
    )
);

-- =============================================
-- DEVELOPMENTS POLICIES
-- =============================================

CREATE POLICY "Users see developments from their agency"
ON developments FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Users create developments for their agency"
ON developments FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id());

CREATE POLICY "Users update developments from their agency"
ON developments FOR UPDATE
USING (agency_id = auth.user_agency_id());

-- Development related tables
CREATE POLICY "Users see development unit types from their agency"
ON development_unit_types FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM developments d
        WHERE d.id = development_unit_types.development_id
        AND d.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see development units from their agency"
ON development_units FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM developments d
        WHERE d.id = development_units.development_id
        AND d.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see development financial plans from their agency"
ON development_financial_plans FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM developments d
        WHERE d.id = development_financial_plans.development_id
        AND d.agency_id = auth.user_agency_id()
    )
);

-- =============================================
-- CONTACTS POLICIES (CRITICAL)
-- =============================================

CREATE POLICY "Users see contacts from their agency"
ON contacts FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Users create contacts for their agency"
ON contacts FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id());

CREATE POLICY "Assigned users and admins can update contacts"
ON contacts FOR UPDATE
USING (
    agency_id = auth.user_agency_id()
    AND (assigned_to = auth.uid() OR auth.is_admin())
);

CREATE POLICY "Admins can delete contacts"
ON contacts FOR DELETE
USING (agency_id = auth.user_agency_id() AND auth.is_admin());

-- Contact related tables
CREATE POLICY "Users see contact properties from their agency"
ON contact_properties FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM contacts c
        WHERE c.id = contact_properties.contact_id
        AND c.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see contact interactions from their agency"
ON contact_interactions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM contacts c
        WHERE c.id = contact_interactions.contact_id
        AND c.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see contact notes from their agency"
ON contact_notes FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM contacts c
        WHERE c.id = contact_notes.contact_id
        AND c.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see contact tags from their agency"
ON contact_tags FOR ALL
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Users see contact sources from their agency"
ON contact_sources FOR ALL
USING (agency_id = auth.user_agency_id());

-- =============================================
-- CONVERSATIONS POLICIES
-- =============================================

CREATE POLICY "Users see conversations from their agency"
ON conversations FOR SELECT
USING (
    agency_id = auth.user_agency_id()
    OR assigned_to = auth.uid()
);

CREATE POLICY "Users create conversations for their agency"
ON conversations FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id());

CREATE POLICY "Assigned users can update conversations"
ON conversations FOR UPDATE
USING (
    agency_id = auth.user_agency_id()
    AND (assigned_to = auth.uid() OR auth.is_admin())
);

-- Messages
CREATE POLICY "Users see messages from conversations they have access to"
ON messages FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (c.agency_id = auth.user_agency_id() OR c.assigned_to = auth.uid())
    )
);

CREATE POLICY "Users can send messages to their conversations"
ON messages FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = messages.conversation_id
        AND (c.agency_id = auth.user_agency_id() OR c.assigned_to = auth.uid())
    )
);

-- WhatsApp Sessions
CREATE POLICY "Users see whatsapp sessions from their conversations"
ON whatsapp_sessions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM conversations c
        WHERE c.id = whatsapp_sessions.conversation_id
        AND c.agency_id = auth.user_agency_id()
    )
);

-- Email Templates
CREATE POLICY "Users see email templates from their agency"
ON email_templates FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Admins can manage email templates"
ON email_templates FOR ALL
USING (agency_id = auth.user_agency_id() AND auth.is_admin());

-- SMS Logs
CREATE POLICY "Users see SMS logs from their agency"
ON sms_logs FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM contacts c
        WHERE c.id = sms_logs.contact_id
        AND c.agency_id = auth.user_agency_id()
    )
    OR contact_id IS NULL
);

-- =============================================
-- TASKS POLICIES
-- =============================================

CREATE POLICY "Users see tasks from their agency"
ON tasks FOR SELECT
USING (
    agency_id = auth.user_agency_id()
    OR assigned_to = auth.uid()
);

CREATE POLICY "Users create tasks for their agency"
ON tasks FOR INSERT
WITH CHECK (agency_id = auth.user_agency_id());

CREATE POLICY "Assigned users can update their tasks"
ON tasks FOR UPDATE
USING (
    agency_id = auth.user_agency_id()
    AND (assigned_to = auth.uid() OR created_by = auth.uid() OR auth.is_admin())
);

-- Task Templates & Rules
CREATE POLICY "Users see task templates from their agency"
ON task_templates FOR ALL
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Admins manage task rules"
ON task_rules FOR ALL
USING (agency_id = auth.user_agency_id() AND auth.is_admin());

-- =============================================
-- VISITS & OFFERS POLICIES
-- =============================================

CREATE POLICY "Users see visits from their agency"
ON visits FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = visits.property_id
        AND p.agency_id = auth.user_agency_id()
    )
    OR agent_id = auth.uid()
);

CREATE POLICY "Agents can manage their visits"
ON visits FOR ALL
USING (
    agent_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = visits.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users see visit feedback from their agency"
ON visit_feedback FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM visits v
        JOIN properties p ON p.id = v.property_id
        WHERE v.id = visit_feedback.visit_id
        AND p.agency_id = auth.user_agency_id()
    )
);

-- Offers
CREATE POLICY "Users see offers from their agency"
ON offers FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = offers.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Users can create offers for their properties"
ON offers FOR INSERT
WITH CHECK (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = offers.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Agents and admins can update offers"
ON offers FOR UPDATE
USING (
    agent_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = offers.property_id
        AND p.agency_id = auth.user_agency_id()
        AND auth.is_admin()
    )
);

-- Transactions
CREATE POLICY "Users see transactions from their agency"
ON transactions FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = transactions.property_id
        AND p.agency_id = auth.user_agency_id()
    )
);

CREATE POLICY "Admins can manage transactions"
ON transactions FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM properties p
        WHERE p.id = transactions.property_id
        AND p.agency_id = auth.user_agency_id()
        AND auth.is_admin()
    )
);

-- =============================================
-- ANALYTICS POLICIES
-- =============================================

CREATE POLICY "Users see activity logs from their agency"
ON activity_logs FOR SELECT
USING (agency_id = auth.user_agency_id() OR user_id = auth.uid());

CREATE POLICY "System can insert activity logs"
ON activity_logs FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users see sales funnel stages from their agency"
ON sales_funnel_stages FOR SELECT
USING (agency_id = auth.user_agency_id());

CREATE POLICY "Admins manage funnel stages"
ON sales_funnel_stages FOR ALL
USING (agency_id = auth.user_agency_id() AND auth.is_admin());

CREATE POLICY "Users see their own performance"
ON agent_performance FOR SELECT
USING (
    user_id = auth.uid()
    OR auth.is_admin()
);

CREATE POLICY "System can insert performance data"
ON agent_performance FOR INSERT
WITH CHECK (true);

CREATE POLICY "Admins see all audit logs"
ON audit_logs FOR SELECT
USING (auth.is_admin());

CREATE POLICY "System can insert audit logs"
ON audit_logs FOR INSERT
WITH CHECK (true);

-- =============================================
-- PERMISSIONS POLICIES (System tables)
-- =============================================

CREATE POLICY "Everyone can view permissions"
ON permissions FOR SELECT
USING (true);

CREATE POLICY "Everyone can view role permissions"
ON role_permissions FOR SELECT
USING (true);

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON POLICY "Users see properties from their agency" ON properties IS 'Multi-tenant isolation + MLS sharing';
COMMENT ON POLICY "Users see contacts from their agency" ON contacts IS 'Multi-tenant isolation for CRM data';
COMMENT ON FUNCTION auth.user_agency_id IS 'Helper function to get current user agency ID';
COMMENT ON FUNCTION auth.is_admin IS 'Helper function to check if user is admin';
