CREATE TABLE IF NOT EXISTS resources (
  id              SERIAL PRIMARY KEY,
  user_id         INTEGER          NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  filename        TEXT             NOT NULL,
  file_path       TEXT             NOT NULL,
  file_size_bytes INTEGER          NOT NULL,
  mime_type       TEXT             NOT NULL DEFAULT 'image/jpeg',
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_resources_user_id ON resources(user_id);
