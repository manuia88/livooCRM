-- =============================================
-- NEXUS OS - Database Functions & Triggers
-- Migration: 0002_functions_and_triggers
-- Description: Automation and helper functions
-- =============================================

-- =============================================
-- HELPER FUNCTIONS
-- =============================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Calculate Property Health Score
CREATE OR REPLACE FUNCTION calculate_property_health_score(property_id UUID)
RETURNS INTEGER AS $$
DECLARE
    score INTEGER := 0;
    prop RECORD;
BEGIN
    SELECT * INTO prop FROM properties WHERE id = property_id;
    
    IF prop IS NULL THEN
        RETURN 0;
    END IF;
    
    -- Location completeness (+10)
    IF prop.coordinates IS NOT NULL AND prop.show_exact_location THEN
        score := score + 10;
    END IF;
    
    -- Photo quality (+20 for 15+ photos)
    IF prop.photos IS NOT NULL AND jsonb_array_length(prop.photos) >= 15 THEN
        score := score + 20;
    ELSIF prop.photos IS NOT NULL AND jsonb_array_length(prop.photos) >= 10 THEN
        score := score + 15;
    ELSIF prop.photos IS NOT NULL AND jsonb_array_length(prop.photos) >= 5 THEN
        score := score + 10;
    END IF;
    
    -- Video presence (+20)
    IF prop.videos IS NOT NULL AND jsonb_array_length(prop.videos) > 0 THEN
        score := score + 20;
    END IF;
    
    -- Virtual tour (+15)
    IF prop.virtual_tour_url IS NOT NULL AND prop.virtual_tour_url != '' THEN
        score := score + 15;
    END IF;
    
    -- Description quality (+20)
    IF prop.description IS NOT NULL AND length(prop.description) > 200 THEN
        score := score + 20;
    ELSIF prop.description IS NOT NULL AND length(prop.description) > 100 THEN
        score := score + 10;
    END IF;
    
    -- Amenities (+5)
    IF prop.amenities IS NOT NULL AND jsonb_array_length(prop.amenities) >= 5 THEN
        score := score + 5;
    END IF;
    
    -- Floor plan (+10)
    IF prop.floor_plan_url IS NOT NULL AND prop.floor_plan_url != '' THEN
        score := score + 10;
    END IF;
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-update property health score
CREATE OR REPLACE FUNCTION trigger_update_property_health_score()
RETURNS TRIGGER AS $$
BEGIN
    NEW.health_score := calculate_property_health_score(NEW.id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Log property changes
CREATE OR REPLACE FUNCTION trigger_log_property_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if specific fields changed
    IF TG_OP = 'UPDATE' THEN
        -- Status changes
        IF OLD.status IS DISTINCT FROM NEW.status THEN
            INSERT INTO property_changes (property_id, user_id, field_name, old_value, new_value, change_type)
            VALUES (NEW.id, auth.uid(), 'status', to_jsonb(OLD.status), to_jsonb(NEW.status), 'update');
        END IF;
        
        -- Price changes
        IF OLD.sale_price IS DISTINCT FROM NEW.sale_price THEN
            INSERT INTO property_changes (property_id, user_id, field_name, old_value, new_value, change_type)
            VALUES (NEW.id, auth.uid(), 'sale_price', to_jsonb(OLD.sale_price), to_jsonb(NEW.sale_price), 'update');
        END IF;
        
        IF OLD.rent_price IS DISTINCT FROM NEW.rent_price THEN
            INSERT INTO property_changes (property_id, user_id, field_name, old_value, new_value, change_type)
            VALUES (NEW.id, auth.uid(), 'rent_price', to_jsonb(OLD.rent_price), to_jsonb(NEW.rent_price), 'update');
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update conversation metadata
CREATE OR REPLACE FUNCTION trigger_update_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_from = CASE 
            WHEN NEW.direction = 'inbound' THEN 'contact'
            ELSE 'agent'
        END,
        unread_count = CASE 
            WHEN NEW.direction = 'inbound' THEN unread_count + 1
            ELSE unread_count
        END,
        updated_at = NOW()
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update property view count
CREATE OR REPLACE FUNCTION trigger_increment_property_views()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE properties
    SET views_count = views_count + 1
    WHERE id = NEW.property_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update property favorites count
CREATE OR REPLACE FUNCTION trigger_update_favorites_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE properties
        SET favorites_count = favorites_count + 1
        WHERE id = NEW.property_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE properties
        SET favorites_count = favorites_count - 1
        WHERE id = OLD.property_id;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Function: Auto-generate tasks based on rules
CREATE OR REPLACE FUNCTION trigger_auto_generate_tasks()
RETURNS TRIGGER AS $$
DECLARE
    rule RECORD;
    new_task_id UUID;
    template RECORD;
BEGIN
    -- Find matching task rules
    FOR rule IN 
        SELECT tr.*, tt.* 
        FROM task_rules tr
        JOIN task_templates tt ON tr.template_id = tt.id
        WHERE tr.is_active = true
        AND tr.trigger_event = TG_ARGV[0]
    LOOP
        -- Create task from template
        INSERT INTO tasks (
            agency_id,
            assigned_to,
            task_type,
            related_property_id,
            related_contact_id,
            title,
            description,
            priority,
            auto_generated,
            generation_rule,
            template_id,
            due_date
        ) VALUES (
            rule.agency_id,
            CASE 
                WHEN TG_TABLE_NAME = 'properties' THEN NEW.producer_id
                WHEN TG_TABLE_NAME = 'contacts' THEN NEW.assigned_to
                ELSE NULL
            END,
            rule.task_type,
            CASE WHEN TG_TABLE_NAME = 'properties' THEN NEW.id ELSE NULL END,
            CASE WHEN TG_TABLE_NAME = 'contacts' THEN NEW.id ELSE NULL END,
            rule.default_title,
            rule.default_description,
            rule.default_priority,
            true,
            rule.name,
            rule.id,
            CASE 
                WHEN rule.default_due_days IS NOT NULL THEN NOW() + (rule.default_due_days || ' days')::INTERVAL
                ELSE NULL
            END
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function: Update contact last_contact_at
CREATE OR REPLACE FUNCTION trigger_update_contact_last_contact()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE contacts
    SET last_contact_at = NEW.interaction_at
    WHERE id = NEW.contact_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- TRIGGERS
-- =============================================

-- Updated_at triggers
CREATE TRIGGER set_updated_at_agencies
    BEFORE UPDATE ON agencies
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_user_profiles
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_teams
    BEFORE UPDATE ON teams
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_owners
    BEFORE UPDATE ON owners
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_properties
    BEFORE UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_developments
    BEFORE UPDATE ON developments
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_contacts
    BEFORE UPDATE ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_contact_notes
    BEFORE UPDATE ON contact_notes
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_conversations
    BEFORE UPDATE ON conversations
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_email_templates
    BEFORE UPDATE ON email_templates
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_visits
    BEFORE UPDATE ON visits
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_offers
    BEFORE UPDATE ON offers
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_transactions
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

CREATE TRIGGER set_updated_at_development_units
    BEFORE UPDATE ON development_units
    FOR EACH ROW
    EXECUTE FUNCTION trigger_set_updated_at();

-- Property health score trigger
CREATE TRIGGER update_property_health_score
    BEFORE INSERT OR UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_property_health_score();

-- Property changes logging
CREATE TRIGGER log_property_changes
    AFTER UPDATE ON properties
    FOR EACH ROW
    EXECUTE FUNCTION trigger_log_property_changes();

-- Conversation updates on new message
CREATE TRIGGER update_conversation_on_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_conversation_on_message();

-- Property view count
CREATE TRIGGER increment_property_views
    AFTER INSERT ON property_views
    FOR EACH ROW
    EXECUTE FUNCTION trigger_increment_property_views();

-- Property favorites count
CREATE TRIGGER update_favorites_count_insert
    AFTER INSERT ON property_favorites
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_favorites_count();

CREATE TRIGGER update_favorites_count_delete
    AFTER DELETE ON property_favorites
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_favorites_count();

-- Auto-generate tasks
CREATE TRIGGER auto_generate_tasks_on_property_created
    AFTER INSERT ON properties
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_generate_tasks('property_created');

CREATE TRIGGER auto_generate_tasks_on_contact_created
    AFTER INSERT ON contacts
    FOR EACH ROW
    EXECUTE FUNCTION trigger_auto_generate_tasks('contact_created');

-- Update contact last contact
CREATE TRIGGER update_contact_last_contact
    AFTER INSERT ON contact_interactions
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_contact_last_contact();

-- =============================================
-- COMMENTS
-- =============================================

COMMENT ON FUNCTION calculate_property_health_score IS 'Calculates 0-100 health score based on property completeness';
COMMENT ON FUNCTION trigger_set_updated_at IS 'Auto-updates updated_at timestamp';
COMMENT ON FUNCTION trigger_auto_generate_tasks IS 'Auto-generates tasks based on predefined rules';
