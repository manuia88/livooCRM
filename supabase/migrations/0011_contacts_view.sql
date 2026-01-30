-- Create v_contacts_with_details view for the Contacts module
CREATE OR REPLACE VIEW v_contacts_with_details AS
SELECT 
    c.id,
    c.first_name,
    c.last_name,
    c.full_name,
    c.email,
    c.phone AS phone,
    c.contact_type,
    c.source,
    c.status,
    c.lead_score,
    c.current_stage,
    c.created_at,
    c.updated_at,
    up.full_name AS assigned_to_name,
    -- Get last interaction date
    (
        SELECT MAX(created_at) 
        FROM contact_interactions ci 
        WHERE ci.contact_id = c.id
    ) AS last_interaction,
    -- Count total interactions
    (
        SELECT COUNT(*) 
        FROM contact_interactions ci 
        WHERE ci.contact_id = c.id
    ) AS total_interactions,
    -- Get preferred contact method from details
    cd.preferred_contact_method,
    cd.budget_range,
    cd.property_preferences,
    cd.notes
FROM contacts c
LEFT JOIN user_profiles up ON c.assigned_to = up.id
LEFT JOIN contact_details cd ON c.id = cd.contact_id;

-- Grant access
GRANT SELECT ON v_contacts_with_details TO authenticated;

COMMENT ON VIEW v_contacts_with_details IS 'Comprehensive view of contacts with related details for CRM';
