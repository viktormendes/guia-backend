import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateStudentProfileTable1700000000003
  implements MigrationInterface
{
  name = 'CreateStudentProfileTable1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar enum para Gender
    await queryRunner.query(`
      CREATE TYPE "public"."gender_enum" AS ENUM('male', 'female', 'other')
    `);

    // Criar enum para MaritalStatus
    await queryRunner.query(`
      CREATE TYPE "public"."marital_status_enum" AS ENUM('single', 'married', 'divorced', 'widowed', 'separated')
    `);

    // Criar enum para NeedDuration
    await queryRunner.query(`
      CREATE TYPE "public"."need_duration_enum" AS ENUM('permanent', 'temporary')
    `);

    // Criar tabela student_profiles
    await queryRunner.query(`
      CREATE TABLE "student_profiles" (
        "id" SERIAL NOT NULL,
        "user_id" integer NOT NULL,
        "phoneNumber" character varying(20),
        "cpf" character varying(14),
        "rg" character varying(20),
        "gender" "public"."gender_enum",
        "maritalStatus" "public"."marital_status_enum",
        "birthDate" date,
        "course" character varying(200),
        "enrollmentDate" date,
        "cep" character varying(9),
        "state" character varying(2),
        "city" character varying(100),
        "neighborhood" character varying(100),
        "street" character varying(200),
        "number" character varying(10),
        "complement" character varying(200),
        "special_need_id" integer,
        "special_need_subcategory_id" integer,
        "needDuration" "public"."need_duration_enum",
        "observations" text,
        "supportNotes" text,
        "isStudent" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_student_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_student_profiles" PRIMARY KEY ("id")
      )
    `);

    // Adicionar foreign keys
    await queryRunner.query(`
      ALTER TABLE "student_profiles" 
      ADD CONSTRAINT "FK_student_profiles_user" 
      FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "student_profiles" 
      ADD CONSTRAINT "FK_student_profiles_special_need" 
      FOREIGN KEY ("special_need_id") REFERENCES "special_needs"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "student_profiles" 
      ADD CONSTRAINT "FK_student_profiles_special_need_subcategory" 
      FOREIGN KEY ("special_need_subcategory_id") REFERENCES "special_needs_subcategories"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "student_profiles"`);
    await queryRunner.query(`DROP TYPE "public"."need_duration_enum"`);
    await queryRunner.query(`DROP TYPE "public"."marital_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."gender_enum"`);
  }
}
