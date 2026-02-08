-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  agency_id UUID NOT NULL REFERENCES agencies(id) ON DELETE CASCADE,
  
  -- Contenido
  type TEXT NOT NULL, -- 'task_due', 'new_lead', 'property_update', 'mention', 'reminder'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Contexto (para hacer click y navegar)
  link_url TEXT, -- Ej: /backoffice/tareas/123
  related_entity_type TEXT, -- 'task', 'contact', 'property'
  related_entity_id UUID,
  
  -- Estado
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Metadata
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  icon TEXT, -- Emoji o icon name
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread 
ON notifications(user_id, is_read, created_at DESC)
WHERE is_read = FALSE;

CREATE INDEX IF NOT EXISTS idx_notifications_user_all 
ON notifications(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_agency 
ON notifications(agency_id, created_at DESC);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop policies if they exist to avoid errors on re-run
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can delete their own notifications" ON notifications;

CREATE POLICY "Users can view their own notifications"
ON notifications FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "System can insert notifications"
ON notifications FOR INSERT
WITH CHECK (true); -- Permitir inserts desde triggers

CREATE POLICY "Users can update their own notifications"
ON notifications FOR UPDATE
USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own notifications"
ON notifications FOR DELETE
USING (user_id = auth.uid());

-- Enable Realtime
-- Check if publication exists before adding table (or just add and ignore error if already added)
-- In postgres, adding a table to publication that is already there doesn't fail, but 'ALTER PUBLICATION ... ADD TABLE' might if the table is already there?
-- Actually, it's safer to just run it. If it fails due to being already in, we can ignore or wrap in DO block.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname = 'supabase_realtime' AND tablename = 'notifications') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
  END IF;
END
$$;

-- Función helper para crear notificaciones
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_agency_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link_url TEXT DEFAULT NULL,
  p_related_entity_type TEXT DEFAULT NULL,
  p_related_entity_id UUID DEFAULT NULL,
  p_priority TEXT DEFAULT 'normal',
  p_icon TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id, agency_id, type, title, message,
    link_url, related_entity_type, related_entity_id,
    priority, icon
  ) VALUES (
    p_user_id, p_agency_id, p_type, p_title, p_message,
    p_link_url, p_related_entity_type, p_related_entity_id,
    p_priority, p_icon
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;
