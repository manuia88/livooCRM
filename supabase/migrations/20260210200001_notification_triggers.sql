-- TRIGGER 1: Notificar cuando se asigna una tarea
CREATE OR REPLACE FUNCTION notify_task_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_agency_id UUID;
  v_assigner_name TEXT;
BEGIN
  -- Solo si hay assigned_to y es un INSERT (nueva tarea) o UPDATE (cambio de asignación)
  IF NEW.assigned_to IS NULL THEN
    RETURN NEW;
  END IF;

  -- Si es UPDATE, verificar que assigned_to haya cambiado
  IF TG_OP = 'UPDATE' AND OLD.assigned_to IS NOT DISTINCT FROM NEW.assigned_to THEN
    RETURN NEW;
  END IF;

  -- Obtener agency_id
  SELECT agency_id INTO v_agency_id
  FROM user_profiles
  WHERE id = NEW.assigned_to;

  -- Obtener nombre del asignador (si existe created_by)
  -- Si no hay created_by (o es system), poner 'Sistema'
  IF NEW.created_by IS NOT NULL THEN
    SELECT first_name || ' ' || last_name INTO v_assigner_name
    FROM user_profiles
    WHERE id = NEW.created_by;
  ELSE
    v_assigner_name := 'Sistema';
  END IF;
  
  IF v_assigner_name IS NULL THEN v_assigner_name := 'Un usuario'; END IF;

  -- Crear notificación
  PERFORM create_notification(
    p_user_id := NEW.assigned_to,
    p_agency_id := v_agency_id,
    p_type := 'task_assigned',
    p_title := 'Nueva tarea asignada',
    p_message := v_assigner_name || ' te asignó: ' || NEW.title,
    p_link_url := '/backoffice/tareas/' || NEW.id,
    p_related_entity_type := 'task',
    p_related_entity_id := NEW.id,
    p_priority := CASE 
      WHEN NEW.priority = 'urgente' THEN 'urgent'
      WHEN NEW.priority = 'alta' THEN 'high'
      ELSE 'normal'
    END,
    p_icon := '📋'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS task_assigned_notification ON tasks;
CREATE TRIGGER task_assigned_notification
AFTER INSERT OR UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION notify_task_assigned();

-- TRIGGER 2: Notificar cuando se asigna un lead
CREATE OR REPLACE FUNCTION notify_contact_assigned()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_agency_id UUID;
BEGIN
  IF NEW.assigned_to IS NULL OR (TG_OP = 'UPDATE' AND OLD.assigned_to = NEW.assigned_to) THEN
    RETURN NEW;
  END IF;

  SELECT agency_id INTO v_agency_id
  FROM user_profiles
  WHERE id = NEW.assigned_to;

  PERFORM create_notification(
    p_user_id := NEW.assigned_to,
    p_agency_id := v_agency_id,
    p_type := 'new_lead',
    p_title := 'Nuevo lead asignado',
    p_message := COALESCE(NEW.first_name, '') || ' ' || COALESCE(NEW.last_name, '') || ' - ' || COALESCE(NEW.current_stage, 'Nuevo'),
    p_link_url := '/backoffice/contactos/' || NEW.id,
    p_related_entity_type := 'contact',
    p_related_entity_id := NEW.id,
    p_priority := CASE 
      WHEN NEW.lead_score >= 80 THEN 'high'
      ELSE 'normal'
    END,
    p_icon := '👤'
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS contact_assigned_notification ON contacts;
CREATE TRIGGER contact_assigned_notification
AFTER INSERT OR UPDATE ON contacts
FOR EACH ROW
EXECUTE FUNCTION notify_contact_assigned();

-- TRIGGER 3: Notificar cuando una propiedad cambia de estado
CREATE OR REPLACE FUNCTION notify_property_status_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user RECORD;
BEGIN
  IF OLD.status IS NOT DISTINCT FROM NEW.status THEN
    RETURN NEW;
  END IF;

  -- Notificar al productor y asignado
  FOR v_user IN
    SELECT DISTINCT up.id, up.agency_id
    FROM user_profiles up
    WHERE up.id IN (NEW.producer_id, NEW.assigned_to)
      AND up.id IS NOT NULL
  LOOP
    PERFORM create_notification(
      p_user_id := v_user.id,
      p_agency_id := v_user.agency_id,
      p_type := 'property_update',
      p_title := 'Propiedad actualizada',
      p_message := 'Estado cambió a: ' || NEW.status,
      p_link_url := '/backoffice/propiedades/' || NEW.id,
      p_related_entity_type := 'property',
      p_related_entity_id := NEW.id,
      p_priority := CASE 
        WHEN NEW.status = 'vendida' THEN 'high'
        WHEN NEW.status = 'rentada' THEN 'high'
        ELSE 'normal'
      END,
      p_icon := '🏠'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS property_status_change_notification ON properties;
CREATE TRIGGER property_status_change_notification
AFTER UPDATE ON properties
FOR EACH ROW
EXECUTE FUNCTION notify_property_status_change();


-- Edge Function placeholder
-- NOTE: We are creating a placeholder first, then we will wire it up to the API
CREATE OR REPLACE FUNCTION send_task_reminder_email(
  p_user_email TEXT,
  p_user_name TEXT,
  p_task_id UUID,
  p_task_title TEXT,
  p_task_description TEXT,
  p_due_date TEXT
)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Check if pg_net extension is available, otherwise just log or do nothing to prevent crashing
  -- For now we assume this is called manually or via cron.
  -- We will implement the actual API call logic in a separate step or improved version
  -- depending on if pg_net is enabled.
  
  -- Placeholder for now
  NULL; 
END;
$$;
