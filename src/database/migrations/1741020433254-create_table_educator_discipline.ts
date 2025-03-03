/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableEducatorDiscipline1741020433254
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            CREATE TABLE educator_discipline (
                educator_id INT REFERENCES educator(id) ON DELETE CASCADE,
                discipline_id INT REFERENCES discipline(id) ON DELETE CASCADE,
                PRIMARY KEY (educator_id, discipline_id)
            );
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE educator_discipline`);
  }
}
