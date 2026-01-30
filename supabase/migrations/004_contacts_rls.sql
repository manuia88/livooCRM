-- Enable RLS
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- Policy: View - Users see contacts within their agency
CREATE POLICY "Users view contacts in their agency"
ON contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = contacts.agency_id
  )
);

-- Policy: Insert - Auto-assign agency
CREATE OR REPLACE FUNCTION set_contact_agency_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT agency_id INTO NEW.agency_id
  FROM user_profiles
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_contact_agency_id_trigger
BEFORE INSERT ON contacts
FOR EACH ROW
EXECUTE FUNCTION set_contact_agency_id();

CREATE POLICY "Users can create contacts"
ON contacts FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

-- Policy: Update
-- Agents can update contacts they created or are assigned to
-- Managers/Admins can update any contact in agency
CREATE POLICY "Users can update relevant contacts"
ON contacts FOR UPDATE
USING (
  (created_by = auth.uid()) OR
  (assigned_to = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = contacts.agency_id
    AND user_profiles.role IN ('admin', 'manager')
  )
);

-- Policy: Delete - Only Admins/Managers
CREATE POLICY "Admins can delete contacts"
ON contacts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = contacts.agency_id
    AND user_profiles.role IN ('admin', 'manager')
  )
);
