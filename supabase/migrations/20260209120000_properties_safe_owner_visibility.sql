-- Datos del propietario: solo visibles para el productor o admin/manager de la inmobiliaria.
-- No para red, otros agentes de la agencia ni MLS.
-- Recreamos properties_safe sin exponer owner_* en claro; usamos expresión que devuelve NULL
-- cuando el usuario no es productor ni admin/manager de la agencia.

DROP VIEW IF EXISTS properties_safe;

DO $$
DECLARE
  v_select_list TEXT := '';
  v_where_clause TEXT := '';
  v_can_see_owner TEXT := $$(
    (p.producer_id = auth.uid())
    OR (
      p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())
      AND (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'manager')
    )
  )$$;
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'id') THEN
    v_select_list := 'p.id';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'agency_id') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.agency_id';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'producer_id') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.producer_id';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'title') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.title';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'description') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.description';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'property_type') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.property_type';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'operation_type') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.operation_type';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'created_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.created_at';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'updated_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.updated_at';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'deleted_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.deleted_at';
    v_where_clause := 'WHERE p.deleted_at IS NULL';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'address') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.address';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'street') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.street';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'neighborhood') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.neighborhood';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'city') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.city';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'state') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.state';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'postal_code') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.postal_code';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'country') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.country';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bedrooms') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.bedrooms';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'bathrooms') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.bathrooms';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'half_bathrooms') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.half_bathrooms';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'parking_spaces') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.parking_spaces';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'sale_price') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.sale_price';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'rent_price') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.rent_price';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'currency') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.currency';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'maintenance_fee') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.maintenance_fee';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'status') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.status';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'health_score') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.health_score';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'views_count') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.views_count';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'favorites_count') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.favorites_count';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'inquiries_count') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.inquiries_count';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'is_exclusive') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.is_exclusive';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'commission_percentage') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.commission_percentage';
  END IF;

  IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
  v_select_list := v_select_list || 'p.documentation_status, p.documents, p.main_image_url, p.commission_notes';
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'published_at') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.published_at, (p.published_at IS NOT NULL) AS published';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'mls_shared') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.mls_shared';
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'properties' AND column_name = 'price') THEN
    IF v_select_list != '' THEN v_select_list := v_select_list || ', '; END IF;
    v_select_list := v_select_list || 'p.price';
  END IF;

  -- Owner: solo productor o admin/manager de la agencia (no red, otros agentes ni MLS)
  v_select_list := v_select_list || ', CASE WHEN ' || v_can_see_owner || ' THEN p.owner_name ELSE NULL END AS owner_name';
  v_select_list := v_select_list || ', CASE WHEN ' || v_can_see_owner || ' THEN p.owner_phone ELSE NULL END AS owner_phone';
  v_select_list := v_select_list || ', CASE WHEN ' || v_can_see_owner || ' THEN p.owner_email ELSE NULL END AS owner_email';
  v_select_list := v_select_list || ', CASE WHEN ' || v_can_see_owner || ' THEN p.owner_notes ELSE NULL END AS owner_notes';

  v_select_list := v_select_list || ', (p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid())) AS is_my_agency';
  v_select_list := v_select_list || ', (p.producer_id = auth.uid()) AS is_mine';
  v_select_list := v_select_list || ', CASE WHEN p.producer_id = auth.uid() THEN ''own'' WHEN p.agency_id = (SELECT agency_id FROM user_profiles WHERE id = auth.uid()) THEN ''agency'' ELSE ''network'' END AS source';

  IF v_where_clause = '' THEN
    v_where_clause := '';
  END IF;
  EXECUTE format('CREATE VIEW properties_safe AS SELECT %s FROM properties p %s', v_select_list, v_where_clause);
END $$;

GRANT SELECT ON properties_safe TO authenticated;
COMMENT ON VIEW properties_safe IS 'Owner data only for producer or agency admin/manager; hidden for network, other agents, MLS';
