/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableDisciplinePreRequisite1741020421196
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            CREATE TABLE discipline_pre_requisite (
                id SERIAL PRIMARY KEY,
                discipline_id INT REFERENCES discipline(id) ON DELETE CASCADE,
                pre_requisite_id INT REFERENCES discipline(id) ON DELETE CASCADE
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE discipline_pre_requisite`);
  }
}
