import { MigrationInterface, QueryRunner } from 'typeorm';

export class AlterAccuracyToDecimal1745000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_location" ALTER COLUMN "accuracy" TYPE decimal(10,6) USING accuracy::decimal`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_location" ALTER COLUMN "accuracy" TYPE int USING accuracy::integer`,
    );
  }
}
