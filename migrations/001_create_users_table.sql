DO $$ BEGIN
  CREATE TYPE application_role AS ENUM ('admin', 'editor', 'viewer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS user_accounts (
  id              UUID             NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email_address   TEXT             NOT NULL UNIQUE,
  hashed_password TEXT             NOT NULL,
  assigned_role   application_role NOT NULL DEFAULT 'viewer',
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

-- Auto-update updated_at on any UPDATE
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_accounts_set_updated_at
  BEFORE UPDATE ON user_accounts
  FOR EACH ROW
  EXECUTE FUNCTION set_updated_at();