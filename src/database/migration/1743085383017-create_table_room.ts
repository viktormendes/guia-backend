/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableRoom1743085383017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TYPE room_type AS ENUM (
        'Sala de Aula',
        'Laboratório',
        'Auditório',
        'Sala Docentes',
        'Administrativo'
      );

      CREATE TABLE room (
        id serial NOT NULL,
        description varchar(255) NOT NULL,
        floor int NOT NULL,
        capacity int NOT NULL,
        type room_type NOT NULL DEFAULT 'Sala de Aula',
        block_id int NOT NULL,
        CONSTRAINT room_pk PRIMARY KEY (id)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      DROP TABLE room;
      DROP TYPE room_type;
    `);
  }
}
