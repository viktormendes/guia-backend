import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SpecialNeed } from './special-need.entity';

@Entity('special_needs_subcategories')
export class SpecialNeedSubcategory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'special_need_id' })
  specialNeedId: number;

  @ManyToOne(() => SpecialNeed, (specialNeed) => specialNeed.subcategories)
  @JoinColumn({ name: 'special_need_id' })
  specialNeed: SpecialNeed;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
