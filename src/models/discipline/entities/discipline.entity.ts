import { Prerequisite } from 'src/models/prerequisite/entities/prerequisite.entity';
import { Timetable } from 'src/models/timetable/entities/timetable.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('discipline')
export class Discipline {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'int' })
  semester: number;

  @Column({ type: 'int' })
  workload: number;

  @Column({ type: 'varchar', length: 10 })
  type: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  code: string;

  @OneToMany(() => Timetable, (timetable) => timetable.discipline)
  timetables: Timetable[];

  @OneToMany(() => Prerequisite, (prerequisite) => prerequisite.discipline)
  prerequisites: Prerequisite[];
}
