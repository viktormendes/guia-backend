import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSpecialNeedsTables1741218438019
  implements MigrationInterface
{
  name = 'CreateSpecialNeedsTables1741218438019';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar tabela special_needs
    await queryRunner.query(`
      CREATE TABLE "special_needs" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_special_needs_name" UNIQUE ("name"),
        CONSTRAINT "PK_special_needs" PRIMARY KEY ("id")
      )
    `);

    // Criar tabela special_needs_subcategories
    await queryRunner.query(`
      CREATE TABLE "special_needs_subcategories" (
        "id" SERIAL NOT NULL,
        "name" character varying(100) NOT NULL,
        "description" text,
        "special_need_id" integer NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_special_needs_subcategories" PRIMARY KEY ("id")
      )
    `);

    // Adicionar foreign key
    await queryRunner.query(`
      ALTER TABLE "special_needs_subcategories" 
      ADD CONSTRAINT "FK_special_needs_subcategories_special_need" 
      FOREIGN KEY ("special_need_id") REFERENCES "special_needs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    // Popular dados iniciais
    await queryRunner.query(`
      INSERT INTO "special_needs" ("name", "description") VALUES
      ('Deficiência Física', 'Deficiência que afeta a mobilidade física'),
      ('Deficiência Visual', 'Deficiência que afeta a visão'),
      ('Deficiência Auditiva', 'Deficiência que afeta a audição'),
      ('Deficiência Intelectual', 'Deficiência que afeta o desenvolvimento intelectual'),
      ('Transtorno do Espectro Autista', 'Condição neurológica que afeta o desenvolvimento'),
      ('Deficiência Psicossocial', 'Condições mentais que afetam o comportamento e a interação social'),
      ('Condições Neurológicas Específicas', 'Condições neurológicas específicas que causam limitações'),
      ('Doenças Crônicas ou Degenerativas', 'Condições crônicas ou progressivas que afetam a funcionalidade'),
      ('Condições Temporárias ou Pós-Cirúrgicas', 'Condições temporárias decorrentes de cirurgias ou tratamentos'),
      ('Outras Necessidades Especiais', 'Outras condições ou necessidades não categorizadas')
    `);

    // Popular subcategorias
    await queryRunner.query(`
      INSERT INTO "special_needs_subcategories" ("name", "description", "special_need_id") VALUES
      ('Cadeirante Permanente', 'Usuário de cadeira de rodas de forma permanente', 1),
      ('Cadeirante Temporário', 'Usuário de cadeira de rodas temporariamente', 1),
      ('Amputado', 'Pessoa com amputação de membros', 1),
      ('Paraplegia', 'Paralisia dos membros inferiores', 1),
      ('Tetraplegia', 'Paralisia dos quatro membros', 1),
      ('Baixa Visão', 'Pessoa com visão reduzida', 2),
      ('Cego', 'Pessoa sem visão', 2),
      ('Surdo', 'Pessoa sem audição', 3),
      ('Surdo Mudo', 'Pessoa sem audição e fala', 3),
      ('Implante Coclear', 'Pessoa com implante coclear para audição', 3),
      ('Deficiência Intelectual Leve', 'Deficiência intelectual de grau leve', 4),
      ('Deficiência Intelectual Moderada', 'Deficiência intelectual de grau moderado', 4),
      ('Deficiência Intelectual Severa', 'Deficiência intelectual de grau severo', 4),
      ('TEA Leve', 'Transtorno do Espectro Autista de grau leve', 5),
      ('TEA Moderado', 'Transtorno do Espectro Autista de grau moderado', 5),
      ('TEA Severo', 'Transtorno do Espectro Autista de grau severo', 5),
      ('Transtorno Bipolar', 'Condição mental com alterações extremas de humor', 6),
      ('Esquizofrenia', 'Condição mental que afeta percepção e comportamento', 6),
      ('Transtorno Obsessivo-Compulsivo', 'Condição mental caracterizada por obsessões e compulsões', 6),
      ('Síndrome de Down', 'Condição genética que afeta desenvolvimento físico e intelectual', 7),
      ('Paralisia Cerebral', 'Condição neurológica que afeta movimento e coordenação', 7),
      ('Epilepsia', 'Condição neurológica caracterizada por convulsões', 7),
      ('Esclerose Múltipla', 'Doença crônica que afeta o sistema nervoso central', 8),
      ('Distrofia Muscular', 'Doença progressiva que causa fraqueza muscular', 8),
      ('Artrite Reumatoide', 'Doença crônica que afeta as articulações', 8),
      ('Pós-Cirúrgico Ortopédico', 'Recuperação de cirurgias ortopédicas, como fraturas ou próteses', 9),
      ('Pós-Cirúrgico Geral', 'Recuperação de cirurgias gerais, como abdominais ou cardíacas', 9),
      ('Condição Temporária por Trauma', 'Limitações temporárias devido a traumas físicos', 9),
      ('Outras', 'Outras condições ou necessidades específicas', 10)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "special_needs_subcategories"`);
    await queryRunner.query(`DROP TABLE "special_needs"`);
  }
}
