import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateHelpTables1743185383019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE help_type AS ENUM ('chat', 'video_call', 'dispatch');
    `);

    await queryRunner.query(`
      CREATE TYPE help_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');
    `);

    await queryRunner.query(`
      CREATE TABLE help (
        id SERIAL PRIMARY KEY,
        type help_type NOT NULL DEFAULT 'chat',
        status help_status NOT NULL DEFAULT 'pending',
        student_id INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
        helper_id INT REFERENCES "user"(id) ON DELETE SET NULL,
        log JSONB,
        created_at TIMESTAMP NOT NULL DEFAULT now(),
        started_at TIMESTAMP,
        completed_at TIMESTAMP,
        cancelled_at TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT now()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE help`);
    await queryRunner.query(`DROP TYPE help_status`);
    await queryRunner.query(`DROP TYPE help_type`);
  }
}
