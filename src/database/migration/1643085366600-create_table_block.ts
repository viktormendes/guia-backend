/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableBlock1643085366600 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            CREATE TABLE block (
            id serial  NOT NULL,
            description varchar(255)  NOT NULL,
            number_of_floors int  NOT NULL,
            status varchar(255)  NOT NULL,
            CONSTRAINT block_pk PRIMARY KEY (id)
            );
            `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE block`);
  }
}
