import { MigrationInterface, QueryRunner } from 'typeorm';

export class SocialMemoriesRelationships1730000003000 implements MigrationInterface {
  name = 'SocialMemoriesRelationships1730000003000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "family_membership"
      ADD COLUMN IF NOT EXISTS "relationship" text NOT NULL DEFAULT 'self'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "family_invite" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "email" text NOT NULL,
        "invited_by_user_id" uuid NOT NULL,
        "relationship" text NOT NULL,
        "invite_token" uuid NOT NULL DEFAULT gen_random_uuid(),
        "accepted_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_family_invite" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_family_invite_family_email" UNIQUE ("family_id", "email"),
        CONSTRAINT "UQ_family_invite_token" UNIQUE ("invite_token"),
        CONSTRAINT "FK_family_invite_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_family_invite_user" FOREIGN KEY ("invited_by_user_id") REFERENCES "user_account"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "memory" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "author_user_id" uuid NOT NULL,
        "photo_path" text NOT NULL,
        "caption" text NOT NULL,
        "memory_date" date,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_memory" PRIMARY KEY ("id"),
        CONSTRAINT "FK_memory_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_memory_author" FOREIGN KEY ("author_user_id") REFERENCES "user_account"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_memory_family_created"
      ON "memory" ("family_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "memory_comment" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "memory_id" uuid NOT NULL,
        "author_user_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_memory_comment" PRIMARY KEY ("id"),
        CONSTRAINT "FK_memory_comment_memory" FOREIGN KEY ("memory_id") REFERENCES "memory"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_memory_comment_author" FOREIGN KEY ("author_user_id") REFERENCES "user_account"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_memory_comment_memory_created"
      ON "memory_comment" ("memory_id", "created_at" ASC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "memory_reaction" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "memory_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_memory_reaction" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_memory_reaction_memory_user" UNIQUE ("memory_id", "user_id"),
        CONSTRAINT "FK_memory_reaction_memory" FOREIGN KEY ("memory_id") REFERENCES "memory"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_memory_reaction_user" FOREIGN KEY ("user_id") REFERENCES "user_account"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "relationship_edge" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "family_id" uuid NOT NULL,
        "type" text NOT NULL,
        "from_person_id" uuid NOT NULL,
        "to_person_id" uuid NOT NULL,
        "start_date" date,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_relationship_edge" PRIMARY KEY ("id"),
        CONSTRAINT "FK_relationship_edge_family" FOREIGN KEY ("family_id") REFERENCES "family"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_relationship_edge_from" FOREIGN KEY ("from_person_id") REFERENCES "person"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_relationship_edge_to" FOREIGN KEY ("to_person_id") REFERENCES "person"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_relationship_edge_family"
      ON "relationship_edge" ("family_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "relationship_edge"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "memory_reaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "memory_comment"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "memory"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "family_invite"`);
    await queryRunner.query(`ALTER TABLE "family_membership" DROP COLUMN IF EXISTS "relationship"`);
  }
}
