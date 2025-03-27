/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTypeToRoom1743185383018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TYPE room_type AS ENUM (
        'Sala de Aula',
        'Laboratório',
        'Auditório',
        'Sala Docentes',
        'Administrativo'
      );

      ALTER TABLE room
      ADD COLUMN type room_type NOT NULL DEFAULT 'Sala de Aula';
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      ALTER TABLE room
      DROP COLUMN type;

      DROP TYPE room_type;
    `);
  }
}
