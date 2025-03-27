import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Educator } from '../educator/entities/educator.entity';
import { Discipline } from '../discipline/entities/discipline.entity';
import { Timetable } from './entities/timetable.entity';
import { Room } from '../room/entities/room.entity';
import { Block } from '../block/entities/block.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Discipline, Educator, Timetable, Room, Block]),
  ],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}
