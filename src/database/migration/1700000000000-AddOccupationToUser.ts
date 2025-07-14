import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOccupationToUser1700000000000 implements MigrationInterface {
  name = 'AddOccupationToUser1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."occupation_enum" AS ENUM('professional', 'volunteer')
    `);

    await queryRunner.query(`
      ALTER TABLE "user" 
      ADD COLUMN "occupation" "public"."occupation_enum"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "occupation"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."occupation_enum"
    `);
  }
}
