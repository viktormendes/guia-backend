import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../models/user/entities/user.entity';
import { HelpStatus } from '../enums/help-status.enum';
import { HelpType } from '../enums/help-type.enum';

@Entity('help')
export class Help {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: HelpType,
    name: 'type',
  })
  help_type: HelpType;

  @Column({
    type: 'enum',
    enum: HelpStatus,
    default: HelpStatus.PENDING,
  })
  status: HelpStatus;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'cancellation_reason', nullable: true })
  cancellation_reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'student_id' })
  student: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'helper_id' })
  helper: User;

  @Column('jsonb', { nullable: true })
  log: {
    action: string;
    timestamp: Date;
    details?: any;
  }[];

  @Column({ name: 'started_at', nullable: true })
  startedAt: Date;

  @Column({ name: 'completed_at', nullable: true })
  completedAt: Date;

  @Column({ name: 'cancelled_at', nullable: true })
  cancelledAt: Date;
}
