CREATE TABLE IF NOT EXISTS resources (
  id              UUID             NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID             NOT NULL REFERENCES user_accounts(id) ON DELETE CASCADE,
  filename        TEXT             NOT NULL,
  file_path       TEXT             NOT NULL,
  file_size_bytes INTEGER          NOT NULL,
  mime_type       TEXT             NOT NULL DEFAULT 'image/jpeg',
  image_type      TEXT             NOT NULL DEFAULT 'uploaded' CHECK (image_type IN ('uploaded', 'generated')),
  created_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ      NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_resources_user_id ON resources(user_id);
CREATE INDEX IF NOT EXISTS idx_resources_image_type ON resources(image_type);