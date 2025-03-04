/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { mockDisciplines } from 'mock/discipline';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTablePopulateDb1741122908588 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Mapeia o nome do educador para o ID
    const educators = new Map<string, number>();

    // Mapeia o código da disciplina para o ID
    const disciplineCodesToIds = new Map<string, number>();

    // Inserir educadores primeiro
    for (const discipline of mockDisciplines) {
      for (const timetable of discipline.timetables) {
        if (!educators.has(timetable.teacher)) {
          const result = await queryRunner.query(
            `INSERT INTO educator (name) VALUES ($1) RETURNING id`,
            [timetable.teacher],
          );
          educators.set(timetable.teacher, result[0].id);
        }
      }
    }

    // Inserir disciplinas
    for (const discipline of mockDisciplines) {
      const result = await queryRunner.query(
        `INSERT INTO discipline (name, semester, workload, type, code) VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        [
          discipline.name,
          discipline.semester,
          discipline.workload,
          discipline.type,
          discipline.code,
        ],
      );
      const disciplineId = result[0].id;

      // Mapear o código da disciplina para o ID
      disciplineCodesToIds.set(discipline.code, disciplineId);

      // Inserir horários (timetables)
      for (const timetable of discipline.timetables) {
        const educatorId = educators.get(timetable.teacher);
        await queryRunner.query(
          `INSERT INTO timetable (discipline_id, educator_id, days, hours) VALUES ($1, $2, $3, $4)`,
          [disciplineId, educatorId, timetable.days, timetable.hours],
        );
      }
    }

    // Inserir pré-requisitos
    for (const discipline of mockDisciplines) {
      const disciplineId = disciplineCodesToIds.get(discipline.code);

      for (const prerequisiteCode of discipline.pre_requiriments) {
        const prerequisiteId = disciplineCodesToIds.get(prerequisiteCode);
        if (prerequisiteId) {
          await queryRunner.query(
            `INSERT INTO prerequisite (discipline_id, prerequisite_id) VALUES ($1, $2)`,
            [disciplineId, prerequisiteId],
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM prerequisite`);
    await queryRunner.query(`DELETE FROM timetable`);
    await queryRunner.query(`DELETE FROM discipline`);
    await queryRunner.query(`DELETE FROM educator`);
  }
}
