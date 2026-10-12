CREATE EXTENSION IF NOT EXISTS "pgcrypto";



CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  budget NUMERIC(12, 2) NOT NULL,
  location TEXT NOT NULL,
  property_type TEXT NOT NULL,
  source TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT leads_budget_non_negative CHECK (budget >= 0),
  CONSTRAINT leads_status_allowed CHECK (
    status IN ('New', 'Contacted', 'Site Visit', 'Closed')
  )
);

CREATE TABLE IF NOT EXISTS lead_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leads_name_lower ON leads (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads (phone);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_budget ON leads (budget);
CREATE INDEX IF NOT EXISTS idx_lead_notes_lead_id ON lead_notes (lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_notes_created_at ON lead_notes (created_at);

CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role_id UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users (role_id);

INSERT INTO roles (name)
VALUES ('admin'), ('CRM')
ON CONFLICT (name) DO NOTHING;

CREATE OR REPLACE FUNCTION get_all_leads(
  p_search TEXT DEFAULT NULL,
  p_source TEXT DEFAULT NULL,
  p_status TEXT DEFAULT NULL,
  p_sort_by TEXT DEFAULT 'created_at',
  p_sort_order TEXT DEFAULT 'desc'
)
RETURNS SETOF leads
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM leads
  WHERE
    (
      p_search IS NULL
      OR LOWER(name) LIKE '%' || LOWER(p_search) || '%'
      OR phone LIKE '%' || p_search || '%'
    )
    AND (p_source IS NULL OR source = p_source)
    AND (p_status IS NULL OR status = p_status)
  ORDER BY
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'asc' THEN created_at END ASC,
    CASE WHEN p_sort_by = 'created_at' AND p_sort_order = 'desc' THEN created_at END DESC,
    CASE WHEN p_sort_by = 'budget' AND p_sort_order = 'asc' THEN budget END ASC,
    CASE WHEN p_sort_by = 'budget' AND p_sort_order = 'desc' THEN budget END DESC;
$$;

CREATE OR REPLACE FUNCTION get_lead_by_id(p_lead_id UUID)
RETURNS SETOF leads
LANGUAGE sql
STABLE
AS $$
  SELECT *
  FROM leads
  WHERE id = p_lead_id;
$$;
