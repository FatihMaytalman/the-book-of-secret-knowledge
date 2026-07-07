import type { MigrationInterface, QueryRunner } from 'typeorm';

export class ImmichSyncAndDedup1730000002000 implements MigrationInterface {
  name = 'ImmichSyncAndDedup1730000002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "media_instance"
      ADD COLUMN IF NOT EXISTS "immich_asset_id" text
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_media_instance_immich_asset_id"
      ON "media_instance" ("immich_asset_id")
      WHERE "immich_asset_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "deduplication_candidate" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "candidate_media_asset_id" uuid NOT NULL,
        "existing_media_asset_id" uuid NOT NULL,
        "score" numeric(4, 3) NOT NULL,
        "decision" text NOT NULL DEFAULT 'needs_review',
        "signals" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_deduplication_candidate" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dedup_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dedup_candidate_asset" FOREIGN KEY ("candidate_media_asset_id") REFERENCES "media_asset"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_dedup_existing_asset" FOREIGN KEY ("existing_media_asset_id") REFERENCES "media_asset"("id") ON DELETE CASCADE,
        CONSTRAINT "CHK_dedup_distinct_assets" CHECK ("candidate_media_asset_id" <> "existing_media_asset_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_dedup_family_created"
      ON "deduplication_candidate" ("family_id", "created_at")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "immich_sync_state" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "last_synced_at" TIMESTAMPTZ,
        "last_immich_updated_at" TIMESTAMPTZ,
        "last_sync_summary" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_immich_sync_state" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_immich_sync_state_family" UNIQUE ("family_id"),
        CONSTRAINT "FK_immich_sync_state_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "immich_sync_state"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "deduplication_candidate"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_media_instance_immich_asset_id"`);
    await queryRunner.query(`ALTER TABLE "media_instance" DROP COLUMN IF EXISTS "immich_asset_id"`);
  }
}
