/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableTimetable1741020387277 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE timetable (
          id SERIAL PRIMARY KEY,
          discipline_id INT REFERENCES discipline(id) ON DELETE CASCADE,
          educator_id INT REFERENCES educator(id) ON DELETE SET NULL,
          days VARCHAR(20) NOT NULL,
          hours VARCHAR(20) NOT NULL
      );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE timetable`);
  }
}
