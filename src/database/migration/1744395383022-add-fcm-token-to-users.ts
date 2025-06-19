import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddFcmTokenToUsers1744395383022 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN IF NOT EXISTS fcm_token VARCHAR(255) NULL,
      ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN fcm_token, DROP COLUMN updatedAt`,
    );
  }
}
