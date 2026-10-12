-- Application database API. Run after schema.sql; safe to reapply.
-- Business queries live here. Node only invokes these parameterized routines.

CREATE OR REPLACE FUNCTION crm_health() RETURNS timestamptz
LANGUAGE sql STABLE AS $$ SELECT NOW(); $$;

CREATE OR REPLACE FUNCTION crm_create_lead(
  p_name text, p_phone text, p_email text, p_budget numeric, p_location text,
  p_property_type text, p_source text, p_status text
) RETURNS SETOF leads LANGUAGE sql AS $$
  INSERT INTO leads (name, phone, email, budget, location, property_type, source, status)
  VALUES (p_name, p_phone, p_email, p_budget, p_location, p_property_type, p_source, p_status)
  RETURNING *;
$$;

CREATE OR REPLACE FUNCTION crm_get_lead(p_id uuid) RETURNS SETOF leads
LANGUAGE sql STABLE AS $$ SELECT * FROM leads WHERE id = p_id; $$;

CREATE OR REPLACE FUNCTION crm_update_lead(
  p_id uuid, p_name text, p_phone text, p_email text, p_budget numeric,
  p_location text, p_property_type text, p_source text, p_status text
) RETURNS SETOF leads LANGUAGE sql AS $$
  UPDATE leads SET name = p_name, phone = p_phone, email = p_email, budget = p_budget,
    location = p_location, property_type = p_property_type, source = p_source,
    status = p_status, updated_at = NOW()
  WHERE id = p_id RETURNING *;
$$;

CREATE OR REPLACE FUNCTION crm_update_lead_status(p_id uuid, p_status text)
RETURNS SETOF leads LANGUAGE sql AS $$
  UPDATE leads SET status = p_status, updated_at = NOW() WHERE id = p_id RETURNING *;
$$;

CREATE OR REPLACE FUNCTION crm_delete_lead(p_id uuid) RETURNS SETOF leads
LANGUAGE sql AS $$ DELETE FROM leads WHERE id = p_id RETURNING *; $$;

CREATE OR REPLACE FUNCTION crm_add_note(p_lead_id uuid, p_note text)
RETURNS SETOF lead_notes LANGUAGE sql AS $$
  INSERT INTO lead_notes (lead_id, note) VALUES (p_lead_id, p_note) RETURNING *;
$$;

CREATE OR REPLACE FUNCTION crm_list_notes(p_lead_id uuid) RETURNS SETOF lead_notes
LANGUAGE sql STABLE AS $$
  SELECT * FROM lead_notes WHERE lead_id = p_lead_id ORDER BY created_at DESC, id DESC;
$$;

CREATE OR REPLACE FUNCTION crm_list_leads(
  p_search text DEFAULT NULL, p_source text DEFAULT NULL, p_status text DEFAULT NULL,
  p_sort_by text DEFAULT 'created_at', p_sort_order text DEFAULT 'desc',
  p_page integer DEFAULT 1, p_page_size integer DEFAULT 10
) RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  v_total bigint;
  v_page integer;
  v_pages integer;
  v_data jsonb;
BEGIN
  IF p_page IS NULL OR p_page < 1 OR p_page_size IS NULL OR p_page_size < 1 OR p_page_size > 100 THEN
    RAISE EXCEPTION 'Invalid pagination' USING ERRCODE = '22023';
  END IF;
  IF p_sort_by NOT IN ('created_at', 'budget') OR p_sort_order NOT IN ('asc', 'desc') THEN
    RAISE EXCEPTION 'Invalid sort' USING ERRCODE = '22023';
  END IF;
  SELECT COUNT(*) INTO v_total FROM leads
  WHERE (p_search IS NULL OR name ILIKE '%' || p_search || '%' OR phone LIKE '%' || p_search || '%')
    AND (p_source IS NULL OR source = p_source) AND (p_status IS NULL OR status = p_status);
  v_pages := GREATEST(1, CEIL(v_total::numeric / p_page_size)::integer);
  v_page := LEAST(p_page, v_pages);
  SELECT COALESCE(jsonb_agg(to_jsonb(page_rows) ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN created_at END DESC,
    CASE WHEN p_sort_by = 'budget' AND p_sort_order = 'asc' THEN budget END ASC,
    CASE WHEN p_sort_by = 'budget' AND p_sort_order = 'desc' THEN budget END DESC,
    id DESC), '[]'::jsonb) INTO v_data
  FROM (
    SELECT * FROM leads
    WHERE (p_search IS NULL OR name ILIKE '%' || p_search || '%' OR phone LIKE '%' || p_search || '%')
      AND (p_source IS NULL OR source = p_source) AND (p_status IS NULL OR status = p_status)
    ORDER BY
      CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN created_at END ASC,
      CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN created_at END DESC,
      CASE WHEN p_sort_by = 'budget' AND p_sort_order = 'asc' THEN budget END ASC,
      CASE WHEN p_sort_by = 'budget' AND p_sort_order = 'desc' THEN budget END DESC,
      id DESC
    LIMIT p_page_size OFFSET (v_page::bigint - 1) * p_page_size
  ) page_rows;
  RETURN jsonb_build_object('data', v_data, 'pagination', jsonb_build_object(
    'page', v_page, 'pageSize', p_page_size, 'total', v_total, 'totalPages', v_pages));
END;
$$;

CREATE OR REPLACE FUNCTION crm_dashboard(p_page integer DEFAULT 1, p_page_size integer DEFAULT 10)
RETURNS jsonb LANGUAGE sql STABLE AS $$
  WITH summary AS (
    SELECT COUNT(*) AS total, COUNT(*) FILTER (WHERE status = 'Closed') AS closed,
      COALESCE(SUM(budget), 0) AS total_budget, COALESCE(AVG(budget), 0) AS average_budget
    FROM leads
  ), sources AS (
    SELECT source, COUNT(*) AS count FROM leads GROUP BY source
  ), statuses AS (
    SELECT status, COUNT(*) AS count FROM leads GROUP BY status
  ), paged AS (
    SELECT crm_list_leads(NULL, NULL, NULL, 'created_at', 'desc', p_page, p_page_size) AS result
  )
  SELECT jsonb_build_object(
    'totalLeads', summary.total, 'closedLeads', summary.closed,
    'conversionRate', CASE WHEN summary.total = 0 THEN 0 ELSE ROUND(summary.closed * 100.0 / summary.total, 2) END,
    'totalBudget', summary.total_budget, 'averageBudget', ROUND(summary.average_budget, 2),
    'leadsBySource', COALESCE((SELECT jsonb_agg(to_jsonb(sources) ORDER BY count DESC, source) FROM sources), '[]'::jsonb),
    'statusDistribution', COALESCE((SELECT jsonb_agg(to_jsonb(statuses) ORDER BY count DESC, status) FROM statuses), '[]'::jsonb),
    'recentLeads', paged.result->'data', 'pagination', paged.result->'pagination'
  ) FROM summary CROSS JOIN paged;
$$;

CREATE OR REPLACE FUNCTION crm_auth_user(p_email text)
RETURNS TABLE(id uuid, name text, email text, password_hash text, role text)
LANGUAGE sql STABLE AS $$
  SELECT u.id, u.name, u.email, u.password_hash, r.name FROM users u
  JOIN roles r ON r.id = u.role_id WHERE LOWER(u.email) = LOWER(p_email);
$$;

CREATE OR REPLACE FUNCTION crm_get_user(p_id uuid)
RETURNS TABLE(id uuid, name text, email text, role text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE AS $$
  SELECT u.id, u.name, u.email, r.name, u.created_at, u.updated_at FROM users u
  JOIN roles r ON r.id = u.role_id WHERE u.id = p_id;
$$;

CREATE OR REPLACE FUNCTION crm_list_users()
RETURNS TABLE(id uuid, name text, email text, role text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql STABLE AS $$
  SELECT u.id, u.name, u.email, r.name, u.created_at, u.updated_at FROM users u
  JOIN roles r ON r.id = u.role_id ORDER BY u.created_at DESC, u.id DESC;
$$;

CREATE OR REPLACE FUNCTION crm_find_user(p_email text) RETURNS TABLE(id uuid)
LANGUAGE sql STABLE AS $$ SELECT id FROM users WHERE LOWER(email) = LOWER(p_email); $$;

CREATE OR REPLACE FUNCTION crm_list_roles() RETURNS TABLE(id uuid, name text)
LANGUAGE sql STABLE AS $$ SELECT id, name FROM roles ORDER BY name; $$;

CREATE OR REPLACE FUNCTION crm_get_role(p_id uuid) RETURNS TABLE(id uuid, name text)
LANGUAGE sql STABLE AS $$ SELECT id, name FROM roles WHERE id = p_id; $$;

CREATE OR REPLACE FUNCTION crm_create_user(p_name text, p_email text, p_hash text, p_role_id uuid)
RETURNS TABLE(id uuid, name text, email text, role_id uuid, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql AS $$
  INSERT INTO users (name, email, password_hash, role_id) VALUES (p_name, p_email, p_hash, p_role_id)
  RETURNING id, name, email, role_id, created_at, updated_at;
$$;

CREATE OR REPLACE FUNCTION crm_update_password(p_id uuid, p_hash text) RETURNS void
LANGUAGE sql AS $$ UPDATE users SET password_hash = p_hash WHERE id = p_id; $$;

CREATE OR REPLACE FUNCTION crm_seed_user(p_name text, p_email text, p_hash text, p_role text)
RETURNS TABLE(id uuid) LANGUAGE sql AS $$
  INSERT INTO users (name, email, password_hash, role_id)
  SELECT p_name, LOWER(p_email), p_hash, roles.id FROM roles WHERE name = p_role
  ON CONFLICT (email) DO NOTHING RETURNING id;
$$;
