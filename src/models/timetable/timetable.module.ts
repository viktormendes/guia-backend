import { Module } from '@nestjs/common';
import { TimetableService } from './timetable.service';
import { TimetableController } from './timetable.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Educator } from '../educator/entities/educator.entity';
import { Discipline } from '../discipline/entities/discipline.entity';
import { Timetable } from './entities/timetable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discipline, Educator, Timetable])],
  controllers: [TimetableController],
  providers: [TimetableService],
})
export class TimetableModule {}
