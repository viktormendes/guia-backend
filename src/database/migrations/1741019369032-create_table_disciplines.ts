/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableDisciplines1741019369032 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        CREATE TABLE discipline (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            semester INT NOT NULL,
            attended BOOLEAN DEFAULT FALSE,
            workload INT NOT NULL,
            type VARCHAR(10) NOT NULL,
            code VARCHAR(20) UNIQUE NOT NULL
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
        DROP TABLE discipline    
    `);
  }
}
