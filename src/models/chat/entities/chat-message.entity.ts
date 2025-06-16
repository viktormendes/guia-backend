import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../models/user/entities/user.entity';
import { Help } from '../../help/entities/help.entity';

@Entity('chat_messages')
export class ChatMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @ManyToOne(() => Help)
  @JoinColumn({ name: 'help_id' })
  help: Help;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
