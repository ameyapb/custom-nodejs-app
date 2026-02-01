-- Drop old type from public schema if it exists (one-time cleanup)
DROP TYPE IF EXISTS public.application_role CASCADE;

-- Create type in current schema
DO $$ BEGIN
  CREATE TYPE application_role AS ENUM ('admin', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_accounts (
  id              SERIAL PRIMARY KEY,
  email_address   TEXT             NOT NULL UNIQUE,
  hashed_password TEXT             NOT NULL,
  assigned_role   application_role NOT NULL DEFAULT 'viewer',
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);