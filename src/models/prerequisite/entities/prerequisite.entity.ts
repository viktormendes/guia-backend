import { Discipline } from 'src/models/discipline/entities/discipline.entity';
import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity('prerequisite')
export class Prerequisite {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Discipline, (discipline) => discipline.prerequisites, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'discipline_id' })
  discipline: Discipline;

  @ManyToOne(() => Discipline, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'prerequisite_id' })
  prerequisite: Discipline;
}
