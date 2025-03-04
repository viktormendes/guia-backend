/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablePrerequisite1741026143181
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`
            CREATE TABLE prerequisite (
                id SERIAL PRIMARY KEY,
                discipline_id INT NOT NULL,
                prerequisite_id INT NOT NULL,
                CONSTRAINT fk_discipline FOREIGN KEY (discipline_id) REFERENCES discipline(id) ON DELETE CASCADE,
                CONSTRAINT fk_prerequisite FOREIGN KEY (prerequisite_id) REFERENCES discipline(id) ON DELETE CASCADE
            );    
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE prerequisite;`);
  }
}
