import { Module } from '@nestjs/common';
import { EducatorService } from './educator.service';
import { EducatorController } from './educator.controller';
import { Educator } from './entities/educator.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Educator])],
  controllers: [EducatorController],
  providers: [EducatorService],
})
export class EducatorModule {}
