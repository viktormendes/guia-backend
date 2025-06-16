import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateChatMessagesTable1743285383020
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE chat_messages (
        id SERIAL PRIMARY KEY,
        content TEXT NOT NULL,
        sender_id INTEGER NOT NULL REFERENCES "user"(id),
        help_id INTEGER NOT NULL REFERENCES help(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE chat_messages;`);
  }
}
