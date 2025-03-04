import { Module } from '@nestjs/common';
import { PrerequisiteService } from './prerequisite.service';
import { PrerequisiteController } from './prerequisite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Discipline } from '../discipline/entities/discipline.entity';
import { Prerequisite } from './entities/prerequisite.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Discipline, Prerequisite])],
  controllers: [PrerequisiteController],
  providers: [PrerequisiteService],
})
export class PrerequisiteModule {}
