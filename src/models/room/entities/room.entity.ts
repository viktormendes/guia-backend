import { Block } from 'src/models/block/entities/block.entity';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Timetable } from '../../timetable/entities/timetable.entity';
import { RoomType } from '../enums/room-type.enum';

@Entity()
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  floor: number;

  @Column()
  capacity: number;

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.CLASSROOM,
  })
  type: RoomType;

  @Column({ name: 'block_id' })
  block_id: number;

  @ManyToOne(() => Block, (block) => block.rooms)
  @JoinColumn({ name: 'block_id' })
  block: Block;

  @OneToMany(() => Timetable, (timetable) => timetable.room)
  timetables: Timetable[];
}
