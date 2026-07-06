import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1730000000000 implements MigrationInterface {
  name = 'InitialSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user_account" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "email" text NOT NULL,
        "display_name" text NOT NULL,
        "password_hash" text NOT NULL,
        "mfa_enabled" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_user_account" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_user_account_email" UNIQUE ("email")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "family" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "slug" text NOT NULL,
        "retention_policy" text NOT NULL DEFAULT 'standard',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_family" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_family_slug" UNIQUE ("slug")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "family_membership" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "role" text NOT NULL DEFAULT 'viewer',
        "status" text NOT NULL DEFAULT 'active',
        CONSTRAINT "PK_family_membership" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_family_membership_family_user" UNIQUE ("family_id", "user_id"),
        CONSTRAINT "FK_family_membership_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_family_membership_user" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "person" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "visibility" text NOT NULL DEFAULT 'family',
        "birth_date" date,
        "death_date" date,
        "biography" text,
        "is_living" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_person" PRIMARY KEY ("id"),
        CONSTRAINT "FK_person_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "person_name" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "person_id" uuid NOT NULL,
        "given_name" text,
        "family_name" text,
        "full_name" text NOT NULL,
        "is_primary" boolean NOT NULL DEFAULT true,
        CONSTRAINT "PK_person_name" PRIMARY KEY ("id"),
        CONSTRAINT "FK_person_name_person" FOREIGN KEY ("person_id") REFERENCES "person"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "media_asset" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "canonical_sha256" text NOT NULL,
        "media_type" text NOT NULL,
        "byte_size" bigint NOT NULL,
        "storage_uri" text NOT NULL,
        "immich_asset_id" text,
        "captured_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_asset" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_media_asset_canonical_sha256" UNIQUE ("canonical_sha256"),
        CONSTRAINT "FK_media_asset_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "media_instance" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "media_asset_id" uuid NOT NULL,
        "uploaded_by_user_id" uuid,
        "source_app" text NOT NULL,
        "original_filename" text NOT NULL,
        "exif" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_media_instance" PRIMARY KEY ("id"),
        CONSTRAINT "FK_media_instance_media_asset" FOREIGN KEY ("media_asset_id") REFERENCES "media_asset"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_media_instance_user" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "user_account"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "audit_event" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "actor_user_id" uuid,
        "action" text NOT NULL,
        "resource_type" text NOT NULL,
        "resource_id" text,
        "metadata" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_event" PRIMARY KEY ("id"),
        CONSTRAINT "FK_audit_event_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_audit_event_user" FOREIGN KEY ("actor_user_id") REFERENCES "user_account"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_family_membership_family_id" ON "family_membership" ("family_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_family_membership_user_id" ON "family_membership" ("user_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_person_family_id" ON "person" ("family_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_person_name_person_id" ON "person_name" ("person_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_asset_family_id" ON "media_asset" ("family_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_asset_immich_asset_id" ON "media_asset" ("immich_asset_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_media_instance_media_asset_id" ON "media_instance" ("media_asset_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_event_family_id" ON "audit_event" ("family_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_event_created_at" ON "audit_event" ("created_at")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_event"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media_instance"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media_asset"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "person_name"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "person"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "family_membership"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "family"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_account"`);
  }
}
