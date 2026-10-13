-- Application database API. Run after schema.sql; safe to reapply.
-- Business queries live here. Node only invokes these parameterized routines.

-- Shared HTTP success envelope. Domain JSON remains owned by PostgreSQL.
CREATE OR REPLACE FUNCTION crm_response(p_result jsonb, p_status integer DEFAULT 200)
RETURNS jsonb LANGUAGE sql IMMUTABLE STRICT AS $$
  SELECT jsonb_build_object(
    'ok', true, 'statusCode', p_status,
    'message', p_result->>'message',
    'data', CASE WHEN jsonb_typeof(p_result->'data') = 'object'
      THEN (p_result->'data') - 'pagination' ELSE p_result->'data' END,
    'pagination', COALESCE(p_result->'pagination', p_result#>'{data,pagination}', 'null'::jsonb)
  );
$$;

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

CREATE OR REPLACE FUNCTION crm_update_user(p_id uuid, p_name text, p_email text, p_role_id uuid)
RETURNS TABLE(id uuid, name text, email text, role text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql AS $$
  WITH updated AS (
    UPDATE users
    SET name = p_name,
        email = LOWER(p_email),
        role_id = p_role_id,
        updated_at = NOW()
    WHERE id = p_id
    RETURNING id, name, email, role_id, created_at, updated_at
  )
  SELECT updated.id, updated.name, updated.email, roles.name, updated.created_at, updated.updated_at
  FROM updated
  JOIN roles ON roles.id = updated.role_id;
$$;

CREATE OR REPLACE FUNCTION crm_delete_user(p_id uuid)
RETURNS TABLE(id uuid, name text, email text, role text, created_at timestamptz, updated_at timestamptz)
LANGUAGE sql AS $$
  WITH deleted AS (
    DELETE FROM users
    WHERE id = p_id
    RETURNING id, name, email, role_id, created_at, updated_at
  )
  SELECT deleted.id, deleted.name, deleted.email, roles.name, deleted.created_at, deleted.updated_at
  FROM deleted
  JOIN roles ON roles.id = deleted.role_id;
$$;

CREATE OR REPLACE FUNCTION crm_update_password(p_id uuid, p_hash text) RETURNS void
LANGUAGE sql AS $$ UPDATE users SET password_hash = p_hash WHERE id = p_id; $$;

CREATE OR REPLACE FUNCTION crm_seed_user(p_name text, p_email text, p_hash text, p_role text)
RETURNS TABLE(id uuid) LANGUAGE sql AS $$
  INSERT INTO users (name, email, password_hash, role_id)
  SELECT p_name, LOWER(p_email), p_hash, roles.id FROM roles WHERE name = p_role
  ON CONFLICT (email) DO NOTHING RETURNING id;
$$;

-- JSON transport routines. NULL means a single resource was not found.
-- Public projections never include password hashes. Auth lookup is internal only.
CREATE OR REPLACE FUNCTION crm_json_create_lead(p_name text, p_phone text, p_email text, p_budget numeric, p_location text, p_property_type text, p_source text, p_status text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead created', 'data', to_jsonb(r))
  FROM crm_create_lead(p_name, p_phone, p_email, p_budget, p_location, p_property_type, p_source, p_status) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_get_lead(p_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead retrieved successfully', 'data', to_jsonb(r))
  FROM crm_get_lead(p_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_update_lead(p_id uuid, p_name text, p_phone text, p_email text, p_budget numeric, p_location text, p_property_type text, p_source text, p_status text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead updated successfully', 'data', to_jsonb(r))
  FROM crm_update_lead(p_id, p_name, p_phone, p_email, p_budget, p_location, p_property_type, p_source, p_status) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_update_lead_status(p_id uuid, p_status text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead status updated', 'data', to_jsonb(r))
  FROM crm_update_lead_status(p_id, p_status) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_delete_lead(p_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead deleted successfully', 'data', to_jsonb(r))
  FROM crm_delete_lead(p_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_add_note(p_lead_id uuid, p_note text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead note created', 'data', to_jsonb(r))
  FROM crm_add_note(p_lead_id, p_note) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_list_notes(p_lead_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Lead notes retrieved successfully', 'data', COALESCE(jsonb_agg(to_jsonb(r) ORDER BY created_at DESC, id DESC), '[]'::jsonb))
  FROM crm_list_notes(p_lead_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_get_user(p_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'User retrieved successfully', 'data', to_jsonb(r))
  FROM crm_get_user(p_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_update_user(p_id uuid, p_name text, p_email text, p_role_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'User updated successfully', 'data', to_jsonb(r))
  FROM crm_update_user(p_id, p_name, p_email, p_role_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_delete_user(p_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'User deleted successfully', 'data', to_jsonb(r))
  FROM crm_delete_user(p_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_profile(p_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Profile retrieved successfully', 'data', to_jsonb(r))
  FROM crm_get_user(p_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_list_users() RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Users retrieved successfully', 'data', COALESCE(jsonb_agg(to_jsonb(r) ORDER BY created_at DESC, id DESC), '[]'::jsonb))
  FROM crm_list_users() r;
$$;

CREATE OR REPLACE FUNCTION crm_json_list_roles() RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('message', 'Roles retrieved successfully', 'data', COALESCE(jsonb_agg(to_jsonb(r) ORDER BY name), '[]'::jsonb))
  FROM crm_list_roles() r;
$$;

CREATE OR REPLACE FUNCTION crm_json_auth_user(p_email text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT to_jsonb(r)
  FROM crm_auth_user(p_email) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_find_user(p_email text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('id', r.id)
  FROM crm_find_user(p_email) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_get_role(p_id uuid) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT to_jsonb(r)
  FROM crm_get_role(p_id) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_seed_user(p_name text, p_email text, p_hash text, p_role text) RETURNS jsonb
LANGUAGE sql AS $$
  SELECT jsonb_build_object('id', r.id)
  FROM crm_seed_user(p_name, p_email, p_hash, p_role) r;
$$;

CREATE OR REPLACE FUNCTION crm_json_list_leads(p_search text, p_source text, p_status text, p_sort_by text, p_sort_order text, p_page integer, p_page_size integer) RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object('message', 'Leads retrieved successfully') || crm_list_leads(p_search,p_source,p_status,p_sort_by,p_sort_order,p_page,p_page_size);
$$;
CREATE OR REPLACE FUNCTION crm_json_dashboard(p_page integer, p_page_size integer) RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object('message', 'Dashboard retrieved successfully', 'data', crm_dashboard(p_page,p_page_size));
$$;
CREATE OR REPLACE FUNCTION crm_json_create_user(p_name text, p_email text, p_hash text, p_role_id uuid) RETURNS jsonb LANGUAGE sql AS $$
 SELECT jsonb_build_object('message','User created successfully','data',
   (to_jsonb(u) - 'role_id') || jsonb_build_object('role',r.name))
 FROM crm_create_user(p_name,p_email,p_hash,p_role_id) u JOIN roles r ON r.id=u.role_id;
$$;
CREATE OR REPLACE FUNCTION crm_json_session(p_id uuid, p_token text, p_expires integer) RETURNS jsonb LANGUAGE sql STABLE AS $$
 SELECT jsonb_build_object('message','Login successful','data',jsonb_build_object(
   'token',p_token,'expiresIn',p_expires,'user',jsonb_build_object('id',u.id,'name',u.name,'email',u.email,'role',u.role)))
 FROM crm_get_user(p_id) u;
$$;
CREATE OR REPLACE FUNCTION crm_json_logout() RETURNS jsonb LANGUAGE sql IMMUTABLE AS $$
 SELECT jsonb_build_object('message','Logout successful','data',jsonb_build_object('loggedOut',true));
$$;
