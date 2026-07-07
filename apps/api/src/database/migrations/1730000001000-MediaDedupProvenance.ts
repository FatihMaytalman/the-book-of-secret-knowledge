import type { MigrationInterface, QueryRunner } from 'typeorm';

export class MediaDedupProvenance1730000001000 implements MigrationInterface {
  name = 'MediaDedupProvenance1730000001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "media_asset"
      DROP CONSTRAINT IF EXISTS "UQ_media_asset_canonical_sha256"
    `);

    await queryRunner.query(`
      ALTER TABLE "media_asset"
      ADD CONSTRAINT "UQ_media_asset_family_sha256" UNIQUE ("family_id", "canonical_sha256")
    `);

    await queryRunner.query(`
      ALTER TABLE "media_instance"
      ADD COLUMN IF NOT EXISTS "source_external_id" text
    `);

    await queryRunner.query(`
      ALTER TABLE "media_instance"
      ADD COLUMN IF NOT EXISTS "imported_from" text
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_media_instance_source"
      ON "media_instance" ("source_app", "source_external_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_media_instance_source"`);
    await queryRunner.query(`ALTER TABLE "media_instance" DROP COLUMN IF EXISTS "imported_from"`);
    await queryRunner.query(
      `ALTER TABLE "media_instance" DROP COLUMN IF EXISTS "source_external_id"`,
    );
    await queryRunner.query(`
      ALTER TABLE "media_asset"
      DROP CONSTRAINT IF EXISTS "UQ_media_asset_family_sha256"
    `);
    await queryRunner.query(`
      ALTER TABLE "media_asset"
      ADD CONSTRAINT "UQ_media_asset_canonical_sha256" UNIQUE ("canonical_sha256")
    `);
  }
}
