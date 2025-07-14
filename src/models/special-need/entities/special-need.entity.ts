import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { SpecialNeedSubcategory } from './special-need-subcategory.entity';

@Entity('special_needs')
export class SpecialNeed {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(
    () => SpecialNeedSubcategory,
    (subcategory) => subcategory.specialNeed,
  )
  subcategories: SpecialNeedSubcategory[];
}
