CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE user_account (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE,
  display_name text NOT NULL,
  password_hash text,
  mfa_enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE family (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  retention_policy text NOT NULL DEFAULT 'standard',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE family_membership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_account(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('owner', 'admin', 'archivist', 'contributor', 'viewer', 'guest')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('invited', 'active', 'suspended', 'removed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (family_id, user_id)
);

CREATE TABLE person (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  display_name text NOT NULL,
  birth_date date,
  death_date date,
  is_living boolean NOT NULL DEFAULT true,
  visibility text NOT NULL DEFAULT 'family' CHECK (visibility IN ('family', 'restricted', 'private')),
  biography text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE life_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  person_id uuid REFERENCES person(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  title text NOT NULL,
  event_date date,
  location_text text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE relationship_edge_shadow (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  from_person_id uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  to_person_id uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  relationship_kind text NOT NULL,
  confidence numeric(4, 3) NOT NULL DEFAULT 1,
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (from_person_id <> to_person_id)
);

CREATE TABLE media_asset (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  media_type text NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document', 'other')),
  canonical_sha256 text,
  storage_uri text NOT NULL,
  immich_asset_id text,
  byte_size bigint NOT NULL DEFAULT 0,
  captured_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz,
  UNIQUE (family_id, canonical_sha256)
);

CREATE TABLE media_instance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id uuid NOT NULL REFERENCES media_asset(id) ON DELETE CASCADE,
  uploaded_by_user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  source_app text NOT NULL,
  original_filename text NOT NULL,
  imported_from text,
  external_source_id text,
  exif jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE media_fingerprint (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  media_asset_id uuid NOT NULL REFERENCES media_asset(id) ON DELETE CASCADE,
  algorithm text NOT NULL,
  value text NOT NULL,
  confidence numeric(4, 3),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (algorithm, value)
);

CREATE TABLE person_media_link (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  person_id uuid NOT NULL REFERENCES person(id) ON DELETE CASCADE,
  media_asset_id uuid NOT NULL REFERENCES media_asset(id) ON DELETE CASCADE,
  link_type text NOT NULL DEFAULT 'appears_in',
  confidence numeric(4, 3) NOT NULL DEFAULT 1,
  confirmed_by_user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (person_id, media_asset_id, link_type)
);

CREATE TABLE deduplication_candidate (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES family(id) ON DELETE CASCADE,
  candidate_media_asset_id uuid NOT NULL REFERENCES media_asset(id) ON DELETE CASCADE,
  existing_media_asset_id uuid NOT NULL REFERENCES media_asset(id) ON DELETE CASCADE,
  score numeric(4, 3) NOT NULL,
  decision text NOT NULL DEFAULT 'needs_review' CHECK (decision IN ('auto_linked', 'needs_review', 'distinct', 'rejected')),
  signals jsonb NOT NULL DEFAULT '[]'::jsonb,
  reviewed_by_user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (candidate_media_asset_id <> existing_media_asset_id)
);

CREATE TABLE audit_event (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid REFERENCES family(id) ON DELETE SET NULL,
  actor_user_id uuid REFERENCES user_account(id) ON DELETE SET NULL,
  action text NOT NULL,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_person_family_id ON person(family_id);
CREATE INDEX idx_life_event_family_date ON life_event(family_id, event_date);
CREATE INDEX idx_media_asset_family_captured ON media_asset(family_id, captured_at);
CREATE INDEX idx_media_instance_asset ON media_instance(media_asset_id);
CREATE INDEX idx_audit_event_family_created ON audit_event(family_id, created_at);
