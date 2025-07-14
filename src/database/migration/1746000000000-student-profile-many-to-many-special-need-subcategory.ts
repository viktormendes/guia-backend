import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentProfileManyToManySpecialNeedSubcategory1746000000000
  implements MigrationInterface
{
  name = 'StudentProfileManyToManySpecialNeedSubcategory1746000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Remover FKs e colunas antigas
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT IF EXISTS "FK_student_profiles_special_need"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP CONSTRAINT IF EXISTS "FK_student_profiles_special_need_subcategory"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP COLUMN IF EXISTS "special_need_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" DROP COLUMN IF EXISTS "special_need_subcategory_id"`,
    );

    // Criar tabela de junção ManyToMany
    await queryRunner.query(`
      CREATE TABLE "student_profile_special_need_subcategory" (
        "student_profile_id" integer NOT NULL,
        "special_need_subcategory_id" integer NOT NULL,
        CONSTRAINT "PK_student_profile_special_need_subcategory" PRIMARY KEY ("student_profile_id", "special_need_subcategory_id"),
        CONSTRAINT "FK_student_profile_special_need_subcategory_profile" FOREIGN KEY ("student_profile_id") REFERENCES "student_profiles"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_profile_special_need_subcategory_subcategory" FOREIGN KEY ("special_need_subcategory_id") REFERENCES "special_needs_subcategories"("id") ON DELETE CASCADE
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "student_profile_special_need_subcategory"`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD COLUMN "special_need_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD COLUMN "special_need_subcategory_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_student_profiles_special_need" FOREIGN KEY ("special_need_id") REFERENCES "special_needs"("id") ON DELETE SET NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "student_profiles" ADD CONSTRAINT "FK_student_profiles_special_need_subcategory" FOREIGN KEY ("special_need_subcategory_id") REFERENCES "special_needs_subcategories"("id") ON DELETE SET NULL`,
    );
  }
}
