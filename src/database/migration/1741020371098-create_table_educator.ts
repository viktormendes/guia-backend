/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableEducator1741020371098 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
      CREATE TABLE educator (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          lattes_link VARCHAR(255) NULL
      );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            DROP TABLE educator;    
        `);
  }
}
