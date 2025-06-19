import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddColumnsToHelp1744285383023 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "help" 
      ADD COLUMN IF NOT EXISTS "description" VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS "log" JSONB NULL,
      ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS "completed_at" TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS "cancelled_at" TIMESTAMP NULL,
      ADD COLUMN IF NOT EXISTS "cancellation_reason" VARCHAR(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "help" 
      DROP COLUMN IF EXISTS "description",
      DROP COLUMN IF EXISTS "log",
      DROP COLUMN IF EXISTS "started_at",
      DROP COLUMN IF EXISTS "completed_at",
      DROP COLUMN IF EXISTS "cancelled_at",
      DROP COLUMN IF EXISTS "cancellation_reason"
    `);
  }
}
