-- Enable RLS
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Policy: Admin & Managers can view all properties in their agency
CREATE POLICY "Agency admins and managers can view all agency properties"
ON properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = properties.agency_id
    AND user_profiles.role IN ('admin', 'manager')
  )
);

-- Policy: Agents can view properties they are assigned to OR public properties in their agency
-- Note: Assuming there's an 'assigned_agent_id' or we rely on 'created_by'
-- For now, let's allow agents to view all properties in their agency to enable collaboration,
-- but strictly limit modification. If strict isolation is needed (Agent A can't see Agent B's listings),
-- we can restrict this further.
CREATE POLICY "Agents can view all agency properties"
ON properties FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = properties.agency_id
    AND user_profiles.role = 'agent'
  )
);

-- Policy: Insert - Automatically assign agency_id from profile
CREATE OR REPLACE FUNCTION set_property_agency_id()
RETURNS TRIGGER AS $$
BEGIN
  SELECT agency_id INTO NEW.agency_id
  FROM user_profiles
  WHERE id = auth.uid();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER set_property_agency_id_trigger
BEFORE INSERT ON properties
FOR EACH ROW
EXECUTE FUNCTION set_property_agency_id();

CREATE POLICY "Users can create properties in their agency"
ON properties FOR INSERT
WITH CHECK (
  auth.uid() = created_by
);

-- Policy: Update - Owners, Admins, Managers can update
CREATE POLICY "Owners and Managers can update properties"
ON properties FOR UPDATE
USING (
  (created_by = auth.uid()) OR
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = properties.agency_id
    AND user_profiles.role IN ('admin', 'manager')
  )
);

-- Policy: Delete - Only Admins and Managers
CREATE POLICY "Admins and Managers can delete properties"
ON properties FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM user_profiles
    WHERE user_profiles.id = auth.uid()
    AND user_profiles.agency_id = properties.agency_id
    AND user_profiles.role IN ('admin', 'manager')
  )
);
