import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../models/user/entities/user.entity';
import { HelpType } from '../../../models/help/enums/help-type.enum';

@Entity('helper_availability')
export class HelperAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  helper: User;

  @Column()
  helper_id: number;

  @Column({
    type: 'enum',
    enum: HelpType,
  })
  help_type: HelpType;

  @Column({ default: false })
  is_available: boolean;

  @Column({ default: 0 })
  missed_calls: number;

  @Column({ type: 'timestamp', nullable: true })
  last_available_at: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
