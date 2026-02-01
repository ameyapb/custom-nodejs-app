CREATE TYPE application_role AS ENUM ('admin', 'editor', 'viewer');

CREATE TABLE IF NOT EXISTS user_accounts (
  id              SERIAL PRIMARY KEY,
  email_address   TEXT             NOT NULL UNIQUE,
  hashed_password TEXT             NOT NULL,
  assigned_role   application_role NOT NULL DEFAULT 'viewer',
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);