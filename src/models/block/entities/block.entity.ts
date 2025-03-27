import { Room } from 'src/models/room/entities/room.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { BlockStatus } from '../enums/block-status.enum';

@Entity()
export class Block {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  description: string;

  @Column()
  number_of_floors: number;

  @Column({
    type: 'enum',
    enum: BlockStatus,
    default: BlockStatus.ACTIVE,
  })
  status: BlockStatus;

  @OneToMany(() => Room, (room) => room.block)
  rooms!: Room[];
}
