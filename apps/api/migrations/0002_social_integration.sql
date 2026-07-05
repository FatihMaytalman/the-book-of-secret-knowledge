CREATE TABLE social_connection (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
  provider text NOT NULL,
  external_account_id text,
  granted_scopes text[] NOT NULL DEFAULT ARRAY[]::text[],
  encrypted_access_token text,
  encrypted_refresh_token text,
  token_expires_at timestamptz,
  sync_mode text NOT NULL DEFAULT 'manual' CHECK (sync_mode IN ('manual', 'daily', 'weekly', 'paused')),
  last_sync_cursor text,
  last_synced_at timestamptz,
  disconnected_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id, provider, external_account_id)
);

CREATE TABLE social_import_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  social_connection_id uuid REFERENCES social_connection(id) ON DELETE SET NULL,
  provider text NOT NULL,
  external_id text NOT NULL,
  source_url text,
  imported_media_asset_id uuid REFERENCES media_asset(id) ON DELETE SET NULL,
  raw_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  review_status text NOT NULL DEFAULT 'pending' CHECK (review_status IN ('pending', 'accepted', 'rejected', 'deleted')),
  imported_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, provider, external_id)
);

CREATE TABLE activity_feed_item (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  media_asset_id uuid REFERENCES media_asset(id) ON DELETE SET NULL,
  life_event_id uuid REFERENCES life_event(id) ON DELETE SET NULL,
  feed_type text NOT NULL CHECK (feed_type IN ('post', 'story', 'milestone', 'memory_resurface', 'review_request')),
  body text,
  visibility text NOT NULL DEFAULT 'family' CHECK (visibility IN ('family', 'restricted', 'private')),
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz
);

CREATE TABLE feed_reaction (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id uuid NOT NULL REFERENCES activity_feed_item(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
  reaction text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (feed_item_id, user_id, reaction)
);

CREATE TABLE feed_comment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feed_item_id uuid NOT NULL REFERENCES activity_feed_item(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  edited_at timestamptz,
  deleted_at timestamptz
);

CREATE TABLE social_publish_record (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  actor_user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  feed_item_id uuid REFERENCES activity_feed_item(id) ON DELETE SET NULL,
  media_asset_id uuid REFERENCES media_asset(id) ON DELETE SET NULL,
  provider text NOT NULL,
  audience text NOT NULL,
  provider_response_id text,
  content_sha256 text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'published', 'failed', 'revoked')),
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_social_connection_family ON social_connection(family_id, provider);
CREATE INDEX idx_social_import_review ON social_import_item(family_id, review_status, imported_at);
CREATE INDEX idx_activity_feed_family_created ON activity_feed_item(family_id, created_at);
CREATE INDEX idx_social_publish_family_created ON social_publish_record(family_id, created_at);
