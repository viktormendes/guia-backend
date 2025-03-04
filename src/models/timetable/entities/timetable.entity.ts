import { Discipline } from 'src/models/discipline/entities/discipline.entity';
import { Educator } from 'src/models/educator/entities/educator.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('timetable')
export class Timetable {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Discipline, (discipline) => discipline.timetables, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'discipline_id' })
  discipline: Discipline;

  @ManyToOne(() => Educator, (educator) => educator.timetables, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'educator_id' })
  educator: Educator | null;

  @Column({ type: 'varchar', length: 20 })
  days: string;

  @Column({ type: 'varchar', length: 20 })
  hours: string;
}
