import { Timetable } from 'src/models/timetable/entities/timetable.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';

@Entity('educator')
export class Educator {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string;

  @Column({ name: 'lattes_link', type: 'varchar', length: 255, unique: true })
  lattesLink: string;

  @OneToMany(() => Timetable, (timetable) => timetable.educator)
  timetables: Timetable[];
}
